const S = newLeague({ userTid: 7 });
startRegularSeason(S);
for (let d = 0; d < 60; d++) { const r = simDay(S); if (r === 'allstar') allStarAuto(S); }
for (const ep of S.radio.slice(0, 2)) { console.log('==', ep.title); ep.lines.forEach(l => console.log(' ', l.who + ':', l.text)); }
