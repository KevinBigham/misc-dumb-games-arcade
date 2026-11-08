(function (root) {
  "use strict";
  const VERSION = 1,
    POS = ["PG", "SG", "SF", "PF", "C"];
  const TEAMS = [
    ["Boston", "Shamrocks", "BOS", "East", "Atlantic", "#45bd98", 8],
    ["New York", "Empire", "NYE", "East", "Atlantic", "#ec8d3f", 10],
    ["Brooklyn", "Knights", "BRK", "East", "Atlantic", "#b9c5d6", 9],
    ["Philadelphia", "Liberty", "PHL", "East", "Atlantic", "#5a9ef0", 8],
    ["Toronto", "Northstars", "TOR", "East", "Atlantic", "#d06091", 8],
    ["Chicago", "Union", "CHI", "East", "Central", "#e66363", 9],
    ["Detroit", "Motors", "DET", "East", "Central", "#598de0", 7],
    ["Cleveland", "Guardians", "CLE", "East", "Central", "#c9a04e", 6],
    ["Indianapolis", "Racers", "IND", "East", "Central", "#e5c95c", 6],
    ["Milwaukee", "Timber", "MIL", "East", "Central", "#75ad87", 5],
    ["Miami", "Flare", "MIA", "East", "Southeast", "#fa7376", 8],
    ["Orlando", "Orbit", "ORL", "East", "Southeast", "#77a3ef", 7],
    ["Atlanta", "Flight", "ATL", "East", "Southeast", "#ea7961", 8],
    ["Charlotte", "Swarm", "CHA", "East", "Southeast", "#58c6ca", 6],
    ["Washington", "Sentinels", "WAS", "East", "Southeast", "#a799df", 8],
    ["Los Angeles", "Stars", "LAS", "West", "Pacific", "#cba0f4", 10],
    ["San Diego", "Surge", "SDG", "West", "Pacific", "#64c9d4", 8],
    ["San Francisco", "Gold", "SFG", "West", "Pacific", "#e4bf60", 9],
    ["Sacramento", "Royals", "SAC", "West", "Pacific", "#b38fdf", 5],
    ["Phoenix", "Firebirds", "PHX", "West", "Pacific", "#eb9a66", 7],
    ["Dallas", "Wranglers", "DAL", "West", "Southwest", "#61b5d9", 9],
    ["Houston", "Comets", "HOU", "West", "Southwest", "#e87e85", 9],
    ["San Antonio", "Marshals", "SAN", "West", "Southwest", "#b2bdc9", 6],
    ["Memphis", "Blues", "MEM", "West", "Southwest", "#7b9cda", 5],
    ["New Orleans", "Crescent", "NOL", "West", "Southwest", "#89c7c2", 6],
    ["Denver", "Peaks", "DEN", "West", "Northwest", "#91b6df", 7],
    ["Salt Lake", "Summit", "SLC", "West", "Northwest", "#b5a0e5", 5],
    ["Portland", "Pioneers", "POR", "West", "Northwest", "#e28073", 6],
    ["Seattle", "Evergreens", "SEA", "West", "Northwest", "#66bf99", 8],
    ["Minnesota", "Frost", "MIN", "West", "Northwest", "#80bad4", 6],
  ];
  const FIRST = [
    "Marcus",
    "Andre",
    "Jalen",
    "Isaiah",
    "Darius",
    "Cameron",
    "Malik",
    "Devin",
    "Jordan",
    "Terrence",
    "Elijah",
    "Xavier",
    "Damon",
    "Tyrell",
    "Adrian",
    "Miles",
    "Noah",
    "Cole",
    "Dante",
    "Tobias",
    "Nico",
    "Luca",
    "Mateo",
    "Victor",
    "Stefan",
    "Lamar",
    "Jaylen",
    "Caleb",
    "Wesley",
    "Grant",
    "Julian",
    "Owen",
    "Trey",
    "Keon",
    "Reggie",
    "Anthony",
    "Kendrick",
    "Blake",
    "Aaron",
    "Desmond",
    "Zion",
    "Rafael",
    "Solomon",
    "Evan",
    "Drew",
    "Bennett",
    "Jamal",
    "Quentin",
  ];
  const LAST = [
    "Williams",
    "Carter",
    "Johnson",
    "Brooks",
    "Walker",
    "Hayes",
    "Mitchell",
    "Jackson",
    "Coleman",
    "Davis",
    "Reed",
    "Robinson",
    "Price",
    "Monroe",
    "Harris",
    "Butler",
    "Grant",
    "Foster",
    "Marshall",
    "Young",
    "Ellis",
    "Wright",
    "Bennett",
    "Wallace",
    "Porter",
    "Sullivan",
    "Mason",
    "Cross",
    "King",
    "Parker",
    "Edwards",
    "Reeves",
    "Miles",
    "Henderson",
    "Lawson",
    "Vaughn",
    "Petrov",
    "Silva",
    "Novak",
    "Diallo",
    "Okafor",
    "Santos",
    "Rivers",
    "Mercer",
    "Pierce",
    "Banks",
    "Holloway",
    "West",
  ];
  const COLLEGES = [
    "Kansas",
    "Duke",
    "Kentucky",
    "UCLA",
    "North Carolina",
    "Michigan State",
    "Connecticut",
    "Arizona",
    "Texas",
    "Gonzaga",
    "Memphis",
    "Syracuse",
    "Villanova",
    "Georgetown",
    "Louisville",
    "Florida",
    "Ohio State",
    "LSU",
    "Wake Forest",
    "International",
    "High school",
    "Illinois",
    "Oklahoma State",
    "Missouri",
  ];
  const STATS = [
    "gp",
    "min",
    "pts",
    "reb",
    "ast",
    "stl",
    "blk",
    "tov",
    "fgm",
    "fga",
    "tpm",
    "tpa",
    "ftm",
    "fta",
  ];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const blank = () => Object.fromEntries(STATS.map((k) => [k, 0]));
  function rand(s) {
    s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
    return s.rng / 4294967296;
  }
  function int(s, a, b) {
    return a + Math.floor(rand(s) * (b - a + 1));
  }
  function normal(s) {
    return (rand(s) + rand(s) + rand(s) + rand(s) - 2) * 1.73;
  }
  function pick(s, a) {
    return a[Math.floor(rand(s) * a.length)];
  }
  function weighted(s, a, fn) {
    const total = a.reduce((n, p) => n + Math.max(0.01, fn(p)), 0);
    let n = rand(s) * total;
    for (const p of a) {
      n -= Math.max(0.01, fn(p));
      if (n <= 0) return p;
    }
    return a[a.length - 1];
  }
  function overall(p) {
    const w = {
      PG: [0.1, 0.22, 0.27, 0.18, 0.05, 0.18],
      SG: [0.16, 0.29, 0.16, 0.19, 0.04, 0.16],
      SF: [0.2, 0.22, 0.12, 0.22, 0.1, 0.14],
      PF: [0.26, 0.1, 0.06, 0.23, 0.23, 0.12],
      C: [0.28, 0.03, 0.04, 0.25, 0.29, 0.11],
    }[p.pos];
    return Math.round(
      Object.values(p.skills).reduce((n, v, i) => n + v * w[i], 0),
    );
  }
  function makePlayer(s, target, age, pos, prospect = false) {
    const p = {
      id: "p" + s.nextId++,
      name: pick(s, FIRST) + " " + pick(s, LAST),
      pos,
      age,
      height: [73, 76, 79, 82, 84][POS.indexOf(pos)] + int(s, -2, 3),
      number: int(s, 0, 55),
      college: pick(s, COLLEGES),
      skills: {},
      potential: 0,
      teamId: null,
      prevTeamId: null,
      salary: 0,
      years: 0,
      morale: int(s, 65, 90),
      energy: 100,
      injury: 0,
      injuryName: "",
      stats: blank(),
      career: blank(),
      history: [],
      minutes: 0,
      usage: 20,
      scouted: 0,
      prospect,
    };
    const biases = {
      PG: [-6, 2, 13, 0, -20, 6],
      SG: [0, 12, 2, 0, -14, 4],
      SF: [4, 6, -3, 3, 0, 3],
      PF: [10, -8, -12, 5, 12, -2],
      C: [12, -19, -15, 9, 17, -7],
    }[pos];
    [
      "inside",
      "shooting",
      "playmaking",
      "defense",
      "rebounding",
      "athleticism",
    ].forEach(
      (k, i) =>
        (p.skills[k] = clamp(
          Math.round(target + biases[i] + normal(s) * 6),
          25,
          99,
        )),
    );
    p.ovr = overall(p);
    p.potential = clamp(
      p.ovr + int(s, 0, age < 24 ? 23 : age < 28 ? 10 : 3),
      p.ovr,
      99,
    );
    p.archetype = {
      PG:
        p.skills.shooting > p.skills.playmaking
          ? "Scoring guard"
          : "Floor general",
      SG:
        p.skills.defense > p.skills.shooting ? "Two-way guard" : "Shot creator",
      SF:
        p.skills.defense > p.skills.inside ? "Wing stopper" : "Versatile wing",
      PF: p.skills.shooting > 68 ? "Stretch four" : "Interior force",
      C: p.skills.defense > p.skills.inside ? "Rim protector" : "Paint anchor",
    }[pos];
    p.usage = clamp(Math.round((p.ovr - 60) * 1.7 + 8), 8, 45);
    p.salary = demand(p);
    p.years = int(s, 1, 4);
    return p;
  }
  function demand(p) {
    return (
      Math.round(
        Math.max(
          0.8,
          Math.pow(Math.max(0, p.ovr - 47) / 10, 2.25) * 0.45 +
            (p.age < 25 ? (p.potential - p.ovr) * 0.045 : 0),
        ) * 10,
      ) / 10
    );
  }
  function roster(s, id) {
    return s.players.filter((p) => p.teamId === id && !p.retired);
  }
  function team(s, id) {
    return s.teams.find((t) => t.id === id);
  }
  function payroll(s, id) {
    return (
      roster(s, id).reduce((n, p) => n + p.salary, 0) +
      (team(s, id).deadCap || 0)
    );
  }
  function autoRotation(s, id) {
    const r = roster(s, id);
    r.forEach((p) => (p.minutes = 0));
    const chosen = [];
    POS.forEach((pos) => {
      const p = r
        .filter((p) => p.pos === pos && !chosen.includes(p))
        .sort((a, b) => b.ovr - a.ovr)[0];
      if (p) chosen.push(p);
    });
    r.slice()
      .sort((a, b) => b.ovr - a.ovr)
      .forEach((p) => {
        if (chosen.length < 10 && !chosen.includes(p)) chosen.push(p);
      });
    chosen.forEach((p, i) => (p.minutes = i < 5 ? 32 : 16));
    if (chosen.length < 10 && chosen.length) {
      const sum = chosen.reduce((n, p) => n + p.minutes, 0);
      chosen.forEach((p) => (p.minutes = Math.floor((p.minutes / sum) * 240)));
      chosen[0].minutes += 240 - chosen.reduce((n, p) => n + p.minutes, 0);
    }
    return chosen;
  }
  function strength(s, id) {
    const r = roster(s, id)
      .filter((p) => !p.injury)
      .sort((a, b) => b.minutes - a.minutes || b.ovr - a.ovr)
      .slice(0, 10);
    const sum = r.reduce((n, p) => n + (p.minutes || 8), 0) || 1;
    return Math.round(
      r.reduce((n, p) => n + p.ovr * (p.minutes || 8), 0) / sum,
    );
  }
  function schedule(s) {
    let ring = s.teams.map((t) => t.id),
      rounds = [];
    for (let k = 0; k < 29; k++) {
      let games = [];
      for (let i = 0; i < 15; i++) {
        let a = ring[i],
          b = ring[29 - i];
        games.push(k % 2 ? [b, a] : [a, b]);
      }
      rounds.push(games);
      ring = [ring[0], ring[29], ...ring.slice(1, 29)];
    }
    s.schedule = [];
    for (let d = 0; d < 82; d++) {
      const rd = rounds[d < 58 ? d % 29 : (d - 58) % 12];
      rd.forEach(([a, b], i) => {
        const flip = d < 58 ? Math.floor(d / 29) : d >= 70 ? 1 : 0;
        let home = flip ? b : a,
          away = flip ? a : b;
        s.schedule.push({
          id: `${s.year}-${d}-${i}`,
          day: d,
          home,
          away,
          played: false,
          hs: 0,
          as: 0,
        });
      });
    }
  }
  function news(s, text, type = "league") {
    s.news.unshift({ id: s.nextId++, day: s.day, year: s.year, text, type });
    s.news = s.news.slice(0, 120);
  }
  function newProspects(s) {
    s.prospects = [];
    for (let i = 0; i < 78; i++) {
      const tier =
        i < 3
          ? int(s, 70, 78)
          : i < 15
            ? int(s, 62, 73)
            : i < 35
              ? int(s, 55, 67)
              : int(s, 43, 62);
      const p = makePlayer(s, tier, int(s, 18, 22), POS[i % 5], true);
      p.potential = clamp(p.ovr + int(s, 8, 26), p.ovr, 99);
      p.salary = 0;
      p.years = 0;
      p.estimate = clamp(p.ovr + int(s, -10, 10), 35, 95);
      p.potEstimate = clamp(p.potential + int(s, -10, 10), p.estimate, 99);
      s.prospects.push(p);
    }
    s.prospects.sort((a, b) => b.estimate - a.estimate);
  }
  function createCareer(options = {}) {
    const seed = Number(options.seed) || Math.floor(Date.now() % 4294967295);
    const s = {
      version: VERSION,
      rng: seed,
      seed,
      nextId: 1,
      manager: options.manager || "General Manager",
      userId: options.teamId || "SEA",
      difficulty: options.difficulty || "standard",
      year: 2005,
      day: 0,
      phase: "regular",
      cap: 75,
      players: [],
      teams: [],
      schedule: [],
      news: [],
      history: [],
      picks: [],
      boxes: {},
      scoutPoints: 100,
      draft: null,
      playoffs: null,
      live: null,
      lastResult: null,
      transactions: [],
      achievements: [],
      settings: { sound: false },
      seasonsPlayed: 0,
    };
    TEAMS.forEach((a, i) => {
      const t = {
        id: a[2],
        city: a[0],
        name: a[1],
        conf: a[3],
        division: a[4],
        color: a[5],
        market: a[6],
        w: 0,
        l: 0,
        homeW: 0,
        homeL: 0,
        awayW: 0,
        awayL: 0,
        pf: 0,
        pa: 0,
        streak: 0,
        last10: [],
        cash: 60,
        profit: 22,
        fans: int(s, 58, 80),
        confidence: 70,
        ticket: 65,
        marketing: 1,
        facilities: 1,
        development: 1,
        medical: 1,
        deadCap: 0,
        coach: {
          name: pick(s, FIRST) + " " + pick(s, LAST),
          offense: int(s, 65, 90),
          defense: int(s, 65, 90),
          development: int(s, 65, 90),
          salary: 2.4,
        },
        strategy: {
          pace: "balanced",
          offense: "balanced",
          defense: "man",
          training: "balanced",
        },
        goal: 0,
      };
      s.teams.push(t);
      const base = 66 + (i % 7) * 1.25 + normal(s) * 2;
      for (let j = 0; j < 14; j++) {
        const p = makePlayer(
          s,
          j === 0 ? base + 14 : j < 5 ? base + 7 : j < 9 ? base : base - 8,
          int(s, 20, 34),
          POS[j % 5],
        );
        p.teamId = t.id;
        p.salary = Math.max(
          0.8,
          Math.round(p.salary * (0.85 + rand(s) * 0.25) * 10) / 10,
        );
        s.players.push(p);
      }
      autoRotation(s, t.id);
      t.goal = clamp(Math.round(41 + (strength(s, t.id) - 78) * 2), 28, 55);
    });
    for (let i = 0; i < 65; i++)
      s.players.push(makePlayer(s, int(s, 46, 67), int(s, 20, 35), POS[i % 5]));
    for (let y = 2005; y <= 2007; y++)
      for (let r = 1; r <= 2; r++)
        s.teams.forEach((t) =>
          s.picks.push({
            id: `pick-${y}-${r}-${t.id}`,
            year: y,
            round: r,
            original: t.id,
            owner: t.id,
          }),
        );
    schedule(s);
    newProspects(s);
    news(
      s,
      `${s.manager} takes control of the ${team(s, s.userId).city} ${team(s, s.userId).name}. Ownership expects ${team(s, s.userId).goal} wins.`,
      "office",
    );
    return s;
  }
  function standings(s, conf) {
    return s.teams
      .filter((t) => !conf || t.conf === conf)
      .slice()
      .sort(
        (a, b) =>
          b.w - a.w || b.pf - b.pa - (a.pf - a.pa) || a.id.localeCompare(b.id),
      );
  }
  function activeLineup(s, id, live) {
    let r = roster(s, id).filter((p) => !p.injury && p.minutes > 0);
    if (r.length < 5) r = roster(s, id).filter((p) => !p.injury);
    if (r.length < 5) r = roster(s, id);
    const elapsed = (live.period - 1) * 12 + (720 - live.clock) / 60;
    const sorted = r.slice().sort((a, b) => {
      const am = live.box[a.id]?.min || 0,
        bm = live.box[b.id]?.min || 0;
      return (
        ((b.minutes || 8) / 48) * (elapsed + 2) -
          bm -
          (((a.minutes || 8) / 48) * (elapsed + 2) - am) || b.ovr - a.ovr
      );
    });
    return sorted.slice(0, 5);
  }
  function createLive(s, home, away, gameId = null, playoff = false) {
    const l = {
      home,
      away,
      gameId,
      playoff,
      period: 1,
      clock: 720,
      hs: 0,
      as: 0,
      box: {},
      quarters: [[], []],
      possession: rand(s) > 0.5 ? home : away,
      events: [],
      done: false,
      committed: false,
      started: false,
    };
    [...roster(s, home), ...roster(s, away)].forEach(
      (p) => (l.box[p.id] = { id: p.id, teamId: p.teamId, ...blank() }),
    );
    return l;
  }
  function addEvent(l, text, data = {}) {
    const e = {
      text,
      hs: l.hs,
      as: l.as,
      period: l.period,
      clock: l.clock,
      ...data,
    };
    l.events.push(e);
    return e;
  }
  function stepLive(s, l) {
    if (l.done) return null;
    if (l.clock <= 0) {
      l.quarters[0].push(l.hs - l.quarters[0].reduce((a, b) => a + b, 0));
      l.quarters[1].push(l.as - l.quarters[1].reduce((a, b) => a + b, 0));
      if (l.period >= 4 && l.hs !== l.as) {
        l.done = true;
        return addEvent(
          l,
          "Final buzzer. " +
            team(s, l.hs > l.as ? l.home : l.away).name +
            " win.",
        );
      }
      l.period++;
      l.clock = l.period > 4 ? 300 : 720;
      return addEvent(
        l,
        l.period > 4
          ? "Overtime. Five more minutes to decide it."
          : `Start of quarter ${l.period}.`,
      );
    }
    const atk = l.possession,
      def = atk === l.home ? l.away : l.home,
      at = team(s, atk),
      dt = team(s, def),
      off = activeLineup(s, atk, l),
      de = activeLineup(s, def, l),
      str = at.strategy;
    const seconds = Math.min(
      l.clock,
      Math.max(
        5,
        int(s, 9, 20) +
          (str.pace === "slow" ? 4 : str.pace === "fast" ? -3 : 0),
      ),
    );
    l.clock = Math.max(0, l.clock - seconds);
    off.concat(de).forEach((p) => {
      l.box[p.id].min += seconds / 60;
      l.box[p.id].gp = 1;
    });
    const p = weighted(
      s,
      off,
      (x) => ((x.usage || 20) * (x.skills.inside + x.skills.shooting)) / 150,
    );
    const st = l.box[p.id];
    const defender = weighted(s, de, (x) => x.skills.defense);
    const d = de.reduce((n, x) => n + x.skills.defense, 0) / de.length;
    const fatigue = (100 - p.energy) * 0.0007;
    const chemistry = (p.morale - 75) * 0.0008;
    let text = "",
      points = 0,
      shot = false,
      made = false,
      three = false;
    if (
      rand(s) <
      clamp(
        0.125 -
          (p.skills.playmaking - 65) * 0.001 +
          (dt.strategy.defense === "press" ? 0.035 : 0),
        0.055,
        0.23,
      )
    ) {
      st.tov++;
      if (rand(s) < 0.68) {
        l.box[defender.id].stl++;
        text = `${defender.name} strips ${p.name} and starts the break.`;
      } else text = `${p.name} turns it over under pressure.`;
    } else {
      three =
        rand(s) <
        clamp(
          (p.skills.shooting - 30) * 0.006 +
            (str.offense === "perimeter"
              ? 0.18
              : str.offense === "paint"
                ? -0.15
                : 0) +
            (dt.strategy.defense === "zone" ? 0.08 : 0),
          0.03,
          0.65,
        );
      if (
        rand(s) <
        (three ? 0.035 : 0.12) + (dt.strategy.defense === "press" ? 0.035 : 0)
      ) {
        const attempts = three ? 3 : 2;
        for (let i = 0; i < attempts; i++)
          if (rand(s) < clamp(0.6 + p.skills.shooting * 0.003, 0.65, 0.95)) {
            points++;
            st.ftm++;
          }
        st.fta += attempts;
        st.pts += points;
        text = `${p.name} draws contact. ${points} of ${attempts} at the line.`;
      } else {
        shot = true;
        st.fga++;
        if (three) st.tpa++;
        const skill = three ? p.skills.shooting : p.skills.inside;
        const chance = clamp(
          (three ? 0.3 : 0.47) +
            (skill - 65) * 0.005 -
            (d - 65) * 0.003 +
            (at.coach.offense - dt.coach.defense) * 0.0008 +
            chemistry -
            fatigue +
            (atk === l.home ? 0.012 : 0) +
            (str.offense === "motion" ? 0.008 : 0) +
            (str.pace === "fast" ? -0.01 : 0) +
            (dt.strategy.defense === "zone" ? (three ? 0.02 : -0.025) : 0),
          three ? 0.16 : 0.26,
          three ? 0.52 : 0.72,
        );
        made = rand(s) < chance;
        if (made) {
          points = three ? 3 : 2;
          st.pts += points;
          st.fgm++;
          if (three) st.tpm++;
          if (rand(s) < 0.57 + (str.offense === "motion" ? 0.12 : 0)) {
            const passer = weighted(
              s,
              off.filter((x) => x.id !== p.id),
              (x) => x.skills.playmaking,
            );
            l.box[passer.id].ast++;
          }
          text = `${p.name} ${three ? "buries a three" : "finishes " + pick(s, ["at the rim", "in the lane", "off the glass", "a pull-up jumper"])}.`;
        } else {
          const blocked = !three && rand(s) < 0.11;
          if (blocked) {
            l.box[defender.id].blk++;
            text = `${defender.name} rejects ${p.name} at the rim.`;
          } else
            text = `${p.name} misses ${three ? "from deep" : "a contested shot"}.`;
          const offensive = rand(s) < 0.21;
          const rebounder = weighted(s, offensive ? off : de, (x) =>
            Math.pow(x.skills.rebounding, 2),
          );
          l.box[rebounder.id].reb++;
          if (offensive) {
            text += ` ${rebounder.name} grabs the offensive board.`;
            l.possession = def;
          }
        }
      }
    }
    if (atk === l.home) l.hs += points;
    else l.as += points;
    l.possession = l.possession === l.home ? l.away : l.home;
    l.started = true;
    return addEvent(l, text, {
      teamId: atk,
      playerId: p.id,
      points,
      shot,
      made,
      three,
      x: three ? int(s, 15, 85) : int(s, 32, 68),
      y: three ? int(s, 30, 64) : int(s, 55, 85),
    });
  }
  function finishLive(s, l) {
    while (!l.done) stepLive(s, l);
    return l;
  }
  function processResult(s, l) {
    if (l.committed) return;
    l.committed = true;
    const h = team(s, l.home),
      a = team(s, l.away);
    if (!l.playoff) {
      const hw = l.hs > l.as;
      h[hw ? "w" : "l"]++;
      a[hw ? "l" : "w"]++;
      h[hw ? "homeW" : "homeL"]++;
      a[hw ? "awayL" : "awayW"]++;
      h.pf += l.hs;
      h.pa += l.as;
      a.pf += l.as;
      a.pa += l.hs;
      [h, a].forEach((t) => {
        const win = t.id === (hw ? h.id : a.id);
        t.streak = win ? Math.max(0, t.streak) + 1 : Math.min(0, t.streak) - 1;
        t.last10.push(win ? 1 : 0);
        t.last10 = t.last10.slice(-10);
      });
    }
    Object.values(l.box).forEach((b) => {
      const p = s.players.find((p) => p.id === b.id);
      if (!p || !b.gp) return;
      if (!l.playoff) STATS.forEach((k) => (p.stats[k] += b[k]));
      p.energy = clamp(p.energy - Math.max(0, b.min - 20) * 0.35 + 4, 55, 100);
      p.morale = clamp(
        p.morale +
          (p.teamId === (l.hs > l.as ? l.home : l.away) ? 1 : -1) +
          (p.minutes < 12 && p.ovr > 74 ? -0.5 : 0),
        25,
        100,
      );
      if (!p.injury && rand(s) < 0.0025 * (3 / team(s, p.teamId).medical)) {
        p.injury = int(s, 2, 18);
        p.injuryName = pick(s, [
          "ankle sprain",
          "sore knee",
          "hamstring strain",
          "wrist sprain",
        ]);
        if (p.teamId === s.userId)
          news(
            s,
            `${p.name} will miss ${p.injury} games with a ${p.injuryName}.`,
            "injury",
          );
      }
    });
    const attendance = clamp(
      0.5 +
        h.fans * 0.005 +
        (h.w / Math.max(1, h.w + h.l) - 0.5) * 0.3 -
        (h.ticket - 65) * 0.004,
      0.35,
      1,
    );
    const revenue =
      ((19000 + (h.facilities - 1) * 500) * attendance * h.ticket) / 1e6 +
      0.26 +
      h.market * 0.025;
    h.cash += revenue;
    h.profit += revenue;
    [h, a].forEach((t) => {
      const cost =
        payroll(s, t.id) / 82 +
        (t.coach.salary +
          t.marketing +
          0.3 * t.facilities +
          0.2 * t.development +
          0.2 * t.medical) /
          82;
      t.cash -= cost;
      t.profit -= cost;
      t.fans = clamp(
        t.fans +
          (t.id === (l.hs > l.as ? l.home : l.away) ? 0.15 : -0.13) +
          (t.marketing - 1) * 0.015,
        20,
        100,
      );
    });
    const g = s.schedule.find((g) => g.id === l.gameId);
    if (g) {
      g.played = true;
      g.hs = l.hs;
      g.as = l.as;
    }
    if (l.home === s.userId || l.away === s.userId) {
      s.lastResult = {
        home: l.home,
        away: l.away,
        hs: l.hs,
        as: l.as,
        gameId: l.gameId,
      };
      s.boxes[l.gameId || "po-" + s.day + "-" + l.home] = {
        home: l.home,
        away: l.away,
        hs: l.hs,
        as: l.as,
        box: l.box,
        quarters: l.quarters,
        playoff: l.playoff,
      };
      news(
        s,
        `${(l.hs > l.as ? l.home : l.away) === s.userId ? "W" : "L"} • ${h.city} ${l.hs}, ${a.city} ${l.as}.`,
        "result",
      );
    }
  }
  function beforeDay(s) {
    s.players.forEach((p) => {
      if (p.injury > 0) p.injury--;
      p.energy = clamp(
        p.energy + (team(s, p.teamId)?.strategy.training === "rest" ? 12 : 5),
        0,
        100,
      );
    });
  }
  function simulateDay(s, already = null) {
    if (s.live && !already) return { error: "Finish your active game first." };
    if (s.phase !== "regular") return { error: "The regular season is over." };
    if (!already?.recoveryApplied) beforeDay(s);
    const games = s.schedule.filter((g) => g.day === s.day);
    games.forEach((g) => {
      if (!g.played) {
        const l =
          already && already.gameId === g.id
            ? already
            : finishLive(s, createLive(s, g.home, g.away, g.id));
        processResult(s, l);
      }
    });
    s.day++;
    s.scoutPoints += 3 + team(s, s.userId).development;
    if (s.day % 7 === 0) {
      training(s);
      aiTransactions(s);
    }
    if (s.day === 60)
      news(
        s,
        "The trade deadline has passed. Rosters are locked for the stretch run.",
        "league",
      );
    if (s.day >= 82) startPlayoffs(s);
    return { ok: true };
  }
  function training(s) {
    s.teams.forEach((t) => {
      const plan = t.strategy.training;
      roster(s, t.id).forEach((p) => {
        if (plan === "rest") {
          p.energy = 100;
          return;
        }
        if (p.age < 28 && rand(s) < 0.2 * t.development) {
          const k =
            plan === "shooting"
              ? "shooting"
              : plan === "defense"
                ? "defense"
                : pick(s, Object.keys(p.skills));
          p.skills[k] = clamp(
            p.skills[k] + 1,
            25,
            Math.min(99, p.potential + 8),
          );
          p.ovr = overall(p);
        }
      });
    });
  }
  function aiTransactions(s) {
    if (s.day >= 60) return;
    aiTrade(s);
    for (const t of s.teams) {
      if (t.id === s.userId) continue;
      const r = roster(s, t.id);
      if (r.length < 14) {
        const fa = s.players
          .filter(
            (p) =>
              p.teamId === null &&
              !p.retired &&
              p.salary <= s.cap - payroll(s, t.id),
          )
          .sort((a, b) => b.ovr - a.ovr)[0];
        if (fa) {
          fa.teamId = t.id;
          fa.years = 1;
          autoRotation(s, t.id);
        }
      }
    }
  }
  function aiTrade(s) {
    if (s.day < 21 || rand(s) > 0.65) return;
    const buyers = s.teams.filter(
        (t) => t.id !== s.userId && t.w / Math.max(1, t.w + t.l) > 0.54,
      ),
      sellers = s.teams.filter(
        (t) => t.id !== s.userId && t.w / Math.max(1, t.w + t.l) < 0.44,
      );
    if (!buyers.length || !sellers.length) return;
    for (let i = 0; i < 12; i++) {
      const buyer = pick(s, buyers),
        seller = pick(s, sellers),
        vets = roster(s, seller.id).filter(
          (p) => p.age >= 28 && p.ovr >= 76 && !p.injury,
        ),
        kids = roster(s, buyer.id).filter((p) => p.age <= 25);
      if (!vets.length || !kids.length) continue;
      const vet = pick(s, vets),
        kid = kids.find(
          (p) =>
            p.ovr < vet.ovr &&
            p.ovr >= vet.ovr - 13 &&
            p.potential >= vet.ovr + 2,
        ),
        asset = s.picks.find(
          (p) => p.owner === buyer.id && p.round === 1 && p.year === s.year + 1,
        );
      if (!kid || !asset) continue;
      if (
        vet.salary >
          Math.max(
            s.cap - payroll(s, buyer.id) + kid.salary,
            kid.salary * 1.25 + 0.5,
          ) ||
        kid.salary >
          Math.max(
            s.cap - payroll(s, seller.id) + vet.salary,
            vet.salary * 1.25 + 0.5,
          )
      )
        continue;
      vet.teamId = buyer.id;
      kid.teamId = seller.id;
      asset.owner = seller.id;
      autoRotation(s, buyer.id);
      autoRotation(s, seller.id);
      transaction(
        s,
        `${buyer.city} acquires ${vet.name} from ${seller.city} for ${kid.name} and a ${asset.year} first-round pick.`,
      );
      return;
    }
  }
  function startPlayoffs(s) {
    s.phase = "playoffs";
    s.playoffs = {
      round: 1,
      series: [],
      completed: [],
      champion: null,
      seeds: {},
    };
    ["East", "West"].forEach((conf) => {
      const a = standings(s, conf).slice(0, 8);
      a.forEach((t, i) => (s.playoffs.seeds[t.id] = i + 1));
      [
        [0, 7],
        [3, 4],
        [1, 6],
        [2, 5],
      ].forEach(([x, y], i) =>
        s.playoffs.series.push({
          id: conf + "-1-" + i,
          conf,
          a: a[x].id,
          b: a[y].id,
          aw: 0,
          bw: 0,
          games: [],
          winner: null,
        }),
      );
    });
    news(
      s,
      "The postseason is here. Sixteen teams. One championship.",
      "league",
    );
  }
  function nextPlayoff(s) {
    if (s.live) return { error: "Finish your active game first." };
    const po = s.playoffs;
    if (s.phase !== "playoffs") return;
    beforeDay(s);
    po.series
      .filter((x) => !x.winner)
      .forEach((x) => {
        const n = x.aw + x.bw;
        const home = [0, 1, 4, 6].includes(n) ? x.a : x.b,
          away = home === x.a ? x.b : x.a;
        const id = `po-${po.round}-${x.id}-${n}`;
        const l = finishLive(s, createLive(s, home, away, id, true));
        processResult(s, l);
        recordSeries(x, l);
      });
    s.day++;
    advanceBracket(s);
  }
  function recordSeries(x, l) {
    if (l.hs > l.as) {
      if (l.home === x.a) x.aw++;
      else x.bw++;
    } else {
      if (l.away === x.a) x.aw++;
      else x.bw++;
    }
    x.games.push({ home: l.home, away: l.away, hs: l.hs, as: l.as });
    if (x.aw === 4 || x.bw === 4) x.winner = x.aw === 4 ? x.a : x.b;
  }
  function advanceBracket(s) {
    const po = s.playoffs;
    if (po.series.some((x) => !x.winner)) return;
    po.completed.push(...po.series);
    if (po.round === 4) {
      po.champion = po.series[0].winner;
      finishSeason(s);
      return;
    }
    const next = [];
    if (po.round === 3) {
      const east = po.series.find((x) => x.conf === "East").winner,
        west = po.series.find((x) => x.conf === "West").winner;
      const order =
        team(s, east).w >= team(s, west).w ? [east, west] : [west, east];
      next.push({
        id: "Finals",
        conf: "Finals",
        a: order[0],
        b: order[1],
        aw: 0,
        bw: 0,
        games: [],
        winner: null,
      });
    } else {
      ["East", "West"].forEach((conf) => {
        const a = po.series.filter((x) => x.conf === conf);
        for (let i = 0; i < a.length; i += 2) {
          const ids = [a[i].winner, a[i + 1].winner].sort(
            (a, b) => po.seeds[a] - po.seeds[b],
          );
          next.push({
            id: conf + "-" + (po.round + 1) + "-" + i,
            conf,
            a: ids[0],
            b: ids[1],
            aw: 0,
            bw: 0,
            games: [],
            winner: null,
          });
        }
      });
    }
    po.round++;
    po.series = next;
    news(
      s,
      po.round === 4
        ? "The Finals matchup is set."
        : `The ${["", "", "conference semifinals", "conference finals"][po.round]} begin.`,
      "league",
    );
  }
  function userNextGame(s) {
    if (s.phase === "regular")
      return s.schedule.find(
        (g) => g.day === s.day && (g.home === s.userId || g.away === s.userId),
      );
    if (s.phase === "playoffs") {
      const x = s.playoffs.series.find(
        (x) => !x.winner && (x.a === s.userId || x.b === s.userId),
      );
      if (!x) return null;
      const n = x.aw + x.bw,
        home = [0, 1, 4, 6].includes(n) ? x.a : x.b;
      return {
        home,
        away: home === x.a ? x.b : x.a,
        id: `po-${s.playoffs.round}-${x.id}-${n}`,
        seriesId: x.id,
        playoff: true,
      };
    }
    return null;
  }
  function startUserGame(s) {
    if (s.live) return { error: "A game is already in progress." };
    const g = userNextGame(s);
    if (!g) return { error: "Your team has no game on this date." };
    beforeDay(s);
    s.live = createLive(s, g.home, g.away, g.id, !!g.playoff);
    s.live.recoveryApplied = true;
    s.live.seriesId = g.seriesId;
    return { ok: true };
  }
  function commitUserGame(s) {
    const l = s.live;
    if (!l || !l.done) return { error: "Finish the game first." };
    if (s.phase === "regular") {
      simulateDay(s, l);
    } else {
      if (!l.recoveryApplied) beforeDay(s);
      s.playoffs.series
        .filter((x) => !x.winner)
        .forEach((x) => {
          let result = l;
          if (x.id !== l.seriesId) {
            const n = x.aw + x.bw,
              home = [0, 1, 4, 6].includes(n) ? x.a : x.b;
            result = finishLive(
              s,
              createLive(
                s,
                home,
                home === x.a ? x.b : x.a,
                `po-${s.playoffs.round}-${x.id}-${n}`,
                true,
              ),
            );
          }
          processResult(s, result);
          recordSeries(x, result);
        });
      s.day++;
      advanceBracket(s);
    }
    s.live = null;
    return { ok: true };
  }
  function playerScore(p) {
    return p.stats.gp
      ? (p.stats.pts +
          p.stats.reb * 1.2 +
          p.stats.ast * 1.5 +
          p.stats.stl * 2 +
          p.stats.blk * 2 -
          p.stats.tov * 0.8) /
          p.stats.gp
      : 0;
  }
  function finishSeason(s) {
    const qualified = s.players
      .filter((p) => p.stats.gp >= 35)
      .sort((a, b) => playerScore(b) - playerScore(a));
    const mvp = qualified[0];
    const dpoy = qualified
      .slice()
      .sort(
        (a, b) =>
          (b.stats.stl + b.stats.blk) * 1.8 +
          b.stats.reb * 0.2 -
          ((a.stats.stl + a.stats.blk) * 1.8 + a.stats.reb * 0.2),
      )[0];
    const rook = s.players
      .filter((p) => p.draftYear === s.year - 1 && p.stats.gp > 10)
      .sort((a, b) => playerScore(b) - playerScore(a))[0];
    const champ = team(s, s.playoffs.champion),
      u = team(s, s.userId);
    const summary = {
      year: s.year,
      champion: champ.id,
      runnerUp:
        s.playoffs.series[0].a === champ.id
          ? s.playoffs.series[0].b
          : s.playoffs.series[0].a,
      mvp: mvp
        ? {
            name: mvp.name,
            id: mvp.id,
            teamId: mvp.teamId,
            pts: mvp.stats.pts / mvp.stats.gp,
          }
        : null,
      dpoy: dpoy?.name,
      rookie: rook?.name || "No qualifying rookie",
      allLeague: qualified
        .slice(0, 5)
        .map((p) => ({ name: p.name, pos: p.pos, teamId: p.teamId })),
      userRecord: [u.w, u.l],
      userTeam: s.userId,
      profit: u.profit,
      leaders: qualified
        .slice(0, 10)
        .map((p) => ({
          name: p.name,
          teamId: p.teamId,
          pts: p.stats.pts / p.stats.gp,
          reb: p.stats.reb / p.stats.gp,
          ast: p.stats.ast / p.stats.gp,
        })),
      standings: standings(s).map((t) => ({ id: t.id, w: t.w, l: t.l })),
    };
    s.history.unshift(summary);
    s.seasonsPlayed++;
    s.phase = "resign";
    s.scoutPoints += 80;
    const success = u.w >= u.goal;
    u.confidence = clamp(
      u.confidence +
        (success ? 12 : -12) +
        (champ.id === u.id ? 20 : 0) +
        (u.profit > 0 ? 5 : -5),
      0,
      100,
    );
    if (champ.id === u.id && !s.achievements.includes("Champion"))
      s.achievements.push("Champion");
    if (u.w >= 60 && !s.achievements.includes("60-win club"))
      s.achievements.push("60-win club");
    if (
      s.history.filter((h) => h.champion === u.id).length >= 3 &&
      !s.achievements.includes("Dynasty")
    )
      s.achievements.push("Dynasty");
    news(
      s,
      `${champ.city} ${champ.name} are the ${s.year} champions. ${mvp?.name || "The league MVP"} takes home Most Valuable Player.`,
      "award",
    );
    s.players.forEach((p) => {
      if (p.retired) return;
      if (p.stats.gp) {
        p.history.unshift({
          year: s.year,
          teamId: p.teamId,
          gp: p.stats.gp,
          pts: p.stats.pts / p.stats.gp,
          reb: p.stats.reb / p.stats.gp,
          ast: p.stats.ast / p.stats.gp,
        });
        p.history = p.history.slice(0, 20);
        STATS.forEach((k) => (p.career[k] += p.stats[k]));
      }
      p.age++;
      if (p.age >= 40 || (p.age > 34 && rand(s) < (p.age - 33) * 0.1)) {
        p.retired = true;
        if (p.teamId === s.userId)
          news(
            s,
            `${p.name} announces his retirement at age ${p.age}.`,
            "office",
          );
        p.teamId = null;
        return;
      }
      const t = team(s, p.teamId);
      const change =
        p.age < 26
          ? clamp(
              Math.round(
                (p.potential - p.ovr) * 0.12 +
                  normal(s) * 1.4 +
                  (t ? t.coach.development / 100 + t.development * 0.2 : 0),
              ),
              -2,
              6,
            )
          : p.age > 30
            ? -int(s, 1, p.age > 34 ? 5 : 3)
            : int(s, -1, 1);
      Object.keys(p.skills).forEach(
        (k) =>
          (p.skills[k] = clamp(p.skills[k] + change + int(s, -1, 1), 25, 99)),
      );
      p.ovr = overall(p);
      p.potential = Math.max(p.ovr, p.potential - (p.age > 29 ? 1 : 0));
      p.energy = 100;
      p.injury = 0;
      if (p.teamId) {
        p.years--;
        if (p.years <= 0) {
          if (p.teamId !== s.userId && p.ovr >= 72 && rand(s) < 0.6) {
            p.salary = demand(p);
            p.years = int(s, 2, 4);
          } else {
            p.prevTeamId = p.teamId;
            p.teamId = null;
            p.salary = demand(p);
            p.minutes = 0;
          }
        }
      }
    });
    s.teams.forEach((t) => (t.deadCap = 0));
  }
  function resign(s, id, years, salary) {
    if (s.phase !== "resign")
      return { error: "Re-signing takes place after the Finals." };
    const p = s.players.find((p) => p.id === id);
    if (!p || p.retired || p.teamId || p.prevTeamId !== s.userId)
      return { error: "This player is not eligible for an extension." };
    return sign(s, id, years, salary, true);
  }
  function sign(s, id, years, salary, bird = false) {
    if (s.live)
      return { error: "Finish your active game before changing the roster." };
    const p = s.players.find((p) => p.id === id);
    if (!p || p.retired || p.teamId)
      return { error: "This player is unavailable." };
    if (!["regular", "freeAgency", "resign"].includes(s.phase))
      return { error: "Contracts cannot be signed in this phase." };
    if (s.phase === "regular" && s.day >= 60)
      return { error: "The roster deadline has passed." };
    years = Number(years);
    salary = Number(salary);
    if (
      !Number.isInteger(years) ||
      years < 1 ||
      years > 4 ||
      !Number.isFinite(salary) ||
      salary < 0.8
    )
      return { error: "Offer 1–4 years and at least $0.8M per season." };
    const r = roster(s, s.userId);
    if (r.length >= (s.phase === "regular" ? 15 : 20))
      return { error: "Your roster is full. Release a player first." };
    const ask = demand(p);
    if (salary < ask * (s.difficulty === "hard" ? 0.98 : 0.9))
      return {
        error: `${p.name} wants at least $${(ask * (s.difficulty === "hard" ? 0.98 : 0.9)).toFixed(1)}M per year.`,
      };
    if (!bird && salary > s.cap - payroll(s, s.userId) + 0.001 && salary > 0.8)
      return {
        error:
          "Not enough cap room. Only a minimum $0.8M contract can exceed the cap.",
      };
    p.teamId = s.userId;
    p.years = years;
    p.salary = Math.round(salary * 10) / 10;
    p.morale = 80;
    p.minutes = 0;
    p.prevTeamId = null;
    autoRotation(s, s.userId);
    transaction(
      s,
      `${p.name} signs a ${years}-year, $${(salary * years).toFixed(1)}M contract with ${team(s, s.userId).city}.`,
    );
    return { ok: true };
  }
  function release(s, id) {
    if (s.live)
      return { error: "Finish your active game before changing the roster." };
    const p = s.players.find((p) => p.id === id);
    if (!p || p.teamId !== s.userId)
      return { error: "Player is not on your roster." };
    if (roster(s, s.userId).length <= 8)
      return { error: "You must keep at least eight players." };
    if (s.phase === "playoffs" || (s.phase === "regular" && s.day >= 60))
      return { error: "Rosters are locked." };
    const t = team(s, s.userId),
      buyout = p.salary * p.years * 0.5;
    t.cash -= buyout;
    t.profit -= buyout;
    t.deadCap += p.salary * 0.4;
    p.teamId = null;
    p.prevTeamId = null;
    p.years = 0;
    p.salary = demand(p);
    p.minutes = 0;
    autoRotation(s, s.userId);
    transaction(s, `${p.name} is waived. Buyout: $${buyout.toFixed(1)}M.`);
    return { ok: true };
  }
  function transaction(s, text) {
    s.transactions.unshift({ year: s.year, day: s.day, text });
    s.transactions = s.transactions.slice(0, 150);
    news(s, text, "transaction");
  }
  function pickValue(s, p) {
    const t = team(s, p.original),
      pct = t.w / Math.max(1, t.w + t.l);
    return (
      (p.round === 1 ? 190 + (0.5 - pct) * 220 : 45) *
      (p.year === s.year ? 1 : 0.82)
    );
  }
  function tradeValue(p) {
    return (
      Math.pow(Math.max(2, p.ovr - 46), 1.65) +
      (p.potential - p.ovr) * (p.age < 27 ? 6 : 1) +
      Math.max(-90, (28 - p.age) * 7) -
      p.salary * 3
    );
  }
  function evaluateTrade(
    s,
    otherId,
    sendIds,
    getIds,
    sendPicks = [],
    getPicks = [],
  ) {
    if (s.live)
      return { ok: false, error: "Finish your active game before trading." };
    if (s.phase !== "regular" && s.phase !== "freeAgency")
      return {
        ok: false,
        error: "Trades open during the regular season and free agency.",
      };
    if (s.phase === "regular" && s.day >= 60)
      return { ok: false, error: "The trade deadline has passed." };
    if (otherId === s.userId || !team(s, otherId))
      return { ok: false, error: "Choose another team." };
    if (
      new Set([...sendIds, ...getIds, ...sendPicks, ...getPicks]).size !==
      sendIds.length + getIds.length + sendPicks.length + getPicks.length
    )
      return { ok: false, error: "Each asset can be included once." };
    const send = s.players.filter(
        (p) => sendIds.includes(p.id) && p.teamId === s.userId,
      ),
      get = s.players.filter(
        (p) => getIds.includes(p.id) && p.teamId === otherId,
      ),
      sp = s.picks.filter(
        (p) => sendPicks.includes(p.id) && p.owner === s.userId,
      ),
      gp = s.picks.filter(
        (p) => getPicks.includes(p.id) && p.owner === otherId,
      );
    if (
      send.length !== sendIds.length ||
      get.length !== getIds.length ||
      sp.length !== sendPicks.length ||
      gp.length !== getPicks.length
    )
      return {
        ok: false,
        error: "One or more assets are no longer available.",
      };
    if (!send.length && !get.length && !sp.length && !gp.length)
      return { ok: false, error: "Add players or picks to make an offer." };
    const max = s.phase === "regular" ? 15 : 20;
    const ur = roster(s, s.userId).length - send.length + get.length,
      ar = roster(s, otherId).length - get.length + send.length;
    if (ur < 8 || ar < 8 || ur > max || ar > max)
      return {
        ok: false,
        error: `Both teams need 8–${max} players after the trade.`,
      };
    const out = send.reduce((n, p) => n + p.salary, 0),
      inc = get.reduce((n, p) => n + p.salary, 0);
    if (
      inc >
      Math.max(s.cap - payroll(s, s.userId) + out, out * 1.25 + 0.5) + 0.01
    )
      return {
        ok: false,
        error: "Your incoming salary exceeds cap matching rules.",
      };
    if (
      out >
      Math.max(s.cap - payroll(s, otherId) + inc, inc * 1.25 + 0.5) + 0.01
    )
      return {
        ok: false,
        error: "The other team cannot match the incoming salary.",
      };
    const offered =
        send.reduce((n, p) => n + tradeValue(p), 0) +
        sp.reduce((n, p) => n + pickValue(s, p), 0),
      requested =
        get.reduce((n, p) => n + tradeValue(p), 0) +
        gp.reduce((n, p) => n + pickValue(s, p), 0);
    const ratio = offered / Math.max(1, requested),
      threshold =
        s.difficulty === "easy" ? 0.9 : s.difficulty === "hard" ? 1.15 : 1.04;
    return {
      ok: ratio >= threshold,
      legal: true,
      ratio,
      offered,
      requested,
      error:
        ratio >= threshold
          ? null
          : "Offer more value. Their front office wants a stronger return.",
    };
  }
  function trade(s, otherId, send, get, sp = [], gp = []) {
    const e = evaluateTrade(s, otherId, send, get, sp, gp);
    if (!e.ok) return e;
    s.players.forEach((p) => {
      if (send.includes(p.id)) p.teamId = otherId;
      if (get.includes(p.id)) p.teamId = s.userId;
    });
    s.picks.forEach((p) => {
      if (sp.includes(p.id)) p.owner = otherId;
      if (gp.includes(p.id)) p.owner = s.userId;
    });
    autoRotation(s, s.userId);
    autoRotation(s, otherId);
    transaction(
      s,
      `${team(s, s.userId).city} and ${team(s, otherId).city} complete a trade: ${send.length} player(s) and ${sp.length} pick(s) for ${get.length} player(s) and ${gp.length} pick(s).`,
    );
    if (!s.achievements.includes("Deal maker"))
      s.achievements.push("Deal maker");
    return { ok: true };
  }
  function scout(s, id) {
    const p = s.prospects.find((p) => p.id === id);
    if (!p) return { error: "Prospect unavailable." };
    if (p.scouted >= 3) return { error: "Scouting report is complete." };
    if (s.scoutPoints < 15) return { error: "You need 15 scouting points." };
    s.scoutPoints -= 15;
    p.scouted++;
    if (p.scouted === 3) {
      p.estimate = p.ovr;
      p.potEstimate = p.potential;
    } else {
      p.estimate = Math.round((p.estimate + p.ovr) / 2);
      p.potEstimate = Math.round((p.potEstimate + p.potential) / 2);
    }
    return { ok: true };
  }
  function startDraft(s) {
    if (s.phase !== "resign")
      return { error: "Finish the season before entering the draft." };
    const ordered = standings(s).slice().reverse();
    const lottery = ordered.filter((t) => s.playoffs.seeds[t.id] === undefined),
      rest = ordered.filter((t) => s.playoffs.seeds[t.id] !== undefined);
    const pool = lottery.slice(),
      winners = [];
    for (let i = 0; i < 4 && pool.length; i++) {
      const win = weighted(s, pool, (t) =>
        Math.pow(15 - lottery.indexOf(t), 1.8),
      );
      winners.push(win);
      pool.splice(pool.indexOf(win), 1);
    }
    const order = [...winners, ...pool, ...rest];
    const picks = [];
    for (let round = 1; round <= 2; round++)
      order.forEach((t, i) => {
        const p = s.picks.find(
          (p) => p.year === s.year && p.round === round && p.original === t.id,
        );
        if (p) picks.push({ ...p, number: (round - 1) * 30 + i + 1 });
      });
    s.draft = {
      order: picks,
      index: 0,
      results: [],
      lottery: winners.map((t) => t.id),
    };
    s.phase = "draft";
    news(
      s,
      `${team(s, order[0].id).city} wins the draft lottery. The ${s.year} draft is underway.`,
      "draft",
    );
    return { ok: true };
  }
  function draftPlayer(s, id) {
    if (s.phase !== "draft") return { error: "The draft is not open." };
    const pick = s.draft.order[s.draft.index];
    if (!pick) return { error: "The draft is complete." };
    const p = s.prospects.find((p) => p.id === id);
    if (!p) return { error: "This prospect is no longer available." };
    p.teamId = pick.owner;
    p.prospect = false;
    p.salary =
      Math.round((pick.number <= 30 ? 4.5 - pick.number * 0.1 : 0.9) * 10) / 10;
    p.years = pick.round === 1 ? 3 : 2;
    p.draftYear = s.year;
    p.draftPick = pick.number;
    p.minutes = 0;
    s.players.push(p);
    s.prospects = s.prospects.filter((x) => x.id !== id);
    s.draft.results.push({
      pick: pick.number,
      teamId: pick.owner,
      name: p.name,
      id: p.id,
      pos: p.pos,
      ovr: p.ovr,
    });
    s.draft.index++;
    if (p.teamId === s.userId) {
      transaction(
        s,
        `${team(s, p.teamId).city} selects ${p.name} (${p.pos}) with pick ${pick.number}.`,
      );
      if (p.ovr >= 74 && !s.achievements.includes("Draft gem"))
        s.achievements.push("Draft gem");
    }
    if (s.draft.index >= s.draft.order.length) finishDraft(s);
    return { ok: true };
  }
  function autoDraftPick(s) {
    const cp = s.draft.order[s.draft.index];
    if (!cp) return;
    const r = roster(s, cp.owner);
    const p = s.prospects.slice().sort((a, b) => {
      const val = (x) =>
        x.ovr * 0.65 +
        x.potential * 0.35 +
        (r.filter((p) => p.pos === x.pos).length < 2 ? 3 : 0);
      return val(b) - val(a);
    })[0];
    draftPlayer(s, p.id);
  }
  function simToPick(s) {
    let guard = 0;
    while (
      s.phase === "draft" &&
      s.draft.order[s.draft.index]?.owner !== s.userId &&
      guard++ < 60
    )
      autoDraftPick(s);
  }
  function finishDraft(s) {
    s.phase = "freeAgency";
    s.prospects.forEach((p) => {
      p.prospect = false;
      p.salary = 0.8;
      p.years = 0;
      p.teamId = null;
      s.players.push(p);
    });
    s.prospects = [];
    s.players
      .filter((p) => !p.teamId && !p.retired)
      .forEach((p) => (p.salary = demand(p)));
    aiFreeAgency(s);
    news(
      s,
      "Free agency is open. Fill out your roster, set the rotation, and start a new season.",
      "league",
    );
  }
  function aiFreeAgency(s) {
    s.teams
      .filter((t) => t.id !== s.userId)
      .forEach((t) => {
        let r = roster(s, t.id);
        while (r.length > 15) {
          const p = r.slice().sort((a, b) => a.ovr - b.ovr)[0];
          p.teamId = null;
          p.years = 0;
          p.salary = demand(p);
          r = roster(s, t.id);
        }
        while (r.length < 14) {
          let room = s.cap - payroll(s, t.id);
          let fa = s.players
            .filter(
              (p) => !p.teamId && !p.retired && p.salary <= Math.max(0.8, room),
            )
            .sort((a, b) => b.ovr - a.ovr)[0];
          if (!fa) break;
          fa.teamId = t.id;
          fa.years = int(s, 1, 3);
          fa.morale = 75;
          r.push(fa);
        }
        autoRotation(s, t.id);
      });
  }
  function newSeason(s) {
    if (s.phase !== "freeAgency")
      return { error: "Complete the draft and free agency first." };
    const r = roster(s, s.userId);
    if (r.length < 8 || r.length > 15)
      return {
        error:
          "Start the season with 8–15 players. Sign or release players in the Market.",
      };
    s.year++;
    s.day = 0;
    s.phase = "regular";
    s.cap = Math.round(s.cap * 1.05 * 10) / 10;
    s.boxes = {};
    s.lastResult = null;
    s.playoffs = null;
    s.live = null;
    s.scoutPoints = 100 + team(s, s.userId).development * 15;
    s.players = s.players.filter((p) => !p.retired || p.career.gp > 400);
    s.players.forEach((p) => {
      p.stats = blank();
      p.energy = 100;
      p.injury = 0;
    });
    s.teams.forEach((t) => {
      t.w = 0;
      t.l = 0;
      t.homeW = 0;
      t.homeL = 0;
      t.awayW = 0;
      t.awayL = 0;
      t.pf = 0;
      t.pa = 0;
      t.streak = 0;
      t.last10 = [];
      t.profit = 22;
      t.cash += 22;
      t.goal = clamp(Math.round(41 + (strength(s, t.id) - 78) * 2), 28, 58);
      if (roster(s, t.id).length < 8) {
        while (roster(s, t.id).length < 8) {
          const p = makePlayer(
            s,
            55,
            int(s, 20, 28),
            POS[roster(s, t.id).length % 5],
          );
          p.teamId = t.id;
          p.salary = 0.8;
          p.years = 1;
          s.players.push(p);
        }
      }
      autoRotation(s, t.id);
    });
    s.picks = s.picks.filter((p) => p.year >= s.year);
    for (let round = 1; round <= 2; round++)
      s.teams.forEach((t) => {
        const y = s.year + 2;
        if (
          !s.picks.some(
            (p) => p.year === y && p.round === round && p.original === t.id,
          )
        )
          s.picks.push({
            id: `pick-${y}-${round}-${t.id}`,
            year: y,
            round,
            original: t.id,
            owner: t.id,
          });
      });
    schedule(s);
    newProspects(s);
    news(
      s,
      `Welcome to ${s.year}. Ownership expects ${team(s, s.userId).goal} wins. Salary cap: $${s.cap.toFixed(1)}M.`,
      "office",
    );
    return { ok: true };
  }
  function upgrade(s, key) {
    if (!["facilities", "development", "medical"].includes(key))
      return { error: "Unknown facility." };
    const t = team(s, s.userId);
    if (t[key] >= 5) return { error: "Already at maximum level." };
    const cost = t[key] * 5;
    if (t.cash < cost) return { error: "Not enough cash for this investment." };
    t.cash -= cost;
    t.profit -= cost;
    t[key]++;
    news(
      s,
      `${key === "development" ? "Development center" : key === "medical" ? "Medical staff" : "Arena"} upgraded to level ${t[key]}.`,
      "office",
    );
    return { ok: true };
  }
  function hireCoach(s, type) {
    const t = team(s, s.userId),
      cost = 4;
    if (t.cash < cost)
      return { error: "You need $4M cash to replace your coach." };
    const profiles = {
      offense: [94, 76, 77],
      defense: [77, 94, 77],
      development: [78, 77, 96],
    };
    if (!profiles[type]) return { error: "Choose a coaching specialty." };
    t.cash -= cost;
    t.profit -= cost;
    const a = profiles[type];
    t.coach = {
      name: pick(s, FIRST) + " " + pick(s, LAST),
      offense: a[0],
      defense: a[1],
      development: a[2],
      salary: 3.5,
    };
    news(s, `${t.coach.name} is hired as head coach.`, "office");
    return { ok: true };
  }
  function setMinutes(s, id, n) {
    const p = s.players.find((p) => p.id === id);
    n = Number(n);
    if (!p || p.teamId !== s.userId || !Number.isFinite(n))
      return { error: "Invalid rotation change." };
    p.minutes = clamp(Math.round(n), 0, 48);
    return { ok: true };
  }
  function normalizeRotation(s) {
    const r = roster(s, s.userId),
      active = r.filter((p) => p.minutes > 0);
    if (active.length < 5)
      return { error: "Give minutes to at least five players." };
    let total = active.reduce((n, p) => n + p.minutes, 0);
    active.forEach(
      (p) => (p.minutes = Math.min(48, Math.round((p.minutes / total) * 240))),
    );
    let diff = 240 - active.reduce((n, p) => n + p.minutes, 0),
      guard = 0;
    while (diff && guard++ < 1000) {
      for (const p of active) {
        if (diff > 0 && p.minutes < 48) {
          p.minutes++;
          diff--;
        } else if (diff < 0 && p.minutes > 0) {
          p.minutes--;
          diff++;
        }
        if (!diff) break;
      }
    }
    return { ok: true };
  }
  function validateSave(s) {
    try {
      const ids = new Set(TEAMS.map((t) => t[2])),
        isTeam = (id) => ids.has(id),
        num = Number.isFinite,
        text = (x) => typeof x === "string" && x.length < 500,
        stats = (x) => x && STATS.every((k) => num(x[k]) && x[k] >= 0);
      if (
        !s ||
        s.version !== VERSION ||
        !Array.isArray(s.teams) ||
        s.teams.length !== 30 ||
        !Array.isArray(s.players) ||
        !isTeam(s.userId) ||
        !text(s.manager) ||
        !["regular", "playoffs", "resign", "draft", "freeAgency"].includes(
          s.phase,
        ) ||
        !num(s.rng) ||
        !num(s.year) ||
        !num(s.day) ||
        !num(s.cap) ||
        !Array.isArray(s.schedule) ||
        s.schedule.length !== 1230 ||
        !Array.isArray(s.picks) ||
        !Array.isArray(s.history) ||
        !Array.isArray(s.prospects) ||
        !Array.isArray(s.news) ||
        !Array.isArray(s.transactions) ||
        !Array.isArray(s.achievements) ||
        !s.boxes ||
        !num(s.scoutPoints) ||
        !num(s.nextId) ||
        !num(s.seasonsPlayed)
      )
        return false;
      if (
        new Set(s.teams.map((t) => t.id)).size !== 30 ||
        new Set(s.players.map((p) => p.id)).size !== s.players.length
      )
        return false;
      const player = (p) =>
        p &&
        /^p\d+$/.test(p.id) &&
        text(p.name) &&
        text(p.archetype) &&
        text(p.college) &&
        POS.includes(p.pos) &&
        num(p.ovr) &&
        p.ovr >= 25 &&
        p.ovr <= 99 &&
        num(p.potential) &&
        p.skills &&
        [
          "inside",
          "shooting",
          "playmaking",
          "defense",
          "rebounding",
          "athleticism",
        ].every(
          (k) => num(p.skills[k]) && p.skills[k] >= 0 && p.skills[k] <= 99,
        ) &&
        stats(p.stats) &&
        stats(p.career) &&
        num(p.salary) &&
        num(p.age) &&
        num(p.minutes) &&
        num(p.energy) &&
        num(p.morale) &&
        num(p.injury) &&
        num(p.usage) &&
        Array.isArray(p.history) &&
        (p.teamId === null || isTeam(p.teamId));
      if (!s.players.every(player) || !s.prospects.every(player)) return false;
      if (
        !s.teams.every(
          (t) =>
            isTeam(t.id) &&
            text(t.city) &&
            text(t.name) &&
            /^#[0-9a-f]{6}$/i.test(t.color) &&
            ["East", "West"].includes(t.conf) &&
            t.strategy &&
            ["slow", "balanced", "fast"].includes(t.strategy.pace) &&
            ["balanced", "motion", "perimeter", "paint"].includes(
              t.strategy.offense,
            ) &&
            ["man", "zone", "press"].includes(t.strategy.defense) &&
            ["balanced", "shooting", "defense", "rest"].includes(
              t.strategy.training,
            ) &&
            t.coach &&
            ["offense", "defense", "development", "salary"].every((k) =>
              num(t.coach[k]),
            ) &&
            text(t.coach.name) &&
            [
              "cash",
              "profit",
              "w",
              "l",
              "ticket",
              "marketing",
              "fans",
              "confidence",
              "facilities",
              "development",
              "medical",
            ].every((k) => num(t[k])) &&
            Array.isArray(t.last10),
        )
      )
        return false;
      if (
        !s.schedule.every(
          (g) =>
            text(g.id) &&
            isTeam(g.home) &&
            isTeam(g.away) &&
            num(g.day) &&
            num(g.hs) &&
            num(g.as),
        ) ||
        !s.picks.every(
          (p) =>
            text(p.id) &&
            num(p.year) &&
            [1, 2].includes(p.round) &&
            isTeam(p.owner) &&
            isTeam(p.original),
        ) ||
        !s.news.every((n) => text(n.text)) ||
        !s.transactions.every((n) => text(n.text))
      )
        return false;
      const series = (x) =>
        isTeam(x.a) &&
        isTeam(x.b) &&
        num(x.aw) &&
        num(x.bw) &&
        Array.isArray(x.games);
      if (
        s.phase === "playoffs" &&
        (!s.playoffs || ![1, 2, 3, 4].includes(s.playoffs.round))
      )
        return false;
      if (
        s.playoffs &&
        (!Array.isArray(s.playoffs.series) ||
          !Array.isArray(s.playoffs.completed) ||
          !s.playoffs.series.every(series) ||
          !s.playoffs.completed.every(series) ||
          !s.playoffs.seeds)
      )
        return false;
      if (
        s.phase === "draft" &&
        (!s.draft ||
          !Array.isArray(s.draft.order) ||
          !Number.isInteger(s.draft.index) ||
          s.draft.index < 0 ||
          s.draft.index >= s.draft.order.length ||
          !s.draft.order.every(
            (p) => isTeam(p.owner) && isTeam(p.original) && num(p.number),
          ) ||
          !Array.isArray(s.draft.results) ||
          !Array.isArray(s.draft.lottery))
      )
        return false;
      if (
        s.live &&
        (!isTeam(s.live.home) ||
          !isTeam(s.live.away) ||
          !num(s.live.period) ||
          !num(s.live.clock) ||
          !num(s.live.hs) ||
          !num(s.live.as) ||
          !Array.isArray(s.live.events) ||
          !s.live.box ||
          !Object.values(s.live.box).every(stats))
      )
        return false;
      return true;
    } catch {
      return false;
    }
  }

  const API = {
    VERSION,
    TEAMS,
    POS,
    STATS,
    clamp,
    blank,
    rand,
    int,
    overall,
    demand,
    createCareer,
    roster,
    team,
    payroll,
    strength,
    standings,
    autoRotation,
    createLive,
    stepLive,
    finishLive,
    processResult,
    simulateDay,
    nextPlayoff,
    userNextGame,
    startUserGame,
    commitUserGame,
    playerScore,
    sign,
    resign,
    release,
    evaluateTrade,
    trade,
    scout,
    startDraft,
    draftPlayer,
    autoDraftPick,
    simToPick,
    newSeason,
    upgrade,
    hireCoach,
    setMinutes,
    normalizeRotation,
    validateSave,
    tradeValue,
    pickValue,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.HC = API;
})(typeof window !== "undefined" ? window : globalThis);
