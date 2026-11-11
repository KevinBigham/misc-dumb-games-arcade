import {
  FranchiseState,
  NewspaperIssue,
  PdaEmail,
  Player,
  ScheduledGame,
  TonyBrunoSegment,
} from '../models/types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function evaluateWeeklyMoraleAndInbox(state: FranchiseState): void {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  if (!userTeam) return;

  const roster = state.players.filter((p) => p.teamId === userTeam.id);
  const teamWinBoost =
    userTeam.streak >= 2 ? 3 : userTeam.streak <= -2 ? -3 : 0;

  let benchedVetWarningPlayer: Player | null = null;
  let divaUsagePlayer: Player | null = null;
  let contractDemandPlayer: Player | null = null;

  for (const player of roster) {
    let delta = teamWinBoost;
    let reason =
      userTeam.streak > 0
        ? `Energized by ${userTeam.city}'s ${userTeam.streak}-game winning streak.`
        : userTeam.streak < 0
          ? `Frustrated by recent ${Math.abs(userTeam.streak)}-game skid.`
          : 'Focused on weekly gameplan.';

    // Check Depth Chart role vs Overall
    if (player.depthOrder === 1) {
      delta += 1;
      if (player.overall >= 88 && userTeam.wins >= userTeam.losses) {
        reason = 'Thriving as a featured Pro Bowl-caliber starter.';
      }
    } else if (player.overall >= 82 && player.depthOrder > 1) {
      delta -= 5;
      reason = `Unhappy being listed at #${player.depthOrder} ${player.position} despite an ${player.overall} OVR rating!`;
      if (!benchedVetWarningPlayer || player.overall > benchedVetWarningPlayer.overall) {
        benchedVetWarningPlayer = player;
      }
    }

    // Check Vocal Star / Mercenary usage
    if (
      (player.personality === 'Vocal Star' || player.personality === 'Mercenary') &&
      ['WR', 'HB'].includes(player.position) &&
      player.depthOrder === 1 &&
      state.week >= 3
    ) {
      const touches = player.stats.rushAttempts + player.stats.receptions;
      const expectedTouches =
        player.position === 'HB' ? (state.week - 1) * 11 : (state.week - 1) * 4;
      if (touches < expectedTouches) {
        delta -= 4;
        reason = `"I need the rock more! Only ${touches} touches through Week ${state.week} is unacceptable!"`;
        divaUsagePlayer = player;
      }
    }

    // Check Contract year
    if (
      player.contract.yearsLeft === 1 &&
      player.overall >= 85 &&
      state.week === 5
    ) {
      contractDemandPlayer = player;
      reason = 'Seeking a multi-year contract extension before hitting Free Agency.';
    }

    player.morale = clamp(player.morale + delta, 25, 99);
    player.moraleTrend = delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'STEADY';
    player.moraleReason = reason;
  }

  // Generate contextual PDA emails
  if (benchedVetWarningPlayer) {
    state.pdaInbox.unshift({
      id: `EMAIL_${state.season}_W${state.week}_BENCH_${benchedVetWarningPlayer.id}`,
      season: state.season,
      week: state.week,
      senderRole: 'AGENT',
      senderName: `Drew Rosenhaus-Style Agent (Rep: ${benchedVetWarningPlayer.firstName} ${benchedVetWarningPlayer.lastName})`,
      subject: `Playing Time Complaint: ${benchedVetWarningPlayer.firstName} ${benchedVetWarningPlayer.lastName} (${benchedVetWarningPlayer.overall} OVR)`,
      body: `Coach, my client ${benchedVetWarningPlayer.firstName} ${benchedVetWarningPlayer.lastName} is an ${benchedVetWarningPlayer.overall} OVR ${benchedVetWarningPlayer.position} sitting at #${benchedVetWarningPlayer.depthOrder} on your depth chart. His morale has dropped to ${benchedVetWarningPlayer.morale}%. Promote him to #1 Starter on the Depth Chart or explore a deal in the Trade Center before he demands out!`,
      read: false,
      priority: 'HIGH',
      relatedPlayerId: benchedVetWarningPlayer.id,
      actionTab: 'ROSTER',
    });
  }

  if (divaUsagePlayer) {
    state.pdaInbox.unshift({
      id: `EMAIL_${state.season}_W${state.week}_DIVA_${divaUsagePlayer.id}`,
      season: state.season,
      week: state.week,
      senderRole: 'COACH',
      senderName: `${userTeam.coaches.oc.name} (Offensive Coordinator)`,
      subject: `Locker Room Alert: ${divaUsagePlayer.lastName} Wants More Touches`,
      body: `${divaUsagePlayer.firstName} ${divaUsagePlayer.lastName} cornered reporters after practice complaining about his role in the ${userTeam.offenseScheme} offense. Dial up more ${divaUsagePlayer.position === 'HB' ? 'inside & stretch runs' : 'play-action & vertical targets'} for him next week to restore his morale (${divaUsagePlayer.morale}%).`,
      read: false,
      priority: 'NORMAL',
      relatedPlayerId: divaUsagePlayer.id,
      actionTab: 'STORYLINE',
    });
  }

  if (contractDemandPlayer) {
    state.pdaInbox.unshift({
      id: `EMAIL_${state.season}_W${state.week}_EXT_${contractDemandPlayer.id}`,
      season: state.season,
      week: state.week,
      senderRole: 'AGENT',
      senderName: `Agent for ${contractDemandPlayer.firstName} ${contractDemandPlayer.lastName}`,
      subject: `Contract Extension Request: ${contractDemandPlayer.firstName} ${contractDemandPlayer.lastName}`,
      body: `${contractDemandPlayer.firstName} is in the final year of his deal ($${contractDemandPlayer.contract.salaryM}M base) and playing at an ${contractDemandPlayer.overall} OVR level. Open his Player Card in Roster Manager to negotiate an extension now and boost his morale!`,
      read: false,
      priority: 'NORMAL',
      relatedPlayerId: contractDemandPlayer.id,
      actionTab: 'ROSTER',
    });
  }
}

export function runInSeasonProgression(state: FranchiseState): string[] {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  const boostedSummaries: string[] = [];

  for (const team of state.teams) {
    const coachFactor =
      (team.coaches.hc.rating +
        team.coaches.oc.rating +
        team.coaches.dc.rating) /
      3;
    const teamRoster = state.players.filter((p) => p.teamId === team.id);

    for (const p of teamRoster) {
      let delta = 0;
      if (
        p.morale >= 82 &&
        (p.potential === 'A' || (p.potential === 'B' && p.age <= 26)) &&
        coachFactor >= 80
      ) {
        delta = 1;
        if (p.morale >= 92 && p.age <= 24 && Math.random() < 0.35) {
          delta = 2;
        }
      } else if (p.morale <= 48 && Math.random() < 0.5) {
        delta = -1;
      }

      if (delta !== 0) {
        p.overall = clamp(p.overall + delta, 55, 99);
        p.attributes.awareness = clamp(p.attributes.awareness + delta, 45, 99);
        if (['QB'].includes(p.position)) {
          p.attributes.throwAccuracy = clamp(p.attributes.throwAccuracy + delta, 50, 99);
        } else if (['DL', 'LB', 'S'].includes(p.position)) {
          p.attributes.tackle = clamp(p.attributes.tackle + delta, 50, 99);
          p.attributes.hitPower = clamp(p.attributes.hitPower + delta, 50, 99);
        } else if (['WR', 'TE', 'CB'].includes(p.position)) {
          p.attributes.catching = clamp(p.attributes.catching + delta, 50, 99);
          p.attributes.coverage = clamp(p.attributes.coverage + delta, 50, 99);
        }
        p.lastProgressionDelta = delta;

        if (userTeam && team.id === userTeam.id) {
          boostedSummaries.push(
            `${p.position} ${p.firstName} ${p.lastName}: ${delta > 0 ? `+${delta}` : delta} OVR (Now ${p.overall} OVR)`,
          );
        }
      }
    }
  }

  if (userTeam && boostedSummaries.length > 0) {
    state.pdaInbox.unshift({
      id: `EMAIL_${state.season}_W${state.week}_PROG`,
      season: state.season,
      week: state.week,
      senderRole: 'COACH',
      senderName: `${userTeam.coaches.hc.name} (Head Coach)`,
      subject: `Week ${state.week} In-Season Player Progression Report`,
      body: `Our coaching staff completed the Week ${state.week} player development evaluations! High morale and strong on-field execution produced the following rating changes:\n\n• ${boostedSummaries.slice(0, 8).join('\n• ')}`,
      read: false,
      priority: 'HIGH',
      actionTab: 'ROSTER',
    });
  }

  return boostedSummaries;
}

export function generateWeeklyNewspaper(
  state: FranchiseState,
  completedWeek: number,
): NewspaperIssue {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;
  const weekGames = state.schedule.filter(
    (g) => g.season === state.season && g.week === completedWeek && g.played,
  );
  const userGame = weekGames.find(
    (g) => g.homeTeamId === userTeam.id || g.awayTeamId === userTeam.id,
  );

  let localHeadline = `${userTeam.city.toUpperCase()} PREPARES FOR CRUCIAL STRETCH`;
  let localSubhead = `Rested ${userTeam.name} (${userTeam.wins}-${userTeam.losses}) emerge from Bye Week focused on execution`;
  let localBody = `Head Coach ${userTeam.coaches.hc.name} put the ${userTeam.city} ${userTeam.name} through spirited situational drills this week. With the salary cap sitting at $${state.salaryCapM.toFixed(1)}M and fan support at ${userTeam.fanSupport}%, expectations inside ${userTeam.stadiumName} remain sky-high.`;

  if (userGame) {
    const isHome = userGame.homeTeamId === userTeam.id;
    const oppId = isHome ? userGame.awayTeamId : userGame.homeTeamId;
    const oppTeam = state.teams.find((t) => t.id === oppId)!;
    const userScore = isHome ? userGame.homeScore : userGame.awayScore;
    const oppScore = isHome ? userGame.awayScore : userGame.homeScore;
    const userWon = userScore > oppScore;

    if (userWon) {
      localHeadline = `${userTeam.name.toUpperCase()} ROLL PAST ${oppTeam.city.toUpperCase()}, ${userScore}-${oppScore}!`;
      localSubhead = `${userGame.mvpPlayerName ?? userTeam.city} sparks statement victory as ${userTeam.city} improves to ${userTeam.wins}-${userTeam.losses}`;
      localBody = `Backed by a physical gameplan and relentless fourth-quarter execution, the ${userTeam.city} ${userTeam.name} defeated the ${oppTeam.city} ${oppTeam.name} ${userScore}-${oppScore}. Game MVP ${userGame.mvpPlayerName ?? 'the starting unit'} (${userGame.mvpSummary ?? 'dominant outing'}) set the tone early, sending ${userTeam.finances.lastAttendance.toLocaleString()} fans home thrilled.`;
    } else {
      localHeadline = `HEARTBREAK: ${oppTeam.name.toUpperCase()} TOP ${userTeam.name.toUpperCase()}, ${oppScore}-${userScore}`;
      localSubhead = `Missed opportunities cost ${userTeam.city} (${userTeam.wins}-${userTeam.losses}) in bruising battle with ${oppTeam.city}`;
      localBody = `The ${userTeam.city} ${userTeam.name} couldn't overcome key turnovers and timely plays by ${oppTeam.city}, falling ${oppScore}-${userScore}. Coach ${userTeam.coaches.hc.name} vowed immediate adjustments in the film room ahead of next week's matchup.`;
    }
  }

  const userRoster = state.players
    .filter((p) => p.teamId === userTeam.id)
    .sort((a, b) => b.overall - a.overall);
  const vocalPlayer =
    userRoster.find((p) => p.morale < 65) ??
    userRoster[0];
  const localMoraleSpotlight = vocalPlayer
    ? `${vocalPlayer.position} ${vocalPlayer.firstName} ${vocalPlayer.lastName} (${vocalPlayer.overall} OVR, Morale ${vocalPlayer.morale}%): "${vocalPlayer.moraleReason}"`
    : 'Locker room chemistry remains steady across all units.';

  // National USA TODAY Story
  const marqueeGame: ScheduledGame | undefined = [...weekGames].sort(
    (a, b) => b.homeScore + b.awayScore - (a.homeScore + a.awayScore),
  )[0];

  let nationalHeadline = `DEFENSE & THE HIT STICK RULE THE 2004 NFL LANDSCAPE`;
  let nationalSubhead = `Hard-hitting linebackers and safeties tilt championship contenders across Week ${completedWeek}`;
  let nationalBody = `Across the league in Week ${completedWeek}, front offices are discovering that physical defense and locker room morale separate contenders from pretenders.`;

  if (marqueeGame) {
    const hTeam = state.teams.find((t) => t.id === marqueeGame.homeTeamId)!;
    const aTeam = state.teams.find((t) => t.id === marqueeGame.awayTeamId)!;
    const winner = marqueeGame.homeScore >= marqueeGame.awayScore ? hTeam : aTeam;
    const loser = marqueeGame.homeScore >= marqueeGame.awayScore ? aTeam : hTeam;
    const high = Math.max(marqueeGame.homeScore, marqueeGame.awayScore);
    const low = Math.min(marqueeGame.homeScore, marqueeGame.awayScore);

    nationalHeadline = `${winner.city.toUpperCase()} OUTLASTS ${loser.city.toUpperCase()} ${high}-${low} IN WEEK ${completedWeek} THRILLER`;
    nationalSubhead = `${marqueeGame.mvpPlayerName ?? winner.name} headlines national spotlight as playoff race heats up`;
    nationalBody = `In the marquee game of Week ${completedWeek}, the ${winner.city} ${winner.name} (${winner.wins}-${winner.losses}) prevailed ${high}-${low} over the ${loser.city} ${loser.name}. League analysts on EA Sports Radio praised ${winner.coaches.hc.name}'s aggressive adjustments.`;
  }

  // Pick Offensive & Defensive Players of the Week
  const topQBs = state.players
    .filter((p) => p.teamId !== 'FA' && p.teamId !== 'DRAFT' && p.position === 'QB')
    .sort((a, b) => b.stats.passYards + b.stats.passTDs * 35 - (a.stats.passYards + a.stats.passTDs * 35));
  const topDefs = state.players
    .filter((p) => p.teamId !== 'FA' && p.teamId !== 'DRAFT' && ['LB', 'DL', 'S', 'CB'].includes(p.position))
    .sort(
      (a, b) =>
        b.stats.tackles +
        b.stats.sacks * 8 +
        b.stats.defInterceptions * 10 -
        (a.stats.tackles + a.stats.sacks * 8 + a.stats.defInterceptions * 10),
    );

  const offPow = topQBs[0]
    ? `${topQBs[0].firstName} ${topQBs[0].lastName} (${topQBs[0].teamId} QB) — ${topQBs[0].stats.passYards} YDS, ${topQBs[0].stats.passTDs} TD`
    : 'Peyton Manning (IND QB)';
  const defPow = topDefs[0]
    ? `${topDefs[0].firstName} ${topDefs[0].lastName} (${topDefs[0].teamId} ${topDefs[0].position}) — ${topDefs[0].stats.tackles} TAK, ${topDefs[0].stats.sacks} SACK, ${topDefs[0].stats.defInterceptions} INT`
    : 'Ray Lewis (BAL LB)';

  const issue: NewspaperIssue = {
    id: `NEWS_${state.season}_W${completedWeek}`,
    season: state.season,
    week: completedWeek,
    localPaperTitle: userTeam.localPaperName,
    localHeadline,
    localSubhead,
    localBody,
    localMoraleSpotlight,
    nationalPaperTitle: 'USA TODAY SPORTS // NATIONAL EDITION',
    nationalHeadline,
    nationalSubhead,
    nationalBody,
    offensivePlayerOfWeek: offPow,
    defensivePlayerOfWeek: defPow,
  };

  state.newspapers.unshift(issue);
  return issue;
}

export function generateWeeklyTonyBrunoSegment(
  state: FranchiseState,
  week: number,
): TonyBrunoSegment {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;
  const starPlayer = state.players
    .filter((p) => p.teamId === userTeam.id)
    .sort((a, b) => b.overall - a.overall)[0];
  const starName = starPlayer
    ? `${starPlayer.firstName} ${starPlayer.lastName}`
    : `${userTeam.city}'s franchise cornerstone`;

  const topics = [
    {
      badge: 'HIT STICK REVOLUTION',
      monologue: `Welcome back to The Tony Bruno Show on EA Sports Radio! Everyone around the league is talking about the ${userTeam.city} ${userTeam.name} (${userTeam.wins}-${userTeam.losses}) and whether ${starName} can carry this squad all the way to the Championship Bowl! Let's go to the phones!`,
      callerName: 'Big Vinny',
      callerCity: `${userTeam.city}`,
      callerQuote: `Tony, first-time caller, long-time listener! Look, Coach ${userTeam.coaches.hc.name} has the talent on this roster, but if we don't unleash the Hit Stick on defense and dominate the line of scrimmage, we're leaving wins on the field!`,
      rebuttal: `Vinny, you nailed it! In 2005, defense wins championships, and locker room morale is the fuel! How should the ${userTeam.name} front office respond this week?`,
      question: `TONY BRUNO RADIO POLL: What message should ${userTeam.city}'s leadership send before this week's kickoff?`,
      options: [
        {
          id: 'OPT_LOCKER_ROOM',
          label: `Praise ${starName} & guarantee a physical team victory on air`,
          effectDescription: '+4 Team Morale across the active roster',
          moraleDelta: 4,
          fanDelta: 1,
          cashDeltaM: 0,
        },
        {
          id: 'OPT_FAN_RALLY',
          label: `Host a live Tony Bruno Pep Rally outside ${userTeam.stadiumName}`,
          effectDescription: '+5% Fan Support & +$0.40M Merchandise Surge',
          moraleDelta: 1,
          fanDelta: 5,
          cashDeltaM: 0.4,
        },
        {
          id: 'OPT_SPONSOR_SPOT',
          label: 'Sign an exclusive national radio sponsorship package',
          effectDescription: '+$1.25M Owner Cash for stadium & contract bonuses',
          moraleDelta: 0,
          fanDelta: 0,
          cashDeltaM: 1.25,
        },
      ],
    },
    {
      badge: 'FRANCHISE HOT SEAT & CAP DRAMA',
      monologue: `You're locked into The Tony Bruno Show! Phones are lighting up across the country! We're looking at ${userTeam.city} sitting at ${userTeam.wins}-${userTeam.losses}. Some insiders say their ${userTeam.offenseScheme} playbook is unstoppable; others say the division rivals have their number!`,
      callerName: 'sal from South Philly',
      callerCity: 'National Line',
      callerQuote: `Tony! Are we really buying the hype in ${userTeam.city}?! Let's see how ${starName} handles an eight-man blitz when the weather turns cold in December!`,
      rebuttal: `Whoa, shots fired at ${userTeam.city}! Coach, the microphone is yours — how are you steering the franchise this week?`,
      question: `TONY BRUNO CALL-IN: How do you respond to national skeptics questioning ${userTeam.city}?`,
      options: [
        {
          id: 'OPT_BULLETIN_BOARD',
          label: 'Post the caller clip on the locker room bulletin board',
          effectDescription: '+5 Team Morale (Us-Against-The-World mentality)',
          moraleDelta: 5,
          fanDelta: 2,
          cashDeltaM: 0,
        },
        {
          id: 'OPT_PROMO_TICKETS',
          label: 'Pack the stadium with a Prime-Time towel giveaway',
          effectDescription: '+6% Fan Support & louder homefield advantage',
          moraleDelta: 2,
          fanDelta: 6,
          cashDeltaM: -0.25,
        },
        {
          id: 'OPT_MEDIA_TOUR',
          label: 'Send star veterans on a paid national network tour',
          effectDescription: '+$1.10M Owner Cash & +2% Fan Support',
          moraleDelta: 1,
          fanDelta: 2,
          cashDeltaM: 1.1,
        },
      ],
    },
  ];

  const chosen = topics[week % topics.length];
  const segment: TonyBrunoSegment = {
    id: `RADIO_${state.season}_W${week}`,
    season: state.season,
    week,
    showTitle: `THE TONY BRUNO SHOW // WEEK ${week} LIVE BROADCAST`,
    topicBadge: chosen.badge,
    tonyMonologue: chosen.monologue,
    callerName: chosen.callerName,
    callerCity: chosen.callerCity,
    callerQuote: chosen.callerQuote,
    tonyRebuttal: chosen.rebuttal,
    guestInterviewName: `${starName} (${userTeam.abbr} Captain)`,
    guestInterviewQuote: `"Tell Tony's listeners we hear every word. When we step between those white lines on Sunday, our pads will do the talking."`,
    pollQuestion: chosen.question,
    pollOptions: chosen.options,
  };

  state.radioSegments.unshift(segment);
  return segment;
}

export function answerTonyBrunoPoll(
  state: FranchiseState,
  segmentId: string,
  optionId: string,
): { success: boolean; message: string } {
  const seg = state.radioSegments.find((s) => s.id === segmentId);
  if (!seg || seg.selectedOptionId) {
    return { success: false, message: 'Poll already answered for this broadcast.' };
  }

  const opt = seg.pollOptions.find((o) => o.id === optionId);
  if (!opt) return { success: false, message: 'Invalid radio poll option.' };

  seg.selectedOptionId = optionId;
  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;

  if (opt.moraleDelta !== 0) {
    state.players
      .filter((p) => p.teamId === userTeam.id)
      .forEach((p) => {
        p.morale = clamp(p.morale + opt.moraleDelta, 25, 99);
        if (opt.moraleDelta > 0) p.moraleTrend = 'UP';
      });
  }
  if (opt.fanDelta !== 0) {
    userTeam.fanSupport = clamp(userTeam.fanSupport + opt.fanDelta, 35, 100);
  }
  if (opt.cashDeltaM !== 0) {
    userTeam.finances.ownerCashM = Number(
      (userTeam.finances.ownerCashM + opt.cashDeltaM).toFixed(2),
    );
  }

  return {
    success: true,
    message: `Tony Bruno Show Response Logged: ${opt.effectDescription}`,
  };
}
