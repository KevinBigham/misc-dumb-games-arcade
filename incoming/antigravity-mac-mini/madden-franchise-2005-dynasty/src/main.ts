import { broadcastAudio } from './audio/broadcast-audio';
import {
  clearSavedFranchiseState,
  createNewFranchiseState,
  loadFranchiseState,
  saveFranchiseState,
  updateOwnerPricing,
  upgradeCoachStaffMember,
} from './engine/franchise-state';
import {
  commitLiveGameToFranchise,
  createLiveGameState,
  DEFENSIVE_PLAYBOOK,
  executeLiveGamePlay,
  formatClock,
  OFFENSIVE_PLAYBOOK,
  simLiveGameDrive,
  simulateScheduledGame,
} from './engine/game-simulator';
import {
  calculateMarketContract,
  getPlayerCapHitM,
  getReleaseCapPenaltyM,
  getTeamCapRoomM,
  getTeamCapUsedM,
  getTeamRatings,
} from './engine/rosters-and-generator';
import {
  getConferencePlayoffSeeds,
  getPowerRankings,
  sortTeamsForStandings,
} from './engine/schedule-and-standings';
import { answerTonyBrunoPoll } from './engine/storyline-central';
import {
  advanceFranchiseWeekOrStage,
  applyFranchiseTagToPlayer,
  changePlayerDepthOrder,
  evaluateContractOffer,
  evaluateTradeProposal,
  executeTradeProposal,
  executeTrainingCampDrill,
  getDraftPickTradeValue,
  getPlayerTradeValue,
  makeDraftSelection,
  releasePlayerToFreeAgency,
  scoutDraftProspect,
  signOrExtendPlayerContract,
  simCpuDraftPicksUntilUserTurn,
  simCurrentWeekGames,
  simRemainderOfDraft,
  TRAINING_CAMP_DRILLS,
} from './engine/trades-contracts-offseason';
import {
  DefensivePlayId,
  Division,
  FranchiseState,
  LiveGameState,
  OffensivePlayId,
  Player,
  Position,
  PreSnapDefenseAdjustment,
  PreSnapOffenseAdjustment,
  ScheduledGame,
} from './models/types';
import { TacticalFieldCanvas } from './ui/field-canvas';

// ============================================================================
// 1. MODERN WEB GUIDANCE POLYFILLS & TOP-LAYER HELPERS
// ============================================================================

if (typeof window !== 'undefined') {
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    import('invokers-polyfill').catch(() => {});
  }
  if (!('popover' in HTMLElement.prototype)) {
    import('@oddbird/popover-polyfill').catch(() => {});
  }
}

let supportsDisplayTransition: boolean | undefined;
function canTransitionDisplay(): boolean {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (
    typeof window === 'undefined' ||
    !window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText =
    'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.CSS?.supports?.('overlay', 'auto')) &&
    canTransitionDisplay()
  );
}

async function closeTopLayer(dialog: HTMLDialogElement): Promise<void> {
  if (!supportsTopLayerExit()) {
    dialog.setAttribute('data-closing', '');
    const animations = dialog.getAnimations?.({ subtree: true }) ?? [];
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 400)),
      ]);
    }
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
  }
  dialog.close();
}

function setupDialogFallbacks(): void {
  const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog');
  dialogs.forEach((dialog) => {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      void closeTopLayer(dialog);
    });
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });
  });

  if (
    typeof HTMLDialogElement !== 'undefined' &&
    !('closedBy' in HTMLDialogElement.prototype)
  ) {
    const outside = (e: PointerEvent, dialog: HTMLDialogElement) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };
    for (const dialog of document.querySelectorAll<HTMLDialogElement>(
      'dialog[closedby="any"]',
    )) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) {
          void closeTopLayer(dialog);
        }
      });
    }
  }
}

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================

let state: FranchiseState =
  loadFranchiseState() ?? createNewFranchiseState('BAL', 2005);
let activeTab: 'STORYLINE' | 'GAMEDAY' | 'ROSTER' | 'TRADE' | 'STANDINGS' | 'OWNER' =
  'STORYLINE';
let liveGame: LiveGameState | null = null;
let fieldRenderer: TacticalFieldCanvas | null = null;

// Trade selection state
let selectedTradeCpuTeamId =
  state.teams.find((t) => t.id !== state.userTeamId)?.id ?? 'PIT';
const selectedUserPlayerIds = new Set<string>();
const selectedUserPickIds = new Set<string>();
const selectedCpuPlayerIds = new Set<string>();
const selectedCpuPickIds = new Set<string>();

let toastTimer: number | null = null;

function showToast(heading: string, message: string): void {
  const banner = document.getElementById('toast-alert');
  const hEl = document.getElementById('toast-heading');
  const mEl = document.getElementById('toast-message');
  if (!banner || !hEl || !mEl) return;

  hEl.textContent = heading;
  mEl.textContent = message;
  banner.hidden = false;

  if (toastTimer !== null) {
    window.clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    banner.hidden = true;
  }, 4600);
}

function persistAndRender(): void {
  saveFranchiseState(state);
  renderAll();
}

function switchTab(
  tab: 'STORYLINE' | 'GAMEDAY' | 'ROSTER' | 'TRADE' | 'STANDINGS' | 'OWNER',
): void {
  activeTab = tab;
  document.querySelectorAll<HTMLButtonElement>('.nav-tab').forEach((btn) => {
    const isTarget = btn.dataset.tab === tab;
    btn.classList.toggle('is-active', isTarget);
    if (isTarget) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  const views = ['STORYLINE', 'GAMEDAY', 'ROSTER', 'TRADE', 'STANDINGS', 'OWNER'];
  views.forEach((v) => {
    const section = document.getElementById(`view-${v}`);
    if (section) {
      section.hidden = v !== tab;
    }
  });

  if (tab === 'GAMEDAY') {
    ensureLiveGameReady();
    renderGameDayView();
  } else {
    renderAll();
  }
}

// ============================================================================
// 3. TOP HEADER & TELEMETRY RENDERER
// ============================================================================

function getPhaseDisplayLabel(): string {
  switch (state.phase) {
    case 'REGULAR_SEASON':
      return `${state.season} SEASON • WEEK ${state.week}`;
    case 'PLAYOFFS': {
      const roundNames: Record<number, string> = {
        18: 'WILD CARD PLAYOFFS',
        19: 'DIVISIONAL PLAYOFFS',
        20: 'CONFERENCE CHAMPIONSHIPS',
        21: 'CHAMPIONSHIP BOWL XL',
      };
      return `${state.season} • ${roundNames[state.week] ?? 'PLAYOFFS'}`;
    }
    case 'OFFSEASON_AWARDS':
      return `${state.season} OFFSEASON 1/5 • AWARDS & RETIREMENTS`;
    case 'OFFSEASON_RESIGN':
      return `${state.season} OFFSEASON 2/5 • RE-SIGN & FRANCHISE TAG`;
    case 'OFFSEASON_FREE_AGENCY':
      return `${state.season} OFFSEASON 3/5 • FREE AGENCY`;
    case 'OFFSEASON_DRAFT':
      return `${state.season} OFFSEASON 4/5 • NFL ROOKIE DRAFT`;
    case 'OFFSEASON_TRAINING_CAMP':
      return `${state.season} OFFSEASON 5/5 • TRAINING CAMP DRILLS`;
  }
}

function renderHeader(): void {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;
  const ratings = getTeamRatings(userTeam.id, state.players);
  const capRoom = getTeamCapRoomM(userTeam, state.players, state.salaryCapM);
  const roster = state.players.filter((p) => p.teamId === userTeam.id);
  const avgMorale =
    roster.length > 0
      ? Math.round(roster.reduce((s, p) => s + p.morale, 0) / roster.length)
      : 80;

  document.documentElement.style.setProperty(
    '--team-primary',
    userTeam.primaryColor,
  );
  document.documentElement.style.setProperty(
    '--team-secondary',
    userTeam.secondaryColor,
  );

  const crest = document.getElementById('header-team-crest');
  if (crest) crest.textContent = userTeam.abbr;

  const nameEl = document.getElementById('header-team-name');
  if (nameEl) nameEl.textContent = `${userTeam.city} ${userTeam.name}`;

  const recEl = document.getElementById('header-team-record');
  if (recEl) {
    recEl.textContent = `(${userTeam.wins}-${userTeam.losses}${userTeam.ties > 0 ? `-${userTeam.ties}` : ''})`;
  }

  const phaseEl = document.getElementById('header-phase-pill');
  if (phaseEl) phaseEl.textContent = getPhaseDisplayLabel();

  const ovrEl = document.getElementById('vital-ovr');
  if (ovrEl) {
    ovrEl.textContent = `${ratings.overall} (${ratings.offense} / ${ratings.defense})`;
  }

  const capEl = document.getElementById('vital-cap');
  if (capEl) {
    capEl.textContent = `$${capRoom.toFixed(2)}M`;
    capEl.className = `vital-value ${capRoom >= 2 ? 'cap-good' : 'cap-warn'}`;
  }

  const cashEl = document.getElementById('vital-cash');
  if (cashEl) cashEl.textContent = `$${userTeam.finances.ownerCashM.toFixed(2)}M`;

  const fansEl = document.getElementById('vital-fans');
  if (fansEl) fansEl.textContent = `${userTeam.fanSupport}%`;

  const moraleEl = document.getElementById('vital-morale');
  if (moraleEl) moraleEl.textContent = `${avgMorale}%`;

  const unreadCount = state.pdaInbox.filter((e) => !e.read).length;
  const unreadBadge = document.getElementById('badge-unread-pda');
  if (unreadBadge) {
    unreadBadge.textContent = String(unreadCount);
    unreadBadge.hidden = unreadCount === 0;
  }

  const advBtn = document.getElementById('btn-advance-week');
  if (advBtn) {
    if (state.phase === 'REGULAR_SEASON' || state.phase === 'PLAYOFFS') {
      advBtn.textContent = `ADVANCE TO NEXT WEEK ▶`;
    } else if (state.phase === 'OFFSEASON_TRAINING_CAMP') {
      advBtn.textContent = `LAUNCH ${state.season + 1} REGULAR SEASON ▶`;
    } else {
      advBtn.textContent = `NEXT OFFSEASON STAGE ▶`;
    }
  }
}

// ============================================================================
// 4. VIEW 1: STORYLINE CENTRAL RENDERER
// ============================================================================

function getUserWeekGame(): ScheduledGame | undefined {
  return state.schedule.find(
    (g) =>
      g.season === state.season &&
      g.week === state.week &&
      (g.homeTeamId === state.userTeamId || g.awayTeamId === state.userTeamId),
  );
}

function renderStorylineCentral(): void {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;
  const weekLabel = document.getElementById('story-week-label');
  if (weekLabel) weekLabel.textContent = getPhaseDisplayLabel();

  // 1. Matchup Spotlight Card
  const matchupCard = document.getElementById('story-matchup-card');
  if (matchupCard) {
    const userGame = getUserWeekGame();
    if (
      state.phase !== 'REGULAR_SEASON' &&
      state.phase !== 'PLAYOFFS'
    ) {
      matchupCard.innerHTML = `
        <div class="eyebrow-row">
          <span class="era-badge">OFFSEASON HEADQUARTERS ACTIVE</span>
        </div>
        <h3 style="margin-block-end:0.35rem">${getPhaseDisplayLabel()}</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary)">
          Manage your dynasty's offseason pipeline in the Roster/FA and Trades/Draft/Camp tabs, or click Advance to proceed to the next stage.
        </p>
        <div class="matchup-actions-row">
          <button type="button" class="madden-btn primary-cta" data-goto-tab="TRADE">
            OPEN OFFSEASON / DRAFT / CAMP HUB
          </button>
          <button type="button" class="madden-btn" data-goto-tab="ROSTER">
            OPEN ROSTER &amp; CONTRACTS
          </button>
        </div>
      `;
    } else if (!userGame) {
      matchupCard.innerHTML = `
        <div class="eyebrow-row">
          <span class="era-badge">${state.phase === 'PLAYOFFS' ? 'PLAYOFF ROUND' : `WEEK ${state.week} BYE WEEK`}</span>
        </div>
        <h3 style="margin-block-end:0.35rem">${userTeam.city} ${userTeam.name} ${state.phase === 'PLAYOFFS' ? 'Observer / Bye' : 'Rest & Scouting Bye Week'}</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary)">
          Your injured players recover +1 week during the Bye. Review Storyline Central or simulate the rest of the league's Week ${state.week} games!
        </p>
        <div class="matchup-actions-row">
          <button type="button" class="madden-btn primary-cta" id="btn-story-advance">
            SIMULATE WEEK ${state.week} &amp; ADVANCE ▶
          </button>
          <button type="button" class="madden-btn" data-goto-tab="GAMEDAY">
            LAUNCH SCRIMMAGE ON LIVE FIELD
          </button>
        </div>
      `;
    } else {
      const home = state.teams.find((t) => t.id === userGame.homeTeamId)!;
      const away = state.teams.find((t) => t.id === userGame.awayTeamId)!;
      const homeRat = getTeamRatings(home.id, state.players);
      const awayRat = getTeamRatings(away.id, state.players);

      if (userGame.played) {
        matchupCard.innerHTML = `
          <div class="eyebrow-row">
            <span class="era-badge">FINAL BOX SCORE // WEEK ${userGame.week}</span>
          </div>
          <div class="matchup-teams-row">
            <div class="matchup-team-pill">
              <strong>${away.city} ${away.name} (${away.wins}-${away.losses})</strong>
              <span>FINAL SCORE: <b style="color:var(--color-gold-bright)">${userGame.awayScore}</b> (${userGame.awayYards ?? 310} YDS)</span>
            </div>
            <span class="vs-circle">FINAL</span>
            <div class="matchup-team-pill" style="text-align:end">
              <strong>${home.city} ${home.name} (${home.wins}-${home.losses})</strong>
              <span>FINAL SCORE: <b style="color:var(--color-gold-bright)">${userGame.homeScore}</b> (${userGame.homeYards ?? 325} YDS)</span>
            </div>
          </div>
          <p style="font-size:0.8rem;color:var(--color-cyan)">
            🏆 Game MVP: <strong>${userGame.mvpPlayerName ?? 'Team Effort'}</strong> — ${userGame.mvpSummary ?? ''}
          </p>
          <div class="matchup-actions-row">
            <button type="button" class="madden-btn primary-cta" id="btn-story-advance">
              ADVANCE TO NEXT WEEK ▶
            </button>
          </div>
        `;
      } else {
        matchupCard.innerHTML = `
          <div class="eyebrow-row">
            <span class="era-badge">${userGame.stage === 'REG' ? `WEEK ${userGame.week} FEATURED MATCHUP` : `PLAYOFF MATCHUP (${userGame.stage})`} • ${home.stadiumName}</span>
          </div>
          <div class="matchup-teams-row">
            <div class="matchup-team-pill">
              <strong>${away.city} ${away.name} (${away.wins}-${away.losses})</strong>
              <span>OVR ${awayRat.overall} • ${away.offenseScheme}</span>
            </div>
            <span class="vs-circle">@</span>
            <div class="matchup-team-pill" style="text-align:end">
              <strong>${home.city} ${home.name} (${home.wins}-${home.losses})</strong>
              <span>OVR ${homeRat.overall} • ${home.defenseScheme}</span>
            </div>
          </div>
          <div class="matchup-actions-row">
            <button type="button" class="madden-btn primary-cta" id="btn-play-live-matchup">
              🎮 PLAY LIVE ON 2D FIELD
            </button>
            <button type="button" class="madden-btn" id="btn-instant-sim-matchup">
              ⚡ INSTANT SIM GAME
            </button>
          </div>
        `;
      }
    }
  }

  // 2. PDA Inbox
  const inboxEl = document.getElementById('pda-inbox-list');
  if (inboxEl) {
    inboxEl.innerHTML = state.pdaInbox
      .slice(0, 14)
      .map(
        (msg) => `
        <article class="pda-email-item ${msg.read ? '' : 'is-unread'}">
          <div class="pda-meta">
            <span><strong>[${msg.senderRole}]</strong> ${msg.senderName}</span>
            <span>${msg.season} • Wk ${msg.week}</span>
          </div>
          <div class="pda-subject">${msg.subject}</div>
          <p class="pda-body">${msg.body}</p>
          <div style="margin-block-start:0.45rem;display:flex;gap:0.4rem">
            ${
              !msg.read
                ? `<button type="button" class="madden-btn small-btn" data-read-email="${msg.id}">Mark Read</button>`
                : ''
            }
            ${
              msg.actionTab && msg.actionTab !== 'STORYLINE'
                ? `<button type="button" class="madden-btn small-btn" data-goto-tab="${msg.actionTab}">Open ${msg.actionTab}</button>`
                : ''
            }
          </div>
        </article>
      `,
      )
      .join('');
  }

  // 3. Newspaper Front Page Preview
  const paperPreview = document.getElementById('story-newspaper-preview');
  const latestPaper = state.newspapers[0];
  if (paperPreview && latestPaper) {
    paperPreview.innerHTML = `
      <div class="paper-masthead">
        <strong>${latestPaper.localPaperTitle}</strong>
        <span>${latestPaper.season} • WEEK ${latestPaper.week} EDITION</span>
      </div>
      <h3 class="paper-headline">${latestPaper.localHeadline}</h3>
      <p class="paper-subhead">${latestPaper.localSubhead}</p>
      <p class="paper-body">${latestPaper.localBody}</p>
      <div class="paper-quote-box">
        <strong>LOCKER ROOM BEAT:</strong> ${latestPaper.localMoraleSpotlight}
      </div>
      <div style="margin-block-start:0.65rem;padding-block-start:0.5rem;border-block-start:1px solid #a1a1aa;font-family:var(--font-sans);font-size:0.76rem;color:#27272a">
        <strong>NATIONAL (USA TODAY):</strong> ${latestPaper.nationalHeadline}
      </div>
    `;
  }

  // 4. Morale Watchlist
  const moraleWatch = document.getElementById('story-morale-watch');
  if (moraleWatch) {
    const teamPlayers = state.players
      .filter((p) => p.teamId === state.userTeamId)
      .sort((a, b) => a.morale - b.morale || b.overall - a.overall)
      .slice(0, 7);

    moraleWatch.innerHTML = teamPlayers
      .map((p) => {
        const icon =
          p.morale >= 85 ? '😊' : p.morale >= 68 ? '😐' : '😠';
        const trendArrow =
          p.moraleTrend === 'UP' ? '▲' : p.moraleTrend === 'DOWN' ? '▼' : '•';
        return `
          <div class="morale-row">
            <div>
              <strong>${icon} ${p.position} #${p.jerseyNumber} ${p.firstName} ${p.lastName} (${p.overall} OVR)</strong>
              <div style="font-size:0.74rem;color:var(--text-secondary)">${p.moraleReason}</div>
            </div>
            <div style="text-align:end">
              <strong style="color:${p.morale >= 80 ? '#4ade80' : p.morale >= 65 ? '#fbbf24' : '#f87171'}">
                ${p.morale}% ${trendArrow}
              </strong>
              <div>
                <button type="button" class="madden-btn small-btn" data-open-player="${p.id}">
                  Player Card
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // 5. Tony Bruno Radio Preview
  const radioPreview = document.getElementById('story-radio-preview');
  const latestRadio = state.radioSegments[0];
  if (radioPreview && latestRadio) {
    radioPreview.innerHTML = `
      <span class="on-air-pill">🎙️ ON AIR • ${latestRadio.topicBadge}</span>
      <p class="radio-quote"><strong>Tony Bruno:</strong> "${latestRadio.tonyMonologue}"</p>
      <div class="caller-bubble">
        <strong>Caller ${latestRadio.callerName} (${latestRadio.callerCity}):</strong> "${latestRadio.callerQuote}"
      </div>
      <div style="font-size:0.78rem;font-weight:800;color:var(--color-gold)">
        ${latestRadio.pollQuestion}
      </div>
      <div class="poll-options-stack">
        ${latestRadio.pollOptions
          .map(
            (opt) => `
          <button
            type="button"
            class="poll-option-btn"
            data-radio-seg="${latestRadio.id}"
            data-radio-opt="${opt.id}"
            ${latestRadio.selectedOptionId ? 'disabled' : ''}
          >
            <strong>${latestRadio.selectedOptionId === opt.id ? '✅ ' : '📻 '}${opt.label}</strong>
            <div style="font-size:0.7rem;color:var(--color-cyan)">${opt.effectDescription}</div>
          </button>
        `,
          )
          .join('')}
      </div>
    `;
  }

  // 6. Week Scoreboard
  const scoreboardEl = document.getElementById('story-week-scoreboard');
  if (scoreboardEl) {
    const weekGames = state.schedule.filter(
      (g) => g.season === state.season && g.week === state.week,
    );
    scoreboardEl.innerHTML = weekGames
      .map((g) => {
        const home = state.teams.find((t) => t.id === g.homeTeamId)!;
        const away = state.teams.find((t) => t.id === g.awayTeamId)!;
        const isUser =
          home.id === state.userTeamId || away.id === state.userTeamId;
        return `
          <div class="scoreboard-row" style="${isUser ? 'border-color:var(--color-gold)' : ''}">
            <div>
              <strong>${away.abbr} (${away.wins}-${away.losses}) @ ${home.abbr} (${home.wins}-${home.losses})</strong>
              ${
                g.played
                  ? `<div style="font-size:0.72rem;color:var(--color-cyan)">MVP: ${g.mvpPlayerName ?? ''}</div>`
                  : `<div style="font-size:0.72rem;color:var(--text-muted)">${home.stadiumName}</div>`
              }
            </div>
            <div>
              ${
                g.played
                  ? `<strong style="font-family:var(--font-mono);color:var(--color-gold-bright)">${away.abbr} ${g.awayScore} - ${home.abbr} ${g.homeScore}</strong>`
                  : `<button type="button" class="madden-btn small-btn" data-sim-single-game="${g.id}">Sim Game</button>`
              }
            </div>
          </div>
        `;
      })
      .join('');
  }

  renderNewspaperDialog();
  renderRadioDialog();
}

function renderNewspaperDialog(): void {
  const body = document.getElementById('newspaper-dialog-body');
  if (!body) return;
  const issue = state.newspapers[0];
  if (!issue) return;

  body.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem">
      <div class="newspaper-preview-card">
        <div class="paper-masthead">
          <strong>${issue.localPaperTitle}</strong>
          <span>LOCAL BEAT • WK ${issue.week}</span>
        </div>
        <h3 class="paper-headline">${issue.localHeadline}</h3>
        <p class="paper-subhead">${issue.localSubhead}</p>
        <p class="paper-body">${issue.localBody}</p>
        <div class="paper-quote-box">
          <strong>MORALE SPOTLIGHT:</strong> ${issue.localMoraleSpotlight}
        </div>
      </div>

      <div class="newspaper-preview-card">
        <div class="paper-masthead">
          <strong>${issue.nationalPaperTitle}</strong>
          <span>NATIONAL • WK ${issue.week}</span>
        </div>
        <h3 class="paper-headline">${issue.nationalHeadline}</h3>
        <p class="paper-subhead">${issue.nationalSubhead}</p>
        <p class="paper-body">${issue.nationalBody}</p>
        <div class="paper-quote-box">
          <div><strong>OFFENSIVE PLAYER OF THE WEEK:</strong> ${issue.offensivePlayerOfWeek}</div>
          <div style="margin-block-start:0.35rem"><strong>DEFENSIVE PLAYER OF THE WEEK:</strong> ${issue.defensivePlayerOfWeek}</div>
        </div>
      </div>
    </div>
  `;
}

function renderRadioDialog(): void {
  const body = document.getElementById('radio-dialog-body');
  if (!body) return;
  const seg = state.radioSegments[0];
  if (!seg) return;

  body.innerHTML = `
    <div class="radio-preview-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-block-end:0.65rem">
        <span class="on-air-pill">🎙️ ${seg.showTitle}</span>
        <button type="button" class="madden-btn small-btn" id="btn-play-radio-jingle">
          🔊 Play Studio Bumper Jingle
        </button>
      </div>
      <p class="radio-quote"><strong>Tony Bruno:</strong> "${seg.tonyMonologue}"</p>
      <div class="caller-bubble">
        <strong>Caller ${seg.callerName} from ${seg.callerCity}:</strong> "${seg.callerQuote}"
      </div>
      <p class="radio-quote"><strong>Tony Bruno:</strong> "${seg.tonyRebuttal}"</p>
      ${
        seg.guestInterviewName
          ? `<div class="caller-bubble"><strong>Player Interview — ${seg.guestInterviewName}:</strong> ${seg.guestInterviewQuote}</div>`
          : ''
      }
      <h3 class="section-subheading">${seg.pollQuestion}</h3>
      <div class="poll-options-stack">
        ${seg.pollOptions
          .map(
            (opt) => `
          <button
            type="button"
            class="poll-option-btn"
            data-radio-seg="${seg.id}"
            data-radio-opt="${opt.id}"
            ${seg.selectedOptionId ? 'disabled' : ''}
          >
            <strong>${seg.selectedOptionId === opt.id ? '✅ SELECTED: ' : '📞 CALL IN: '}${opt.label}</strong>
            <div style="font-size:0.74rem;color:var(--color-cyan)">${opt.effectDescription}</div>
          </button>
        `,
          )
          .join('')}
      </div>
    </div>
  `;
}

// ============================================================================
// 5. VIEW 2: GAME DAY LIVE BROADCAST & 2D TACTICAL FIELD
// ============================================================================

function ensureLiveGameReady(): void {
  const canvasEl = document.getElementById(
    'tactical-field-canvas',
  ) as HTMLCanvasElement | null;
  if (canvasEl && !fieldRenderer) {
    fieldRenderer = new TacticalFieldCanvas(canvasEl);
  }

  const userGame = getUserWeekGame();
  if (userGame && !userGame.played) {
    if (!liveGame || liveGame.scheduledGameId !== userGame.id) {
      liveGame = createLiveGameState(userGame, state);
    }
  } else if (!liveGame) {
    // Create an exhibition / scrimmage matchup so the live field is always playable even on Bye Weeks!
    const rival =
      state.teams.find((t) => t.id !== state.userTeamId) ?? state.teams[1];
    const mockGame: ScheduledGame = {
      id: `EXHIBITION_${state.season}_${state.week}`,
      season: state.season,
      week: state.week,
      stage: 'REG',
      homeTeamId: state.userTeamId,
      awayTeamId: rival.id,
      played: false,
      homeScore: 0,
      awayScore: 0,
    };
    liveGame = createLiveGameState(mockGame, state);
  }
}

function renderGameDayView(): void {
  ensureLiveGameReady();
  if (!liveGame) return;

  const homeTeam = state.teams.find((t) => t.id === liveGame!.homeTeamId)!;
  const awayTeam = state.teams.find((t) => t.id === liveGame!.awayTeamId)!;
  const possTeam = liveGame.possession === 'HOME' ? homeTeam : awayTeam;
  const userIsOnOffense = liveGame.possession === liveGame.userSide;

  // Scorebug
  const setTxt = (id: string, txt: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('live-away-abbr', awayTeam.abbr);
  setTxt('live-away-name', awayTeam.name);
  setTxt('live-away-score', String(liveGame.awayScore));
  setTxt('live-home-abbr', homeTeam.abbr);
  setTxt('live-home-name', homeTeam.name);
  setTxt('live-home-score', String(liveGame.homeScore));

  const qLabel = liveGame.quarter === 5 ? 'OT' : `Q${liveGame.quarter}`;
  setTxt(
    'live-quarter-clock',
    liveGame.isGameOver ? 'FINAL' : `${qLabel} • ${formatClock(liveGame.clockSeconds)}`,
  );

  const yardStr =
    liveGame.ballOn > 50
      ? `OPP ${100 - liveGame.ballOn}`
      : liveGame.ballOn === 50
        ? '50 YD LINE'
        : `OWN ${liveGame.ballOn}`;
  const ord = ['1ST', '2ND', '3RD', '4TH'][liveGame.down - 1] ?? '1ST';
  setTxt('live-down-distance', `${ord} & ${liveGame.toGo} • BALL ON ${yardStr}`);
  setTxt(
    'live-possession-indicator',
    `POSSESSION: ${possTeam.city.toUpperCase()} (${userIsOnOffense ? 'YOUR OFFENSE' : 'YOUR DEFENSE'})`,
  );
  setTxt('live-play-banner', liveGame.lastPlayBanner);

  // Hit Stick toggle state
  const hsBtn = document.getElementById('btn-arm-hit-stick');
  if (hsBtn) {
    hsBtn.setAttribute('aria-pressed', String(liveGame.hitStickArmed));
    hsBtn.textContent = liveGame.hitStickArmed
      ? '💥 2005 HIT STICK ARMED! (BIG HIT / FUMBLE BONUS)'
      : '💥 ARM 2005 HIT STICK (OFF)';
  }

  // Render Playbook Grid
  const modeHeading = document.getElementById('playbook-mode-heading');
  const pbGrid = document.getElementById('playbook-cards-grid');
  if (modeHeading && pbGrid) {
    if (liveGame.isGameOver) {
      modeHeading.textContent = 'GAME COMPLETE // COMMIT RESULT TO FRANCHISE STANDINGS';
      pbGrid.innerHTML = `
        <button type="button" class="madden-btn primary-cta" id="btn-commit-finished-game">
          ✅ RECORD OFFICIAL RESULT &amp; RETURN TO STORYLINE CENTRAL
        </button>
      `;
    } else if (userIsOnOffense) {
      modeHeading.textContent = `CALL OFFENSIVE PLAY (${possTeam.abbr} BALL • ${ord} & ${liveGame.toGo})`;
      pbGrid.innerHTML = OFFENSIVE_PLAYBOOK.map(
        (play) => `
          <button type="button" class="play-card-btn" data-call-off="${play.id}">
            <span class="play-cat">${play.formation} • ${play.category}</span>
            <span class="play-title">${play.name}</span>
            <span class="play-desc">${play.description}</span>
          </button>
        `,
      ).join('');
    } else {
      modeHeading.textContent = `CALL DEFENSIVE COVERAGE / BLITZ (DEFENDING ${possTeam.abbr} • ${ord} & ${liveGame.toGo})`;
      pbGrid.innerHTML = DEFENSIVE_PLAYBOOK.map(
        (play) => `
          <button type="button" class="play-card-btn" data-call-def="${play.id}">
            <span class="play-cat">${play.formation} • ${play.category}</span>
            <span class="play-title">${play.name}</span>
            <span class="play-desc">${play.description}</span>
          </button>
        `,
      ).join('');
    }
  }

  // Render Telemetry Box
  const statsBox = document.getElementById('live-team-stats-box');
  if (statsBox) {
    statsBox.innerHTML = `
      <div class="vital-box">
        <span class="vital-label">${awayTeam.abbr} PASS / RUSH YDS</span>
        <strong class="vital-value">${liveGame.awayStats.passYards} / ${liveGame.awayStats.rushYards}</strong>
      </div>
      <div class="vital-box">
        <span class="vital-label">${homeTeam.abbr} PASS / RUSH YDS</span>
        <strong class="vital-value">${liveGame.homeStats.passYards} / ${liveGame.homeStats.rushYards}</strong>
      </div>
      <div class="vital-box">
        <span class="vital-label">${awayTeam.abbr} SACKS / HIT STICKS</span>
        <strong class="vital-value">${liveGame.awayStats.sacks} / ${liveGame.awayStats.hitSticks} 💥</strong>
      </div>
      <div class="vital-box">
        <span class="vital-label">${homeTeam.abbr} SACKS / HIT STICKS</span>
        <strong class="vital-value">${liveGame.homeStats.sacks} / ${liveGame.homeStats.hitSticks} 💥</strong>
      </div>
    `;
  }

  // Render Play-by-Play Ticker
  const logEl = document.getElementById('live-play-log');
  if (logEl) {
    logEl.innerHTML =
      liveGame.playLog.length === 0
        ? `<p style="font-size:0.8rem;color:var(--text-muted)">Click any Offensive or Defensive play card to snap the football!</p>`
        : liveGame.playLog
            .slice(0, 25)
            .map(
              (entry) => `
            <div class="play-log-entry ${entry.isScoringPlay ? 'is-score' : ''} ${entry.isTurnover ? 'is-turnover' : ''}">
              <div style="font-size:0.68rem;color:var(--text-muted)">
                Q${entry.quarter} (${entry.clock}) • ${entry.possessionAbbr}
              </div>
              <div>${entry.description}</div>
            </div>
          `,
            )
            .join('');
  }

  if (fieldRenderer) {
    fieldRenderer.triggerPlayAnimation(liveGame, homeTeam, awayTeam);
  }
}

// ============================================================================
// 6. VIEW 3: ROSTER, DEPTH CHART & FREE AGENCY
// ============================================================================

function renderRosterView(): void {
  const sourceSel = document.getElementById(
    'roster-source-select',
  ) as HTMLSelectElement | null;
  const posSel = document.getElementById(
    'roster-pos-filter',
  ) as HTMLSelectElement | null;
  const tbody = document.getElementById('roster-table-body');
  if (!tbody) return;

  const poolMode = sourceSel?.value ?? 'TEAM';
  const posFilter = (posSel?.value ?? 'ALL') as Position | 'ALL';

  let list = state.players.filter((p) =>
    poolMode === 'FA' ? p.teamId === 'FA' : p.teamId === state.userTeamId,
  );
  if (posFilter !== 'ALL') {
    list = list.filter((p) => p.position === posFilter);
  }

  list.sort((a, b) => {
    if (poolMode === 'TEAM' && posFilter !== 'ALL') {
      return a.depthOrder - b.depthOrder || b.overall - a.overall;
    }
    return b.overall - a.overall || a.depthOrder - b.depthOrder;
  });

  tbody.innerHTML = list
    .map((p) => {
      const capHit = getPlayerCapHitM(p);
      const progBadge =
        p.lastProgressionDelta > 0
          ? `<span style="color:#4ade80;font-size:0.72rem">(+${p.lastProgressionDelta})</span>`
          : p.lastProgressionDelta < 0
            ? `<span style="color:#f87171;font-size:0.72rem">(${p.lastProgressionDelta})</span>`
            : '';
      const injBadge =
        p.injuryWeeks > 0
          ? `<span style="color:#f87171;font-size:0.7rem"> [INJ ${p.injuryWeeks}w]</span>`
          : '';

      return `
        <tr>
          <th scope="row">
            #${p.jerseyNumber} ${p.firstName} ${p.lastName}${injBadge}
            <div style="font-size:0.7rem;color:var(--text-muted)">${p.personality}</div>
          </th>
          <td>
            <strong>${p.position}</strong> ${poolMode === 'TEAM' ? `<span class="sub-badge">#${p.depthOrder}</span>` : '<span class="sub-badge">FA</span>'}
          </td>
          <td>
            <strong style="color:var(--color-gold-bright);font-size:0.95rem">${p.overall}</strong> (${p.potential}) ${progBadge}
          </td>
          <td>${p.age} <span style="color:var(--text-muted)">(${p.yearsPro}y)</span></td>
          <td>
            <strong style="color:${p.morale >= 80 ? '#4ade80' : p.morale >= 65 ? '#fbbf24' : '#f87171'}">${p.morale}%</strong>
          </td>
          <td style="font-family:var(--font-mono);font-size:0.76rem">
            ${p.attributes.speed} / ${p.attributes.strength} / ${p.attributes.awareness} / <span style="color:var(--color-orange)">${p.attributes.hitPower}</span>
          </td>
          <td><span class="sub-badge">${p.trait}</span></td>
          <td style="font-family:var(--font-mono)">
            ${
              poolMode === 'FA'
                ? `Est. $${capHit.toFixed(2)}M/yr`
                : `$${capHit.toFixed(2)}M/yr (${p.contract.yearsLeft}y)${p.contract.franchiseTagged ? ' [TAG]' : ''}`
            }
          </td>
          <td>
            <div style="display:flex;flex-wrap:wrap;gap:0.3rem">
              ${
                poolMode === 'TEAM'
                  ? `
                <button type="button" class="madden-btn small-btn" data-depth-up="${p.id}" aria-label="Move ${p.firstName} ${p.lastName} up depth chart">▲</button>
                <button type="button" class="madden-btn small-btn" data-depth-down="${p.id}" aria-label="Move ${p.firstName} ${p.lastName} down depth chart">▼</button>
              `
                  : ''
              }
              <button type="button" class="madden-btn small-btn primary-cta" data-open-player="${p.id}">
                ${poolMode === 'FA' ? 'Sign / Offer' : 'Card & Contract'}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function openPlayerContractModal(playerId: string): void {
  const player = state.players.find((p) => p.id === playerId);
  const dialog = document.getElementById(
    'player-contract-dialog',
  ) as HTMLDialogElement | null;
  const titleEl = document.getElementById('player-dialog-title');
  const eyebrowEl = document.getElementById('player-dialog-eyebrow');
  const bodyEl = document.getElementById('player-dialog-body');
  if (!player || !dialog || !titleEl || !bodyEl || !eyebrowEl) return;

  const isFA = player.teamId === 'FA';
  const isUserPlayer = player.teamId === state.userTeamId;
  const market = calculateMarketContract(
    player.position,
    player.overall,
    player.age,
  );
  const defaultYears = market.yearsLeft;
  const defaultSal = market.salaryM;
  const defaultBonus = market.bonusM;

  eyebrowEl.textContent = `${player.teamId === 'FA' ? 'UNRESTRICTED FREE AGENT' : `${player.teamId} ROSTER`} • ${player.personality.toUpperCase()} • ${player.trait.toUpperCase()}`;
  titleEl.textContent = `${player.firstName.toUpperCase()} ${player.lastName.toUpperCase()} // #${player.jerseyNumber} ${player.position} (${player.overall} OVR)`;

  const initialEval = evaluateContractOffer(
    player,
    defaultYears,
    defaultSal,
    defaultBonus,
  );

  bodyEl.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem">
      <div class="panel-card">
        <h3 class="section-subheading">MADDEN 2005 ATTRIBUTE RATINGS</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.45rem;font-size:0.8rem;font-family:var(--font-mono)">
          <div class="vital-box"><span class="vital-label">SPEED</span><strong>${player.attributes.speed}</strong></div>
          <div class="vital-box"><span class="vital-label">STRENGTH</span><strong>${player.attributes.strength}</strong></div>
          <div class="vital-box"><span class="vital-label">AWARENESS</span><strong>${player.attributes.awareness}</strong></div>
          <div class="vital-box"><span class="vital-label">AGILITY</span><strong>${player.attributes.agility}</strong></div>
          <div class="vital-box"><span class="vital-label">ACCEL</span><strong>${player.attributes.acceleration}</strong></div>
          <div class="vital-box"><span class="vital-label">HIT POWER</span><strong style="color:var(--color-orange)">${player.attributes.hitPower}</strong></div>
          <div class="vital-box"><span class="vital-label">THP / TAK</span><strong>${Math.max(player.attributes.throwPower, player.attributes.tackle)}</strong></div>
          <div class="vital-box"><span class="vital-label">THA / COV</span><strong>${Math.max(player.attributes.throwAccuracy, player.attributes.coverage)}</strong></div>
          <div class="vital-box"><span class="vital-label">CTH / BLK</span><strong>${Math.max(player.attributes.catching, player.attributes.runBlock)}</strong></div>
        </div>

        <h3 class="section-subheading" style="margin-block-start:0.9rem">MORALE &amp; SEASON STATS</h3>
        <p style="font-size:0.8rem;color:var(--text-secondary);margin-block-end:0.45rem">
          <strong>Morale (${player.morale}%):</strong> "${player.moraleReason}"
        </p>
        <div style="font-size:0.78rem;font-family:var(--font-mono);color:var(--color-cyan)">
          ${
            player.position === 'QB'
              ? `PASS: ${player.stats.passCompletions}/${player.stats.passAttempts}, ${player.stats.passYards} YDS, ${player.stats.passTDs} TD, ${player.stats.interceptions} INT`
              : ['HB', 'WR', 'TE'].includes(player.position)
                ? `RUSH: ${player.stats.rushAttempts} CAR, ${player.stats.rushYards} YDS, ${player.stats.rushTDs} TD • REC: ${player.stats.receptions} REC, ${player.stats.recYards} YDS, ${player.stats.recTDs} TD`
                : `DEFENSE: ${player.stats.tackles} TAK, ${player.stats.sacks} SACKS, ${player.stats.defInterceptions} INT, ${player.stats.forcedFumbles} FF`
          }
        </div>
      </div>

      ${
        isFA || isUserPlayer
          ? `
        <div class="panel-card">
          <h3 class="section-subheading">${isFA ? 'SIGN FREE AGENT CONTRACT' : 'NEGOTIATE CONTRACT EXTENSION'}</h3>
          <p style="font-size:0.78rem;color:var(--text-secondary);margin-block-end:0.65rem">
            Desired Market Value: <strong>$${initialEval.desiredTotalAnnualM.toFixed(2)}M / yr</strong>
          </p>

          <form id="contract-negotiation-form" class="owner-form" data-player-id="${player.id}">
            <div class="form-row">
              <label for="offer-years">Contract Length (1–6 Years): <strong id="lbl-offer-years">${defaultYears} yrs</strong></label>
              <input type="range" id="offer-years" min="1" max="6" step="1" value="${defaultYears}" />
            </div>
            <div class="form-row">
              <label for="offer-salary">Base Salary ($M/yr): <strong id="lbl-offer-salary">$${defaultSal.toFixed(2)}M</strong></label>
              <input type="range" id="offer-salary" min="0.35" max="12.0" step="0.1" value="${defaultSal}" />
            </div>
            <div class="form-row">
              <label for="offer-bonus">Signing Bonus ($M/yr guaranteed): <strong id="lbl-offer-bonus">$${defaultBonus.toFixed(2)}M</strong></label>
              <input type="range" id="offer-bonus" min="0.05" max="6.0" step="0.05" value="${defaultBonus}" />
            </div>

            <div class="trade-eval-box">
              <div class="eval-meter-header">
                <span>AGENT CONTRACT INTEREST</span>
                <strong id="contract-interest-pct">${initialEval.interestScore}%</strong>
              </div>
              <div class="meter-track">
                <div id="contract-interest-bar" class="meter-fill" style="width:${initialEval.interestScore}%"></div>
              </div>
              <p id="contract-agent-feedback" class="eval-reason">${initialEval.agentFeedback}</p>
              <div style="display:flex;flex-wrap:wrap;gap:0.45rem">
                <button type="submit" class="madden-btn primary-cta">
                  ✍️ SUBMIT CONTRACT OFFER
                </button>
                ${
                  isUserPlayer && !state.franchiseTagUsedThisOffseason
                    ? `<button type="button" class="madden-btn" id="btn-apply-franchise-tag" data-tag-player="${player.id}">
                        🏷️ APPLY FRANCHISE TAG (1 YR)
                      </button>`
                    : ''
                }
                ${
                  isUserPlayer
                    ? `<button type="button" class="madden-btn radio-btn" id="btn-release-player" data-release-player="${player.id}">
                        ✂️ RELEASE (Dead Cap $${getReleaseCapPenaltyM(player).toFixed(2)}M)
                      </button>`
                    : ''
                }
              </div>
            </div>
          </form>
        </div>
      `
          : ''
      }
    </div>
  `;

  // Wire live slider preview
  const form = document.getElementById(
    'contract-negotiation-form',
  ) as HTMLFormElement | null;
  if (form) {
    const yrsInput = document.getElementById('offer-years') as HTMLInputElement;
    const salInput = document.getElementById('offer-salary') as HTMLInputElement;
    const bonInput = document.getElementById('offer-bonus') as HTMLInputElement;

    const updatePreview = () => {
      const y = Number(yrsInput.value);
      const s = Number(salInput.value);
      const b = Number(bonInput.value);
      const ev = evaluateContractOffer(player, y, s, b);

      const yLbl = document.getElementById('lbl-offer-years');
      const sLbl = document.getElementById('lbl-offer-salary');
      const bLbl = document.getElementById('lbl-offer-bonus');
      const pctEl = document.getElementById('contract-interest-pct');
      const barEl = document.getElementById('contract-interest-bar');
      const fbEl = document.getElementById('contract-agent-feedback');

      if (yLbl) yLbl.textContent = `${y} yrs`;
      if (sLbl) sLbl.textContent = `$${s.toFixed(2)}M`;
      if (bLbl) bLbl.textContent = `$${b.toFixed(2)}M`;
      if (pctEl) pctEl.textContent = `${ev.interestScore}%`;
      if (barEl) barEl.style.width = `${ev.interestScore}%`;
      if (fbEl) fbEl.textContent = ev.agentFeedback;
    };

    yrsInput?.addEventListener('input', updatePreview);
    salInput?.addEventListener('input', updatePreview);
    bonInput?.addEventListener('input', updatePreview);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = signOrExtendPlayerContract(
        state,
        player.id,
        Number(yrsInput.value),
        Number(salInput.value),
        Number(bonInput.value),
      );
      showToast(res.success ? 'CONTRACT SIGNED!' : 'NEGOTIATION UPDATE', res.message);
      if (res.success) {
        broadcastAudio.playDraftChime();
        void closeTopLayer(dialog);
        persistAndRender();
      }
    });
  }

  if (!dialog.open) {
    dialog.showModal();
  }
}

// ============================================================================
// 7. VIEW 4: TRADE CENTER, DRAFT BOARD & TRAINING CAMP DRILLS
// ============================================================================

function renderTradeAndDraftView(): void {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;

  // 1. Offseason Stage Controller Banner
  const stageBanner = document.getElementById('offseason-stage-controller');
  if (stageBanner) {
    if (state.phase === 'REGULAR_SEASON' || state.phase === 'PLAYOFFS') {
      stageBanner.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem">
          <div>
            <span class="era-badge">IN-SEASON GM OPERATIONS &amp; SCOUTING</span>
            <h3 style="font-size:1rem">Trade Deadline: Week ${state.tradeDeadlineWeek} (Current: Week ${state.week}) • Pre-Season &amp; Offseason Training Camp</h3>
          </div>
          <button type="button" class="madden-btn" id="btn-advance-stage-inline">
            ADVANCE WEEK / STAGE ▶
          </button>
        </div>
      `;
    } else {
      stageBanner.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem">
          <div>
            <span class="era-badge">MADDEN 2005 5-STAGE OFFSEASON PIPELINE</span>
            <h3 style="font-size:1.1rem;color:var(--color-gold-bright)">${getPhaseDisplayLabel()}</h3>
          </div>
          <button type="button" class="madden-btn primary-cta" id="btn-advance-stage-inline">
            PROCEED TO NEXT OFFSEASON STAGE ▶
          </button>
        </div>
      `;
    }
  }

  // 2. Populate CPU Trade Partner Select
  const cpuSelect = document.getElementById(
    'trade-cpu-team-select',
  ) as HTMLSelectElement | null;
  if (cpuSelect) {
    const cpuTeams = state.teams.filter((t) => t.id !== state.userTeamId);
    if (!cpuTeams.some((t) => t.id === selectedTradeCpuTeamId)) {
      selectedTradeCpuTeamId = cpuTeams[0].id;
    }
    cpuSelect.innerHTML = cpuTeams
      .map((t) => {
        const cap = getTeamCapRoomM(t, state.players, state.salaryCapM);
        return `<option value="${t.id}" ${t.id === selectedTradeCpuTeamId ? 'selected' : ''}>
          ${t.city} ${t.name} (${t.wins}-${t.losses} • Cap Room: $${cap.toFixed(2)}M)
        </option>`;
      })
      .join('');
  }

  const cpuTeam = state.teams.find((t) => t.id === selectedTradeCpuTeamId)!;

  // Render User & CPU Tradeable Assets
  const userAssetsEl = document.getElementById('trade-user-assets');
  const cpuAssetsEl = document.getElementById('trade-cpu-assets');

  if (userAssetsEl) {
    const userPlayers = state.players
      .filter((p) => p.teamId === userTeam.id)
      .sort((a, b) => b.overall - a.overall);
    const userPicks = state.draftPicks.filter(
      (pk) => pk.currentTeamId === userTeam.id && !pk.usedOnPlayerId,
    );

    userAssetsEl.innerHTML = [
      ...userPicks.map(
        (pk) => `
        <label class="trade-asset-item">
          <input type="checkbox" data-user-pick="${pk.id}" ${selectedUserPickIds.has(pk.id) ? 'checked' : ''} />
          <span><strong>${pk.season} Round ${pk.round} Pick</strong> (Orig: ${pk.originalTeamId}) — Val ${getDraftPickTradeValue(pk)}</span>
        </label>
      `,
      ),
      ...userPlayers.map(
        (p) => `
        <label class="trade-asset-item">
          <input type="checkbox" data-user-player="${p.id}" ${selectedUserPlayerIds.has(p.id) ? 'checked' : ''} />
          <span><strong>${p.position} ${p.firstName} ${p.lastName}</strong> (${p.overall} OVR, $${getPlayerCapHitM(p).toFixed(1)}M) — Val ${getPlayerTradeValue(p, cpuTeam, state.players)}</span>
        </label>
      `,
      ),
    ].join('');
  }

  if (cpuAssetsEl && cpuTeam) {
    const cpuPlayers = state.players
      .filter((p) => p.teamId === cpuTeam.id)
      .sort((a, b) => b.overall - a.overall);
    const cpuPicks = state.draftPicks.filter(
      (pk) => pk.currentTeamId === cpuTeam.id && !pk.usedOnPlayerId,
    );

    cpuAssetsEl.innerHTML = [
      ...cpuPicks.map(
        (pk) => `
        <label class="trade-asset-item">
          <input type="checkbox" data-cpu-pick="${pk.id}" ${selectedCpuPickIds.has(pk.id) ? 'checked' : ''} />
          <span><strong>${pk.season} Round ${pk.round} Pick</strong> (Orig: ${pk.originalTeamId}) — Val ${getDraftPickTradeValue(pk)}</span>
        </label>
      `,
      ),
      ...cpuPlayers.map(
        (p) => `
        <label class="trade-asset-item">
          <input type="checkbox" data-cpu-player="${p.id}" ${selectedCpuPlayerIds.has(p.id) ? 'checked' : ''} />
          <span><strong>${p.position} ${p.firstName} ${p.lastName}</strong> (${p.overall} OVR, $${getPlayerCapHitM(p).toFixed(1)}M) — Val ${getPlayerTradeValue(p, userTeam, state.players)}</span>
        </label>
      `,
      ),
    ].join('');
  }

  updateTradeEvaluationUI();

  // 3. Render Right Panel: Season Awards / Draft Board / Training Camp Drills
  const rightContainer = document.getElementById('draft-and-camp-container');
  const statusPill = document.getElementById('draft-status-pill');
  if (!rightContainer) return;

  if (state.phase === 'OFFSEASON_AWARDS') {
    if (statusPill) statusPill.textContent = `${state.season} AWARDS & RETIREMENTS`;
    rightContainer.innerHTML = `
      <h3 class="section-subheading">${state.season} NFL SEASON AWARD WINNERS</h3>
      <div class="morale-watch-list" style="margin-block-end:1rem">
        ${state.seasonAwards
          .map(
            (aw) => `
          <div class="morale-row">
            <div>
              <strong style="color:var(--color-gold-bright)">🏆 ${aw.awardName}</strong>
              <div>${aw.position} ${aw.playerName} (${aw.teamAbbr})</div>
            </div>
            <span class="sub-badge">${aw.statLine}</span>
          </div>
        `,
          )
          .join('')}
      </div>
      <h3 class="section-subheading">VETERAN RETIREMENTS (${state.retiredPlayers.length})</h3>
      <div class="morale-watch-list">
        ${
          state.retiredPlayers.length === 0
            ? '<p style="font-size:0.8rem">No notable retirements this year.</p>'
            : state.retiredPlayers
                .slice(0, 10)
                .map(
                  (r) => `
              <div class="morale-row">
                <span><strong>${r.position} ${r.name}</strong> (${r.teamAbbr}, Age ${r.age}, ${r.overall} OVR)</span>
                ${r.hallOfFameInductee ? '<span class="sub-badge">🌟 CANTON HOF</span>' : ''}
              </div>
            `,
                )
                .join('')
        }
      </div>
    `;
    return;
  }

  // Training Camp Drills Section + NCAA Draft Board
  const prospects = state.players.filter((p) => p.teamId === 'DRAFT');
  const draft = state.activeDraft;

  if (statusPill) {
    statusPill.textContent = draft
      ? `RD ${draft.currentRound} • PICK #${draft.currentPickIndex + 1} / ${draft.pickOrder.length}`
      : `${prospects.length} PROSPECTS • ${state.campDrillsRemaining} CAMP DRILLS LEFT`;
  }

  const userRoster = state.players
    .filter((p) => p.teamId === state.userTeamId && !p.campBoostedThisYear)
    .sort((a, b) => b.overall - a.overall);

  rightContainer.innerHTML = `
    <!-- Training Camp Position Drills Box -->
    <div style="background:#131c31;border:1px solid var(--border-highlight);border-radius:8px;padding:0.8rem;margin-block-end:1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-block-end:0.45rem">
        <strong style="color:var(--color-gold-bright);font-size:0.84rem">
          🏋️ MADDEN 2005 TRAINING CAMP POSITION DRILLS (${state.campDrillsRemaining} SESSIONS REMAINING)
        </strong>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
        <label for="camp-drill-select" class="visually-hidden">Select Training Camp Drill</label>
        <select id="camp-drill-select" class="madden-select">
          ${TRAINING_CAMP_DRILLS.map(
            (d) =>
              `<option value="${d.id}">${d.name} (${d.eligiblePositions.join('/')}) — +${d.overallBoost} OVR</option>`,
          ).join('')}
        </select>

        <label for="camp-player-select" class="visually-hidden">Select Roster Player for Drill</label>
        <select id="camp-player-select" class="madden-select">
          ${userRoster
            .map(
              (p) =>
                `<option value="${p.id}">${p.position} ${p.firstName} ${p.lastName} (${p.overall} OVR)</option>`,
            )
            .join('')}
        </select>

        <button type="button" class="madden-btn primary-cta small-btn" id="btn-run-camp-drill" ${state.campDrillsRemaining <= 0 ? 'disabled' : ''}>
          🏆 RUN MINI-CAMP DRILL
        </button>
      </div>
    </div>

    ${
      draft
        ? `
      <div style="background:#172554;border:1px solid var(--color-cyan);border-radius:8px;padding:0.75rem;margin-block-end:0.85rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem">
        <div>
          <strong style="color:var(--color-gold-bright)">
            ${
              draft.currentPickIndex < draft.pickOrder.length
                ? `ON THE CLOCK: Pick #${draft.currentPickIndex + 1} (Round ${draft.currentRound}) — ${state.teams.find((t) => t.id === draft.pickOrder[draft.currentPickIndex].currentTeamId)?.city ?? ''}`
                : 'NFL DRAFT COMPLETE!'
            }
          </strong>
        </div>
        <div style="display:flex;gap:0.4rem">
          <button type="button" class="madden-btn small-btn primary-cta" id="btn-auto-draft-pick">
            ⚡ Auto-Pick Best Prospect
          </button>
          <button type="button" class="madden-btn small-btn" id="btn-sim-rest-draft">
            ⏩ Sim Rest of Draft
          </button>
        </div>
      </div>
    `
        : ''
    }

    <h3 class="section-subheading">NCAA SCOUTING COMBINE &amp; PROSPECT BOARD</h3>
    <div class="morale-watch-list" style="max-block-size:320px">
      ${prospects
        .slice(0, 30)
        .map((p) => {
          const isFullyScouted = p.scoutedLevel >= 2;
          return `
            <div class="morale-row">
              <div>
                <strong>${p.position} ${p.firstName} ${p.lastName}</strong>
                <span class="sub-badge">${p.combine?.college ?? 'NCAA'} • Proj Rd ${p.combine?.projectedRound ?? 1}</span>
                <div style="font-size:0.74rem;font-family:var(--font-mono);color:var(--text-secondary)">
                  40-Yd: ${p.combine?.fortyYardDash ?? 4.55}s • Bench: ${p.combine?.benchPressReps ?? 20} reps • Vert: ${p.combine?.verticalJumpIn ?? 34}" • Wonderlic: ${p.combine?.wonderlicScore ?? 26}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:0.45rem">
                ${
                  isFullyScouted
                    ? `<strong style="color:var(--color-gold-bright)">${p.overall} OVR (Pot ${p.potential})</strong>`
                    : `<span style="color:var(--text-muted);font-size:0.76rem">Est. ${Math.max(65, p.overall - 4)}–${Math.min(89, p.overall + 4)} OVR</span>`
                }
                ${
                  !isFullyScouted
                    ? `<button type="button" class="madden-btn small-btn" data-scout-prospect="${p.id}">🔍 Scout</button>`
                    : ''
                }
                ${
                  draft &&
                  draft.currentPickIndex < draft.pickOrder.length &&
                  draft.pickOrder[draft.currentPickIndex].currentTeamId ===
                    state.userTeamId
                    ? `<button type="button" class="madden-btn small-btn primary-cta" data-draft-prospect="${p.id}">Draft</button>`
                    : ''
                }
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function updateTradeEvaluationUI(): void {
  const pctEl = document.getElementById('trade-interest-pct');
  const barEl = document.getElementById('trade-interest-bar');
  const reasonEl = document.getElementById('trade-eval-reason');
  const execBtn = document.getElementById(
    'btn-execute-trade',
  ) as HTMLButtonElement | null;
  if (!pctEl || !barEl || !reasonEl || !execBtn) return;

  const evalRes = evaluateTradeProposal(
    state,
    selectedTradeCpuTeamId,
    Array.from(selectedUserPlayerIds),
    Array.from(selectedUserPickIds),
    Array.from(selectedCpuPlayerIds),
    Array.from(selectedCpuPickIds),
  );

  pctEl.textContent = `${evalRes.interestScore}%`;
  barEl.style.width = `${evalRes.interestScore}%`;
  reasonEl.textContent = evalRes.reason;
  execBtn.disabled = !evalRes.accepted;
}

// ============================================================================
// 8. VIEW 5: STANDINGS, PLAYOFF PICTURE & INDIVIDUAL LEADERS
// ============================================================================

function renderStandingsAndStatsView(): void {
  const confSelect = document.getElementById(
    'standings-conf-select',
  ) as HTMLSelectElement | null;
  const catSelect = document.getElementById(
    'stats-leader-category',
  ) as HTMLSelectElement | null;
  const container = document.getElementById('standings-tables-container');
  const leadersBody = document.getElementById('leaders-table-body');
  const historyEl = document.getElementById('champions-history-list');

  const mode = confSelect?.value ?? 'AFC';
  const statMode = catSelect?.value ?? 'PASS';

  if (container) {
    if (mode === 'AFC' || mode === 'NFC') {
      const divs: Division[] = ['North', 'South', 'East', 'West'];
      container.innerHTML = divs
        .map((div) => {
          const divTeams = sortTeamsForStandings(
            state.teams.filter(
              (t) => t.conference === mode && t.division === div,
            ),
          );
          return `
            <h3 class="section-subheading">${mode} ${div.toUpperCase()}</h3>
            <div class="table-wrapper" style="margin-block-end:0.85rem">
              <table class="madden-table">
                <thead>
                  <tr>
                    <th scope="col">Team</th>
                    <th scope="col">W-L-T</th>
                    <th scope="col">PF</th>
                    <th scope="col">PA</th>
                    <th scope="col">DIV</th>
                    <th scope="col">STRK</th>
                  </tr>
                </thead>
                <tbody>
                  ${divTeams
                    .map(
                      (t) => `
                    <tr style="${t.id === state.userTeamId ? 'color:var(--color-gold-bright)' : ''}">
                      <th scope="row">${t.city} ${t.name}</th>
                      <td><strong>${t.wins}-${t.losses}${t.ties ? `-${t.ties}` : ''}</strong></td>
                      <td>${t.pointsFor}</td>
                      <td>${t.pointsAgainst}</td>
                      <td>${t.divisionWins}-${t.divisionLosses}</td>
                      <td>${t.streak > 0 ? `W${t.streak}` : t.streak < 0 ? `L${Math.abs(t.streak)}` : '-'}</td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `;
        })
        .join('');
    } else if (mode === 'PLAYOFFS') {
      const afcSeeds = getConferencePlayoffSeeds('AFC', state.teams);
      const nfcSeeds = getConferencePlayoffSeeds('NFC', state.teams);
      container.innerHTML = `
        <h3 class="section-subheading">AFC PLAYOFF SEEDS (#1 &amp; #2 EARN FIRST-ROUND BYE)</h3>
        <div class="morale-watch-list" style="margin-block-end:1rem">
          ${afcSeeds
            .map(
              (s) => `
            <div class="morale-row">
              <strong>#${s.seed} ${s.team.city} ${s.team.name} (${s.team.wins}-${s.team.losses})</strong>
              <span class="sub-badge">${s.reason}${s.seed <= 2 ? ' • 1ST RD BYE' : ''}</span>
            </div>
          `,
            )
            .join('')}
        </div>
        <h3 class="section-subheading">NFC PLAYOFF SEEDS (#1 &amp; #2 EARN FIRST-ROUND BYE)</h3>
        <div class="morale-watch-list">
          ${nfcSeeds
            .map(
              (s) => `
            <div class="morale-row">
              <strong>#${s.seed} ${s.team.city} ${s.team.name} (${s.team.wins}-${s.team.losses})</strong>
              <span class="sub-badge">${s.reason}${s.seed <= 2 ? ' • 1ST RD BYE' : ''}</span>
            </div>
          `,
            )
            .join('')}
        </div>
      `;
    } else {
      const rankings = getPowerRankings(state.teams, state.players);
      container.innerHTML = `
        <div class="morale-watch-list" style="max-block-size:500px">
          ${rankings
            .map(
              (r) => `
            <div class="morale-row">
              <strong>#${r.rank} ${r.team.city} ${r.team.name} (${r.team.wins}-${r.team.losses})</strong>
              <span class="sub-badge">OVR ${r.overall} • PF ${r.team.pointsFor} / PA ${r.team.pointsAgainst}</span>
            </div>
          `,
            )
            .join('')}
        </div>
      `;
    }
  }

  if (leadersBody) {
    const active = state.players.filter(
      (p) => p.teamId !== 'FA' && p.teamId !== 'DRAFT',
    );
    let sorted: Player[] = [];
    if (statMode === 'PASS') {
      sorted = active
        .filter((p) => p.position === 'QB')
        .sort((a, b) => b.stats.passYards - a.stats.passYards)
        .slice(0, 15);
    } else if (statMode === 'RUSH') {
      sorted = active
        .filter((p) => p.position === 'HB' || p.position === 'QB')
        .sort((a, b) => b.stats.rushYards - a.stats.rushYards)
        .slice(0, 15);
    } else if (statMode === 'REC') {
      sorted = active
        .filter((p) => ['WR', 'TE', 'HB'].includes(p.position))
        .sort((a, b) => b.stats.recYards - a.stats.recYards)
        .slice(0, 15);
    } else {
      sorted = active
        .filter((p) => ['LB', 'DL', 'S', 'CB'].includes(p.position))
        .sort(
          (a, b) =>
            b.stats.tackles +
            b.stats.sacks * 4 -
            (a.stats.tackles + a.stats.sacks * 4),
        )
        .slice(0, 15);
    }

    leadersBody.innerHTML = sorted
      .map((p) => {
        let col1 = '';
        let col2 = '';
        let col3 = '';
        if (statMode === 'PASS') {
          col1 = `${p.stats.passYards} YDS`;
          col2 = `${p.stats.passCompletions}/${p.stats.passAttempts} CMP`;
          col3 = `${p.stats.passTDs} TD / ${p.stats.interceptions} INT`;
        } else if (statMode === 'RUSH') {
          col1 = `${p.stats.rushYards} YDS`;
          col2 = `${p.stats.rushAttempts} CAR`;
          col3 = `${p.stats.rushTDs} TD`;
        } else if (statMode === 'REC') {
          col1 = `${p.stats.recYards} YDS`;
          col2 = `${p.stats.receptions} REC`;
          col3 = `${p.stats.recTDs} TD`;
        } else {
          col1 = `${p.stats.tackles} TAK`;
          col2 = `${p.stats.sacks} SACKS`;
          col3 = `${p.stats.defInterceptions} INT / ${p.stats.forcedFumbles} FF`;
        }

        return `
          <tr>
            <th scope="row">${p.firstName} ${p.lastName}</th>
            <td>${p.teamId} • ${p.position}</td>
            <td><strong>${p.overall}</strong></td>
            <td style="color:var(--color-gold-bright);font-weight:800">${col1}</td>
            <td>${col2}</td>
            <td>${col3}</td>
          </tr>
        `;
      })
      .join('');
  }

  if (historyEl) {
    historyEl.innerHTML =
      state.championsHistory.length === 0
        ? `<p style="font-size:0.8rem;color:var(--text-muted)">Complete Week 21 (Championship Bowl) to etch the first champion into Dynasty History!</p>`
        : state.championsHistory
            .map(
              (ch) => `
            <div class="morale-row">
              <div>
                <strong style="color:var(--color-gold-bright)">🏆 ${ch.season} Champion: ${ch.winnerName} (${ch.score})</strong>
                <div style="font-size:0.75rem;color:var(--text-secondary)">Defeated ${ch.loserName} • Bowl MVP: ${ch.mvpName}</div>
              </div>
              <span class="sub-badge">Your Record: ${ch.userRecord}</span>
            </div>
          `,
            )
            .join('');
  }
}

// ============================================================================
// 9. VIEW 6: OWNER MODE & COACHING STAFF
// ============================================================================

function renderOwnerModeView(): void {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;
  const stadBadge = document.getElementById('owner-stadium-badge');
  if (stadBadge) {
    stadBadge.textContent = `${userTeam.stadiumName.toUpperCase()} (${userTeam.stadiumCapacity.toLocaleString()} CAP)`;
  }

  const tInput = document.getElementById('input-ticket-price') as HTMLInputElement | null;
  const cInput = document.getElementById('input-concession-price') as HTMLInputElement | null;
  const pInput = document.getElementById('input-parking-price') as HTMLInputElement | null;
  const mInput = document.getElementById('input-marketing-budget') as HTMLInputElement | null;

  if (tInput) tInput.value = String(userTeam.finances.ticketPrice);
  if (cInput) cInput.value = String(userTeam.finances.concessionPrice);
  if (pInput) pInput.value = String(userTeam.finances.parkingPrice);
  if (mInput) mInput.value = String(userTeam.finances.marketingBudgetM);

  const setVal = (id: string, txt: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setVal('val-ticket-price', `$${userTeam.finances.ticketPrice}`);
  setVal('val-concession-price', `$${userTeam.finances.concessionPrice}`);
  setVal('val-parking-price', `$${userTeam.finances.parkingPrice}`);
  setVal('val-marketing-budget', `$${userTeam.finances.marketingBudgetM.toFixed(1)}M`);

  const ledgerEl = document.getElementById('owner-ledger-summary');
  if (ledgerEl) {
    const capUsed = getTeamCapUsedM(userTeam, state.players);
    ledgerEl.innerHTML = `
      <div class="vital-box">
        <span class="vital-label">OWNER TREASURY CASH</span>
        <strong class="vital-value" style="color:#4ade80">$${userTeam.finances.ownerCashM.toFixed(2)}M</strong>
      </div>
      <div class="vital-box">
        <span class="vital-label">LAST HOME ATTENDANCE</span>
        <strong class="vital-value">${userTeam.finances.lastAttendance.toLocaleString()} / ${userTeam.stadiumCapacity.toLocaleString()}</strong>
      </div>
      <div class="vital-box">
        <span class="vital-label">SEASON GATE &amp; CONCESSIONS</span>
        <strong class="vital-value">$${userTeam.finances.seasonRevenueM.toFixed(2)}M</strong>
      </div>
      <div class="vital-box">
        <span class="vital-label">ROSTER PAYROLL / DEAD CAP</span>
        <strong class="vital-value">$${capUsed.toFixed(2)}M ($${userTeam.finances.deadCapPenaltyM.toFixed(2)}M Dead)</strong>
      </div>
    `;
  }

  const staffEl = document.getElementById('coaching-staff-cards');
  if (staffEl) {
    const roles: Array<{ key: 'hc' | 'oc' | 'dc' | 'trainer'; title: string }> = [
      { key: 'hc', title: 'HEAD COACH' },
      { key: 'oc', title: 'OFFENSIVE COORDINATOR' },
      { key: 'dc', title: 'DEFENSIVE COORDINATOR' },
      { key: 'trainer', title: 'HEAD ATHLETIC TRAINER' },
    ];

    staffEl.innerHTML = roles
      .map(({ key, title }) => {
        const c = userTeam.coaches[key];
        return `
          <div class="staff-card">
            <span class="vital-label">${title}</span>
            <strong style="font-size:1rem;color:var(--color-gold-bright)">${c.name}</strong>
            <span class="sub-badge">Rating: ${c.rating} / 99</span>
            <span style="font-size:0.76rem;color:var(--text-secondary)">Specialty: ${c.specialty}</span>
            <button
              type="button"
              class="madden-btn small-btn primary-cta"
              data-upgrade-coach="${key}"
              ${c.rating >= 99 ? 'disabled' : ''}
            >
              ${c.rating >= 99 ? 'MAX 99 RATING' : '⬆️ Upgrade Clinic ($1.50M)'}
            </button>
          </div>
        `;
      })
      .join('');
  }
}

// ============================================================================
// 10. TEAM PICKER MODAL RENDERER
// ============================================================================

function renderTeamPickerModal(): void {
  const grid = document.getElementById('team-picker-grid');
  if (!grid) return;

  grid.innerHTML = state.teams
    .map((t) => {
      const rat = getTeamRatings(t.id, state.players);
      const isCurrent = t.id === state.userTeamId;
      return `
        <button
          type="button"
          class="team-pick-card"
          data-select-franchise-team="${t.id}"
          style="border-inline-start: 5px solid ${t.primaryColor}"
        >
          <div style="display:flex;justify-content:space-between;width:100%">
            <strong>${t.city} ${t.name} ${isCurrent ? '⭐' : ''}</strong>
            <span class="sub-badge">${t.conference} ${t.division}</span>
          </div>
          <div style="font-size:0.76rem;color:var(--color-gold)">
            OVR ${rat.overall} (OFF ${rat.offense} / DEF ${rat.defense})
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted)">
            Coach ${t.coaches.hc.name} • ${t.stadiumName}
          </div>
        </button>
      `;
    })
    .join('');
}

function renderAll(): void {
  renderHeader();
  renderStorylineCentral();
  renderRosterView();
  renderTradeAndDraftView();
  renderStandingsAndStatsView();
  renderOwnerModeView();
  renderTeamPickerModal();
  if (activeTab === 'GAMEDAY') {
    renderGameDayView();
  }
}

// ============================================================================
// 11. EVENT LISTENERS & DELEGATION
// ============================================================================

function bindEvents(): void {
  setupDialogFallbacks();

  // Primary Navigation Tabs
  document.querySelectorAll<HTMLButtonElement>('.nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      broadcastAudio.playClick();
      const t = btn.dataset.tab as typeof activeTab | undefined;
      if (t) switchTab(t);
    });
  });

  // Audio Mute Toggle
  const audioBtn = document.getElementById('btn-audio-toggle');
  audioBtn?.addEventListener('click', () => {
    const muted = broadcastAudio.toggleMute();
    audioBtn.setAttribute('aria-pressed', String(muted));
    audioBtn.textContent = muted ? '🔇 AUDIO: OFF' : '🔊 AUDIO: ON';
  });

  // Advance Week / Stage (Header Button)
  document.getElementById('btn-advance-week')?.addEventListener('click', () => {
    broadcastAudio.playWhistle();
    const res = advanceFranchiseWeekOrStage(state);
    liveGame = null;
    showToast(res.headline, res.details);
    persistAndRender();
  });

  // Sim All Week Games button
  document.getElementById('btn-sim-all-week')?.addEventListener('click', () => {
    broadcastAudio.playWhistle();
    simCurrentWeekGames(state);
    showToast(
      `WEEK ${state.week} GAMES SIMULATED`,
      'All scheduled games for this week are now final!',
    );
    persistAndRender();
  });

  // Roster Filters
  document
    .getElementById('roster-source-select')
    ?.addEventListener('change', () => renderRosterView());
  document
    .getElementById('roster-pos-filter')
    ?.addEventListener('change', () => renderRosterView());

  // Standings & Stats Filters
  document
    .getElementById('standings-conf-select')
    ?.addEventListener('change', () => renderStandingsAndStatsView());
  document
    .getElementById('stats-leader-category')
    ?.addEventListener('change', () => renderStandingsAndStatsView());

  // Trade CPU Team Select
  document
    .getElementById('trade-cpu-team-select')
    ?.addEventListener('change', (e) => {
      const sel = e.target as HTMLSelectElement;
      selectedTradeCpuTeamId = sel.value;
      selectedCpuPlayerIds.clear();
      selectedCpuPickIds.clear();
      renderTradeAndDraftView();
    });

  // Execute Trade Button
  document.getElementById('btn-execute-trade')?.addEventListener('click', () => {
    const res = executeTradeProposal(
      state,
      selectedTradeCpuTeamId,
      Array.from(selectedUserPlayerIds),
      Array.from(selectedUserPickIds),
      Array.from(selectedCpuPlayerIds),
      Array.from(selectedCpuPickIds),
    );
    if (res.success) {
      broadcastAudio.playDraftChime();
      selectedUserPlayerIds.clear();
      selectedUserPickIds.clear();
      selectedCpuPlayerIds.clear();
      selectedCpuPickIds.clear();
    }
    showToast(res.success ? 'TRADE COMPLETED!' : 'TRADE REJECTED', res.message);
    persistAndRender();
  });

  // Owner Pricing Sliders & Form Submit
  const bindSliderLabel = (inputId: string, labelId: string, prefix = '$', suffix = '') => {
    const inp = document.getElementById(inputId) as HTMLInputElement | null;
    const lbl = document.getElementById(labelId);
    inp?.addEventListener('input', () => {
      if (lbl) lbl.textContent = `${prefix}${inp.value}${suffix}`;
    });
  };
  bindSliderLabel('input-ticket-price', 'val-ticket-price');
  bindSliderLabel('input-concession-price', 'val-concession-price');
  bindSliderLabel('input-parking-price', 'val-parking-price');
  bindSliderLabel('input-marketing-budget', 'val-marketing-budget', '$', 'M');

  document
    .getElementById('owner-pricing-form')
    ?.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = Number(
        (document.getElementById('input-ticket-price') as HTMLInputElement).value,
      );
      const c = Number(
        (document.getElementById('input-concession-price') as HTMLInputElement)
          .value,
      );
      const p = Number(
        (document.getElementById('input-parking-price') as HTMLInputElement).value,
      );
      const m = Number(
        (document.getElementById('input-marketing-budget') as HTMLInputElement)
          .value,
      );
      const res = updateOwnerPricing(state, t, c, p, m);
      broadcastAudio.playClick();
      showToast('OWNER MODE UPDATED', res.message);
      persistAndRender();
    });

  // Game Day Pre-Snap & Drive Controls
  document.getElementById('btn-arm-hit-stick')?.addEventListener('click', () => {
    if (!liveGame) return;
    liveGame.hitStickArmed = !liveGame.hitStickArmed;
    broadcastAudio.playClick();
    renderGameDayView();
  });

  document.getElementById('btn-sim-drive')?.addEventListener('click', () => {
    if (!liveGame) return;
    broadcastAudio.playWhistle();
    simLiveGameDrive(liveGame, state);
    renderGameDayView();
  });

  document
    .getElementById('btn-finish-live-game')
    ?.addEventListener('click', () => {
      if (!liveGame) return;
      broadcastAudio.playTouchdownHorn();
      const committed = commitLiveGameToFranchise(liveGame, state);
      showToast(
        'GAME FINAL RECORDED!',
        committed?.headline ?? 'Matchup committed to franchise standings.',
      );
      liveGame = null;
      persistAndRender();
      switchTab('STORYLINE');
    });

  // Quick Scenario Jumps inside Team Select Modal
  document.getElementById('btn-jump-playoffs')?.addEventListener('click', () => {
    let guard = 0;
    while (state.phase === 'REGULAR_SEASON' && guard < 20) {
      advanceFranchiseWeekOrStage(state);
      guard++;
    }
    const dlg = document.getElementById(
      'team-select-dialog',
    ) as HTMLDialogElement | null;
    if (dlg?.open) void closeTopLayer(dlg);
    broadcastAudio.playTouchdownHorn();
    showToast(
      'PLAYOFF BRACKET UNLOCKED!',
      `Simulated Regular Season to Week ${state.week} Wild Card Playoffs!`,
    );
    persistAndRender();
  });

  document
    .getElementById('btn-jump-offseason')
    ?.addEventListener('click', () => {
      let guard = 0;
      while (
        (state.phase === 'REGULAR_SEASON' || state.phase === 'PLAYOFFS') &&
        guard < 25
      ) {
        advanceFranchiseWeekOrStage(state);
        guard++;
      }
      const dlg = document.getElementById(
        'team-select-dialog',
      ) as HTMLDialogElement | null;
      if (dlg?.open) void closeTopLayer(dlg);
      broadcastAudio.playDraftChime();
      showToast(
        'OFFSEASON HEADQUARTERS UNLOCKED!',
        'Review Season Awards, Re-Sign players, sign Free Agents, and run the 5-Round NFL Draft!',
      );
      persistAndRender();
      switchTab('TRADE');
    });

  // Global Delegated Click & Change Handler for Dynamic Elements
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest<HTMLElement>('button');
    if (!target) return;

    // 1. Go to Tab
    if (target.dataset.gotoTab) {
      broadcastAudio.playClick();
      switchTab(target.dataset.gotoTab as typeof activeTab);
      return;
    }

    // 2. Storyline Advance Week
    if (
      target.id === 'btn-story-advance' ||
      target.id === 'btn-advance-stage-inline'
    ) {
      broadcastAudio.playWhistle();
      const res = advanceFranchiseWeekOrStage(state);
      liveGame = null;
      showToast(res.headline, res.details);
      persistAndRender();
      return;
    }

    // 3. Play Live Matchup
    if (target.id === 'btn-play-live-matchup') {
      broadcastAudio.playWhistle();
      const g = getUserWeekGame();
      if (g) {
        liveGame = createLiveGameState(g, state);
      }
      switchTab('GAMEDAY');
      return;
    }

    // 4. Instant Sim Matchup
    if (target.id === 'btn-instant-sim-matchup') {
      const g = getUserWeekGame();
      if (g) {
        broadcastAudio.playTouchdownHorn();
        simulateScheduledGame(g, state, 7);
        showToast('FINAL WHISTLE', g.headline ?? 'Game simulated.');
        persistAndRender();
      }
      return;
    }

    // 5. Sim Single Scoreboard Game
    if (target.dataset.simSingleGame) {
      const g = state.schedule.find(
        (gm) => gm.id === target.dataset.simSingleGame,
      );
      if (g && !g.played) {
        broadcastAudio.playWhistle();
        simulateScheduledGame(g, state, 19);
        showToast('SCOREBOARD FINAL', g.headline ?? 'Game complete.');
        persistAndRender();
      }
      return;
    }

    // 6. Mark PDA Email Read
    if (target.dataset.readEmail) {
      const msg = state.pdaInbox.find((m) => m.id === target.dataset.readEmail);
      if (msg) {
        msg.read = true;
        persistAndRender();
      }
      return;
    }

    // 7. Tony Bruno Radio Poll Option
    if (target.dataset.radioSeg && target.dataset.radioOpt) {
      broadcastAudio.playRadioJingle();
      const res = answerTonyBrunoPoll(
        state,
        target.dataset.radioSeg,
        target.dataset.radioOpt,
      );
      showToast('TONY BRUNO RADIO SHOW', res.message);
      persistAndRender();
      return;
    }

    if (target.id === 'btn-play-radio-jingle') {
      broadcastAudio.playRadioJingle();
      return;
    }

    // 8. Open Player Card & Contract Modal
    if (target.dataset.openPlayer) {
      broadcastAudio.playClick();
      openPlayerContractModal(target.dataset.openPlayer);
      return;
    }

    // 9. Depth Chart Up / Down
    if (target.dataset.depthUp) {
      broadcastAudio.playClick();
      const res = changePlayerDepthOrder(state, target.dataset.depthUp, 'UP');
      showToast('DEPTH CHART', res.message);
      persistAndRender();
      return;
    }
    if (target.dataset.depthDown) {
      broadcastAudio.playClick();
      const res = changePlayerDepthOrder(state, target.dataset.depthDown, 'DOWN');
      showToast('DEPTH CHART', res.message);
      persistAndRender();
      return;
    }

    // 10. Franchise Tag & Release Player inside Modal
    if (target.dataset.tagPlayer) {
      const res = applyFranchiseTagToPlayer(state, target.dataset.tagPlayer);
      showToast(
        res.success ? 'FRANCHISE TAG APPLIED' : 'TAG UNAVAILABLE',
        res.message,
      );
      if (res.success) {
        broadcastAudio.playDraftChime();
        const dlg = document.getElementById(
          'player-contract-dialog',
        ) as HTMLDialogElement | null;
        if (dlg?.open) void closeTopLayer(dlg);
        persistAndRender();
      }
      return;
    }

    if (target.dataset.releasePlayer) {
      const res = releasePlayerToFreeAgency(state, target.dataset.releasePlayer);
      showToast(
        res.success ? 'PLAYER RELEASED' : 'ROSTER MINIMUM',
        res.message,
      );
      if (res.success) {
        const dlg = document.getElementById(
          'player-contract-dialog',
        ) as HTMLDialogElement | null;
        if (dlg?.open) void closeTopLayer(dlg);
        persistAndRender();
      }
      return;
    }

    // 11. Live Game Playcalling & Pre-Snap Adjustments
    if (target.dataset.offAdj && liveGame) {
      liveGame.offAdjustment = target.dataset.offAdj as PreSnapOffenseAdjustment;
      broadcastAudio.playClick();
      showToast('OFFENSIVE AUDIBLE', `Pre-snap adjustment set: ${target.textContent?.trim()}`);
      return;
    }
    if (target.dataset.defAdj && liveGame) {
      liveGame.defAdjustment = target.dataset.defAdj as PreSnapDefenseAdjustment;
      broadcastAudio.playClick();
      showToast('2005 DEFENSIVE PLAYMAKER', `Pre-snap shift set: ${target.textContent?.trim()}`);
      return;
    }
    if (target.dataset.callOff && liveGame) {
      const wasHitStick = liveGame.hitStickArmed;
      executeLiveGamePlay(
        liveGame,
        state,
        target.dataset.callOff as OffensivePlayId,
        undefined,
      );
      if (liveGame.playLog[0]?.isScoringPlay) {
        broadcastAudio.playTouchdownHorn();
      } else if (wasHitStick || liveGame.playLog[0]?.isBigHit) {
        broadcastAudio.playHitStickBoom();
      } else {
        broadcastAudio.playWhistle();
      }
      renderGameDayView();
      return;
    }
    if (target.dataset.callDef && liveGame) {
      const wasHitStick = liveGame.hitStickArmed;
      executeLiveGamePlay(
        liveGame,
        state,
        undefined,
        target.dataset.callDef as DefensivePlayId,
      );
      if (wasHitStick || liveGame.playLog[0]?.isBigHit) {
        broadcastAudio.playHitStickBoom();
      } else if (liveGame.playLog[0]?.isScoringPlay) {
        broadcastAudio.playTouchdownHorn();
      } else {
        broadcastAudio.playWhistle();
      }
      renderGameDayView();
      return;
    }
    if (target.id === 'btn-commit-finished-game' && liveGame) {
      const committed = commitLiveGameToFranchise(liveGame, state);
      showToast('GAME RECORDED', committed?.headline ?? 'Game complete.');
      liveGame = null;
      persistAndRender();
      switchTab('STORYLINE');
      return;
    }

    // 12. Scouting, Draft Selection & Training Camp Drills
    if (target.dataset.scoutProspect) {
      broadcastAudio.playClick();
      const res = scoutDraftProspect(state, target.dataset.scoutProspect);
      showToast('COMBINE SCOUTING REPORT', res.message);
      persistAndRender();
      return;
    }
    if (target.dataset.draftProspect) {
      broadcastAudio.playDraftChime();
      const res = makeDraftSelection(state, target.dataset.draftProspect);
      simCpuDraftPicksUntilUserTurn(state);
      showToast('NFL DRAFT SELECTION', res.message);
      persistAndRender();
      return;
    }
    if (target.id === 'btn-auto-draft-pick') {
      broadcastAudio.playDraftChime();
      const res = makeDraftSelection(state);
      simCpuDraftPicksUntilUserTurn(state);
      showToast('AUTO-DRAFT PICK', res.message);
      persistAndRender();
      return;
    }
    if (target.id === 'btn-sim-rest-draft') {
      broadcastAudio.playDraftChime();
      simRemainderOfDraft(state);
      showToast('NFL DRAFT COMPLETE', 'All 5 rounds of the NFL Draft have been completed!');
      persistAndRender();
      return;
    }
    if (target.id === 'btn-run-camp-drill') {
      const drillSel = document.getElementById(
        'camp-drill-select',
      ) as HTMLSelectElement | null;
      const plySel = document.getElementById(
        'camp-player-select',
      ) as HTMLSelectElement | null;
      if (drillSel && plySel) {
        const res = executeTrainingCampDrill(state, drillSel.value, plySel.value);
        if (res.success) {
          broadcastAudio.playTouchdownHorn();
        }
        showToast(
          res.success ? 'TRAINING CAMP BOOST!' : 'TRAINING CAMP',
          res.message,
        );
        persistAndRender();
      }
      return;
    }

    // 13. Upgrade Coaching Staff
    if (target.dataset.upgradeCoach) {
      const role = target.dataset.upgradeCoach as 'hc' | 'oc' | 'dc' | 'trainer';
      const res = upgradeCoachStaffMember(state, role);
      if (res.success) broadcastAudio.playDraftChime();
      showToast('COACHING STAFF CLINIC', res.message);
      persistAndRender();
      return;
    }

    // 14. Switch / Start New Team Franchise
    if (target.dataset.selectFranchiseTeam) {
      const newTeamId = target.dataset.selectFranchiseTeam;
      clearSavedFranchiseState();
      state = createNewFranchiseState(newTeamId, 2005);
      liveGame = null;
      broadcastAudio.playTouchdownHorn();
      const dlg = document.getElementById(
        'team-select-dialog',
      ) as HTMLDialogElement | null;
      if (dlg?.open) void closeTopLayer(dlg);
      const t = state.teams.find((tm) => tm.id === newTeamId)!;
      showToast(
        'NEW FRANCHISE DYNASTY LAUNCHED!',
        `You are now in command of the ${t.city} ${t.name}!`,
      );
      persistAndRender();
      switchTab('STORYLINE');
    }
  });

  // Trade Asset Checkboxes
  document.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (!input || input.type !== 'checkbox') return;

    const toggleSet = (set: Set<string>, id: string, checked: boolean) => {
      if (checked) set.add(id);
      else set.delete(id);
    };

    if (input.dataset.userPlayer) {
      toggleSet(selectedUserPlayerIds, input.dataset.userPlayer, input.checked);
      updateTradeEvaluationUI();
    } else if (input.dataset.userPick) {
      toggleSet(selectedUserPickIds, input.dataset.userPick, input.checked);
      updateTradeEvaluationUI();
    } else if (input.dataset.cpuPlayer) {
      toggleSet(selectedCpuPlayerIds, input.dataset.cpuPlayer, input.checked);
      updateTradeEvaluationUI();
    } else if (input.dataset.cpuPick) {
      toggleSet(selectedCpuPickIds, input.dataset.cpuPick, input.checked);
      updateTradeEvaluationUI();
    }
  });
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  bindEvents();
  renderAll();
}
