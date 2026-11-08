/** Original office nonsense. Content has no browser or clock dependencies. */
export const HONK_MODES = Object.freeze({
  career: Object.freeze({ name: 'Career', health: 6, enemySpeed: 1, paperSpeed: 1, spawnRate: 1, bossHealth: 54, description: 'A normal, deeply abnormal workday.' }),
  casual: Object.freeze({ name: 'Casual Friday', health: 9, enemySpeed: .82, paperSpeed: .78, spawnRate: 1.2, bossHealth: 40, description: 'More health. Slower emails. Same nonsense.' }),
});
export const HONK_INCIDENTS = Object.freeze({
  pizza: Object.freeze({ title: 'COMPENSATION: PIZZA', description: 'No raises. Three pizzas. Coworkers are distracted by the pizza.', duration: 480 }),
  meeting: Object.freeze({ title: 'MANDATORY FUN', description: 'Pink circles become meetings. Get out before the agenda lands.', duration: 480 }),
  storm: Object.freeze({ title: 'REPLY-ALL APOCALYPSE', description: 'Emails multiply. Honk them away to charge your own Reply All.', duration: 480 }),
});
export const HONK_AWARDS = Object.freeze([
  { id: 'first-day', name: 'Probation survived', icon: '01', description: 'Earn your first promotion.', test: s => s.shift > 1 },
  { id: 'bowler', name: 'Chairperson of the bored', icon: '02', description: 'Hit 8 coworkers with rolling chairs in one career.', test: s => s.stats.chairHits >= 8 },
  { id: 'strike', name: 'Hostile seating plan', icon: '03', description: 'Hit 3 coworkers with one chair launch.', test: s => s.stats.bestChairChain >= 3 },
  { id: 'reply-guy', name: 'Please unsubscribe', icon: '04', description: 'Use Reply All 3 times in one career.', test: s => s.stats.replies >= 3 },
  { id: 'lunch', name: 'Fridge acquisition', icon: '05', description: 'Eat 10 lunches in one career.', test: s => s.stats.lunches >= 10 },
  { id: 'calendar', name: 'Calendar bankruptcy', icon: '06', description: 'Cancel 50 meetings in one career.', test: s => s.stats.meetings >= 50 },
  { id: 'ceo', name: 'Chief Executive Goose', icon: '07', description: 'Defeat Human Resources.', test: s => s.stats.bosses >= 1 },
  { id: 'combo', name: 'Disruptive thought leader', icon: '08', description: 'Chain 20 disruptions without losing the streak.', test: s => s.bestCombo >= 20 },
  { id: 'overqualified', name: 'Unpaid legend', icon: '09', description: 'Defeat two overtime bosses after becoming CEO.', test: s => s.stats.bosses >= 3 },
]);
export const HONK_TIES = Object.freeze([
  { id: 'orange', name: 'Probation orange', color: '#e86539', award: null },
  { id: 'mint', name: 'Questionable consultant', color: '#6cb4a6', award: 'first-day' },
  { id: 'pink', name: 'Business flamingo', color: '#ce6f9d', award: 'bowler' },
  { id: 'gold', name: 'Executive compensation', color: '#d9ad3d', award: 'ceo' },
]);
export function earnedHonkAwards(state) { return HONK_AWARDS.filter(award => award.test(state)).map(award => award.id); }
export function honkReview(state) {
  const { stats } = state;
  const grade = state.stats.bosses ? 'PROMOTE IMMEDIATELY' : state.shift >= 3 ? 'CONCERNING POTENTIAL' : state.shift === 2 ? 'MANAGEMENT MATERIAL' : 'NEEDS LESS SUPERVISION. SOMEHOW.';
  const comment = stats.chairHits >= 8 ? '“A powerful voice in office furniture.”' : stats.lunches >= 8 ? '“Aggressively expanded into the lunch sector.”' : stats.replies >= 3 ? '“Understands the scale of modern communication.”' : state.stats.bosses ? '“Made everyone redundant. Including redundancy.”' : stats.meetings >= 20 ? '“A bold vision for a meeting-free workplace.”' : '“Not a team player. Not a person, either.”';
  return { grade, comment, minutesReturned: stats.meetings * 30, equipmentCost: stats.objects * 249 + stats.chairHits * 39, code: `G-${state.seed}-${state.mode === 'casual' ? 'F' : 'C'}` };
}
