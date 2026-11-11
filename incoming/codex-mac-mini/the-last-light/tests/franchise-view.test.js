import test from 'node:test';
import assert from 'node:assert/strict';
import { createFranchise, advanceWeek, lastGame } from '../src/sim/franchise.js';
import { shell, recapDialog, playerDialog } from '../src/franchise-view.js';
import { validateFranchise } from '../src/franchise-storage.js';

const defaults = { search: '', position: 'all', standings: 'divisions', market: 'free', leagueSchedule: false, tradeTeam: 0, outgoing: '' };
test('every front-office view reads state without mutating gameplay or consuming RNG', () => {
  const s = createFranchise(), before = JSON.stringify(s);
  for (const view of ['overview', 'roster', 'gameplan', 'schedule', 'standings', 'transactions', 'scouting', 'owner', 'news', 'history', 'settings']) {
    const html = shell(s, { ...defaults, view }, { writable: true, error: '' });
    assert.match(html, /<main/); assert.equal(JSON.stringify(s), before);
  }
});
test('imported player names, news categories, rounds and drive text cannot inject markup', () => {
  const s = createFranchise(), payload = '<img src=x onerror=alert(1)>';
  s.news[0].category = payload; s.players[0].name = payload;
  advanceWeek(s); const g = lastGame(s); g.round = payload; g.drives[0].result = payload;
  assert.doesNotThrow(() => validateFranchise(s));
  for (const html of [shell(s, { ...defaults, view: 'news' }, { writable: true, error: '' }), recapDialog(s, g), playerDialog(s, s.players[0])]) {
    assert.ok(!html.includes(payload)); assert.ok(html.includes('&lt;img'));
  }
});
