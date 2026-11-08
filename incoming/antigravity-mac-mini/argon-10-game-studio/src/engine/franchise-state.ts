import { FranchiseState, PdaEmail } from '../models/types';
import { buildInitialLeague } from './rosters-and-generator';
import { generateRegularSeasonSchedule } from './schedule-and-standings';
import {
  generateWeeklyNewspaper,
  generateWeeklyTonyBrunoSegment,
} from './storyline-central';

const STORAGE_KEY = 'madden_2005_franchise_dynasty_v1';

export function createNewFranchiseState(
  userTeamId = 'BAL',
  seed = 2005,
): FranchiseState {
  const { teams, players, draftPicks } = buildInitialLeague(seed);
  const selectedTeam = teams.find((t) => t.id === userTeamId) ?? teams[0];
  const season = 2004; // 2004-2005 NFL Season (Madden NFL 2005)
  const schedule = generateRegularSeasonSchedule(season, teams);

  const initialInbox: PdaEmail[] = [
    {
      id: `EMAIL_WELCOME_${season}`,
      season,
      week: 1,
      senderRole: 'OWNER',
      senderName: `${selectedTeam.city} Ownership Group`,
      subject: `Welcome to ${selectedTeam.city}! 2004 Franchise Mode Expectations`,
      body: `Welcome to the front office of the ${selectedTeam.city} ${selectedTeam.name}! In Madden 2005 Franchise Mode, you control every facet of our dynasty:\n\n• Monitor Player Morale, Local & National Newspapers, and The Tony Bruno Radio Show in Storyline Central.\n• Manage our $80.50M Salary Cap, Depth Chart, In-Season Extensions, and Multi-Asset Trades.\n• Call plays & unleash the new 2005 Defensive Playmaker + Hit Stick on the Interactive Game Day Field, or Instant-Sim week by week!`,
      read: false,
      priority: 'HIGH',
      actionTab: 'STORYLINE',
    },
    {
      id: `EMAIL_SCOUT_${season}`,
      season,
      week: 1,
      senderRole: 'SCOUT',
      senderName: 'College Scouting Department',
      subject: '2004-2005 NCAA Draft Class & Combine Board Ready',
      body: `Coach, we've uploaded 64 top college prospects with 40-yard dash times, bench press reps, and Wonderlic scores. You can inspect the Draft Class or trade future picks in the Trade Center before the Week 8 Trade Deadline!`,
      read: false,
      priority: 'NORMAL',
      actionTab: 'TRADE',
    },
  ];

  const state: FranchiseState = {
    version: 1,
    franchiseName: `${selectedTeam.city} ${selectedTeam.name} Dynasty`,
    userTeamId: selectedTeam.id,
    season,
    week: 1,
    phase: 'REGULAR_SEASON',
    salaryCapM: 80.5,
    teams,
    players,
    schedule,
    draftPicks,
    newspapers: [],
    radioSegments: [],
    pdaInbox: initialInbox,
    seasonAwards: [],
    retiredPlayers: [],
    activeDraft: null,
    campDrillsRemaining: 4,
    franchiseTagUsedThisOffseason: false,
    championsHistory: [],
    tradeDeadlineWeek: 8,
  };

  generateWeeklyNewspaper(state, 1);
  generateWeeklyTonyBrunoSegment(state, 1);

  return state;
}

export function saveFranchiseState(state: FranchiseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function loadFranchiseState(): FranchiseState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FranchiseState;
    if (
      !parsed ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.teams) ||
      !Array.isArray(parsed.players)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedFranchiseState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function updateOwnerPricing(
  state: FranchiseState,
  ticketPrice: number,
  concessionPrice: number,
  parkingPrice: number,
  marketingBudgetM: number,
): { success: boolean; message: string } {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  if (!userTeam) return { success: false, message: 'User team not found.' };

  userTeam.finances.ticketPrice = Math.max(40, Math.min(120, Math.round(ticketPrice)));
  userTeam.finances.concessionPrice = Math.max(5, Math.min(25, Math.round(concessionPrice)));
  userTeam.finances.parkingPrice = Math.max(10, Math.min(60, Math.round(parkingPrice)));
  userTeam.finances.marketingBudgetM = Number(
    Math.max(0.5, Math.min(8.0, marketingBudgetM)).toFixed(2),
  );

  return {
    success: true,
    message: `Updated ${userTeam.stadiumName} pricing: Tickets $${userTeam.finances.ticketPrice}, Concessions $${userTeam.finances.concessionPrice}, Parking $${userTeam.finances.parkingPrice}, Marketing $${userTeam.finances.marketingBudgetM.toFixed(1)}M/yr.`,
  };
}

export function upgradeCoachStaffMember(
  state: FranchiseState,
  role: 'hc' | 'oc' | 'dc' | 'trainer',
): { success: boolean; message: string } {
  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  if (!userTeam) return { success: false, message: 'User team not found.' };

  const coach = userTeam.coaches[role];
  if (coach.rating >= 99) {
    return {
      success: false,
      message: `${coach.name} (${coach.role}) is already at maximum 99 Rating!`,
    };
  }

  const upgradeCostM = 1.5;
  if (userTeam.finances.ownerCashM < upgradeCostM) {
    return {
      success: false,
      message: `Insufficient Owner Cash ($${userTeam.finances.ownerCashM.toFixed(2)}M available; requires $${upgradeCostM.toFixed(2)}M).`,
    };
  }

  userTeam.finances.ownerCashM = Number(
    (userTeam.finances.ownerCashM - upgradeCostM).toFixed(2),
  );
  coach.rating = Math.min(99, coach.rating + 3);
  coach.salaryM = Number((coach.salaryM + 0.25).toFixed(2));

  return {
    success: true,
    message: `Invested $${upgradeCostM.toFixed(2)}M in Coaching Staff clinic! ${coach.name} (${coach.role}) improved to ${coach.rating} Rating!`,
  };
}
