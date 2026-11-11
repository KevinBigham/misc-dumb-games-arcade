(function () {
  "use strict";
  const H = window.HC,
    $ = (sel) => document.querySelector(sel),
    esc = (x) =>
      String(x ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  let S = null,
    route = "overview",
    slot = 1,
    selectedTeam = "SEA",
    marketTab = "free",
    leagueTab = "standings",
    leagueConf = "West",
    rosterPos = "All",
    rosterSort = "ovr",
    search = "",
    tradeTeam = "BOS",
    send = [],
    get = [],
    sendPicks = [],
    getPicks = [],
    scheduleFilter = "all",
    scoutSort = "estimate",
    timer = null,
    speed = 160,
    toastTimer = null,
    busy = false,
    saveFailed = false;
  const paths = {
    ball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c8 1 11.8 4.8 12.8 12.8M5.6 18.4c1-8 4.8-11.8 12.8-12.8"/>',
    overview:
      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    roster:
      '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0112 0v3M16 4a3 3 0 010 6M21 21v-3a6 6 0 00-3-5"/>',
    plan: '<path d="M4 4h16v16H4zM12 4v16M8 8l3 3-3 3M16 8v5M14 11l2 2 2-2"/>',
    schedule:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18M8 15h1M15 15h1"/>',
    league:
      '<path d="M8 3h8v7a4 4 0 01-8 0zM8 5H4v3a4 4 0 004 4M16 5h4v3a4 4 0 01-4 4M12 14v6M8 21h8"/>',
    market: '<path d="M3 7h17l-4-4M21 17H4l4 4M20 7l-4 4M4 17l4-4"/>',
    scouting:
      '<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6M7 10h6M10 7v6"/>',
    office:
      '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M8 9h1M15 9h1M8 12h1M15 12h1"/>',
    history: '<path d="M3 12a9 9 0 119 9M3 4v8h8M12 7v5l3 2"/>',
    arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    play: '<path d="M7 4l14 8-14 8z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    wallet:
      '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8V4h14M16 11h5v5h-5z"/>',
    chart: '<path d="M3 3v18h18M7 15l4-5 4 2 5-7"/>',
    heart:
      '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z"/>',
    news: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h8M8 11h8M8 15h4M8 18h8"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    save: '<path d="M3 3h15l3 3v15H3zM7 3v6h10V3M7 21v-8h10v8"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 116 0c0 2-3 2-3 4M12 17h.01"/>',
    settings: '<path d="M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"/>',
    star: '<path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  };
  const icon = (n, cls = "") =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[n] || paths.ball}</svg>`;
  const button = (text, a, extra = "", cls = "") =>
    `<button class="btn ${cls}" data-a="${a}" ${extra}>${text}</button>`;
  const money = (n) => `${n < 0 ? "−" : ""}$${Math.abs(n).toFixed(1)}M`;
  const avg = (p, k) =>
    p.stats.gp ? (p.stats[k] / p.stats.gp).toFixed(1) : "—";
  const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) + "%" : "—");
  const initials = (n) =>
    n
      .split(" ")
      .map((x) => x[0])
      .slice(0, 2)
      .join("");
  const crest = (id, size = "") => {
    const t = S ? H.team(S, id) : null,
      a = H.TEAMS.find((t) => t[2] === id);
    if (!t && !a) return "";
    return `<span class="crest ${size}" style="--c:${esc(t ? t.color : a[5])}">${esc(id)}</span>`;
  };
  const rate = (n) =>
    `<span class="rating ${n >= 85 ? "elite" : n < 68 ? "low" : ""}">${n}</span>`;
  const nameCell = (p) =>
    `<div class="player-cell"><span class="player-avatar">${esc(initials(p.name))}</span><div class="player-name">${esc(p.name)}${p.injury ? ` <span class="negative">†</span>` : ""}<div class="small">${esc(p.archetype)}</div></div></div>`;
  const phaseName = () =>
    ({
      regular: "Regular season",
      playoffs: [
        "",
        "First round",
        "Conference semifinals",
        "Conference finals",
        "The Finals",
      ][S.playoffs?.round || 1],
      resign: "Contract extensions",
      draft: "Draft night",
      freeAgency: "Free agency",
    })[S.phase];
  const user = () => H.team(S, S.userId);
  const header = (title, desc, actions = "") =>
    `<div class="page-head"><div><div class="eyebrow">${esc(user().city)} ${esc(user().name)}</div><h1>${title}</h1><p>${desc}</p></div><div class="flex">${actions}</div></div>`;
  function court() {
    return `<svg class="court-svg" viewBox="0 0 500 310" fill="none" aria-hidden="true"><defs><pattern id="wood" width="30" height="25" patternUnits="userSpaceOnUse"><path d="M0 0h30v25H0z" fill="#4c5c35" fill-opacity=".17"/><path d="M0 0h30M0 25h30M15 0v25" stroke="#a5af69" stroke-opacity=".07"/></pattern></defs><rect x="35" y="22" width="430" height="266" rx="4" fill="url(#wood)" stroke="#aab780" stroke-opacity=".55"/><path d="M250 22v266" stroke="#adbb86" stroke-opacity=".5"/><circle cx="250" cy="155" r="36" stroke="#adbb86" stroke-opacity=".5"/><circle cx="250" cy="155" r="7" fill="#9caa6b" fill-opacity=".4"/><path d="M35 101h78v108H35M465 101h-78v108h78" stroke="#b5bf89" stroke-opacity=".55"/><circle cx="113" cy="155" r="34" stroke="#b5bf89" stroke-opacity=".55"/><circle cx="387" cy="155" r="34" stroke="#b5bf89" stroke-opacity=".55"/><path d="M35 45h37a123 123 0 010 220H35M465 45h-37a123 123 0 000 220h37" stroke="#b5bf89" stroke-opacity=".55"/><path d="M51 139v32M449 139v32" stroke="#d2cda4" stroke-width="3"/><circle cx="60" cy="155" r="7" stroke="#eab46e" stroke-width="2"/><circle cx="440" cy="155" r="7" stroke="#eab46e" stroke-width="2"/><path d="M250 68l14 29-14-6-14 6zM250 242l14-29-14 6-14-6z" fill="#adba7c" fill-opacity=".18"/></svg>`;
  }
  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function save() {
    if (!S) return;
    try {
      localStorage.setItem("hardcourt.slot." + slot, JSON.stringify(S));
      localStorage.setItem("hardcourt.active", slot);
      saveFailed = false;
      const el = $("#save-status");
      if (el) el.textContent = "Career saved on this device";
    } catch {
      if (!saveFailed)
        toast(
          "Browser storage is full or unavailable. Export your career to keep it.",
          true,
        );
      saveFailed = true;
      const el = $("#save-status");
      if (el) el.textContent = "Export your career to save";
    }
  }
  function toast(text, error = false) {
    clearTimeout(toastTimer);
    const el = $("#toast");
    el.textContent = text;
    el.className = "visible" + (error ? " error" : "");
    toastTimer = setTimeout(() => (el.className = ""), 4300);
  }
  function result(r, message) {
    if (r?.error && !r.ok) {
      toast(r.error, true);
      return false;
    }
    save();
    if (message) toast(message);
    return true;
  }
  function showModal(title, body) {
    const d = $("#modal");
    d.innerHTML = `<div class="modal-head"><h2 id="modal-title">${title}</h2><button class="close" data-a="close" aria-label="Close dialog">×</button></div><div class="modal-body">${body}</div>`;
    if (!d.open) d.showModal();
  }
  function closeModal() {
    if ($("#modal").open) $("#modal").close();
  }
  function render() {
    if (!S) {
      landing();
      return;
    }
    document.documentElement.style.setProperty("--team", user().color);
    const nav = [
      ["overview", "Overview"],
      ["roster", "Roster"],
      ["plan", "Game plan"],
      ["schedule", "Schedule"],
      ["league", "League"],
      ["market", "Market"],
      ["scouting", "Scouting"],
      ["office", "Front office"],
      ["history", "History"],
    ];
    $("#app").innerHTML =
      `<div class="shell"><aside class="sidebar"><div class="brand">${icon("ball", "brand-mark")}HARDCOURT</div><div class="brand-sub">FRANCHISE BASKETBALL</div><div class="team-identity"><div class="flex">${crest(S.userId)}<div><strong class="small">${esc(user().city)}</strong><div class="muted small" style="margin-top:4px">${esc(user().name)}</div></div></div></div><div class="nav-label">Your franchise</div><nav aria-label="Game navigation">${nav.map(([id, label]) => `<button class="nav-link ${route === id ? "active" : ""}" data-a="nav" data-route="${id}" ${route === id ? 'aria-current="page"' : ""}>${icon(id)}${label}</button>`).join("")}</nav><div class="sidebar-bottom"><button class="nav-link" data-a="help">${icon("help")}Playbook & help</button><button class="nav-link" data-a="menu">${icon("settings")}Career menu</button><div class="save-indicator"><i class="dot"></i><span id="save-status">${saveFailed ? "Export your career to save" : "Career saved on this device"}</span></div></div></aside><main class="main"><div class="topbar"><div class="league-title">THE PROFESSIONAL BASKETBALL LEAGUE</div><span class="season-pill">${S.year} / ${String(S.year + 1).slice(-2)} <span class="muted">·</span> ${phaseName()}</span><div class="topbar-right"><span class="muted small manager-name">${esc(S.manager)}</span><span class="avatar">${esc(initials(S.manager))}</span><button class="btn small ghost" data-a="menu">${icon("save")}<span>Career</span></button></div></div><div class="content" id="content">${({ overview, roster, plan, schedule, league, market, scouting, office, history, game }[route] || overview)()}</div></main></div>`;
    if (route === "game" && S.live) updateLive();
  }
  function landing() {
    stopLive();
    let slots = [];
    for (let i = 1; i <= 3; i++) {
      try {
        const s = JSON.parse(storageGet("hardcourt.slot." + i));
        if (H.validateSave(s)) slots.push({ s, i });
      } catch {}
    }
    $("#app").innerHTML =
      `<main class="landing"><div class="landing-top"><div class="brand">${icon("ball", "brand-mark")}HARDCOURT</div><span class="eyebrow">Franchise basketball · 2005</span></div><div class="landing-content"><div class="landing-hero"><div><div class="eyebrow">The game behind the game.</div><h1>Build a team.<br>Leave a <em>legacy.</em></h1><p class="landing-desc">Every contract is a bet. Every draft pick is a possibility. Take the keys to a basketball franchise and turn one season into a dynasty.</p><div class="features"><div class="feature"><strong>30</strong><span>Original teams</span></div><div class="feature"><strong>82</strong><span>Game seasons</span></div><div class="feature"><strong>∞</strong><span>Seasons to build</span></div></div></div><div class="landing-art">${court()}<div class="art-caption">YOUR COURT. YOUR CALL.</div></div></div>${slots.length ? `<div class="eyebrow" style="margin-bottom:12px">Continue your career</div><div class="save-cards">${slots.map(({ s, i }) => `<button class="save-card" data-a="load" data-slot="${i}">${crest(s.userId)}<div><strong>${esc(H.team(s, s.userId).city)} · ${s.year}</strong><p>Slot ${i} · ${s.teams.find((t) => t.id === s.userId).w}–${s.teams.find((t) => t.id === s.userId).l} · ${esc(s.manager)}</p></div>${icon("arrow")}</button>`).join("")}</div>` : ""}<div class="flex between wrap" style="margin-bottom:15px"><div><div class="eyebrow">Start a new franchise</div><h2 style="margin-top:8px">Choose your city.</h2></div>${button(icon("download") + " Import career", "import", "", "small ghost")}</div><div class="team-select-grid">${H.TEAMS.map((t) => `<button class="team-select ${selectedTeam === t[2] ? "selected" : ""}" data-a="select-team" data-id="${t[2]}" style="--c:${t[5]}" aria-pressed="${selectedTeam === t[2]}">${crest(t[2])}<span><strong>${esc(t[0])}</strong><small>${esc(t[1])}</small></span></button>`).join("")}</div><div class="setup-bar"><div class="setup-fields"><label class="input-label">General manager<input id="manager" maxlength="40" value="${esc(storageGet("hardcourt.manager") || "Kevin")}" autocomplete="off"></label><label class="input-label">Front office difficulty<select id="difficulty"><option value="easy">Relaxed</option><option value="standard" selected>Standard</option><option value="hard">Ruthless</option></select></label><label class="input-label">Career slot<select id="new-slot">${[1, 2, 3].map((i) => `<option value="${i}" ${!slots.some((x) => x.i === i) && i === (Array.from({ length: 3 }, (_, j) => j + 1).find((j) => !slots.some((x) => x.i === j)) || 1) ? "selected" : ""}>Slot ${i}${slots.some((x) => x.i === i) ? " · Occupied" : " · Empty"}</option>`).join("")}</select></label></div>${button("Take the keys " + icon("arrow"), "create", "", "primary")}</div><div class="landing-footer">An original basketball management game inspired by the depth of classic franchise modes.<br>Runs entirely offline. Your careers stay in this browser. Export a backup from the Career menu.</div></div></main>`;
  }
  function advanceButtons() {
    if (S.live)
      return button(
        "Resume game " + icon("play"),
        "nav",
        'data-route="game"',
        "primary",
      );
    if (S.phase === "regular")
      return `${button("Simulate…", "sim-options", "", "ghost")}${button("Play next game " + icon("arrow"), "watch", "", "primary")}`;
    if (S.phase === "playoffs")
      return `${button("Simulate…", "sim-options", "", "ghost")}${button(H.userNextGame(S) ? "Coach playoff game " + icon("play") : "Advance playoffs " + icon("arrow"), H.userNextGame(S) ? "watch" : "advance-playoff", "", "primary")}`;
    if (S.phase === "resign")
      return button(
        "Enter draft lottery " + icon("arrow"),
        "begin-draft",
        "",
        "primary",
      );
    if (S.phase === "draft")
      return button(
        "Go to draft room " + icon("arrow"),
        "nav",
        'data-route="scouting"',
        "primary",
      );
    return button(
      "Start next season " + icon("arrow"),
      "new-season",
      "",
      "primary",
    );
  }
  function metric(label, value, sub, ico, cls = "") {
    return `<div class="panel metric"><div class="label">${label}${icon(ico)}</div><div class="value ${cls}">${value}</div><div class="sub">${sub}</div></div>`;
  }
  function overview() {
    const t = user(),
      rank = H.standings(S, t.conf).findIndex((x) => x.id === t.id) + 1,
      r = H.roster(S, t.id)
        .slice()
        .sort((a, b) => b.minutes - a.minutes || b.ovr - a.ovr),
      cap = S.cap - H.payroll(S, t.id);
    const next = H.userNextGame(S);
    const titles = {
      regular: [
        "A new season.<br>A bigger ambition.",
        S.day
          ? `Game ${S.day + 1} of 82. Every decision moves the franchise forward.`
          : "The roster is yours. The expectations are real. Make your first move.",
      ],
      playoffs: [
        "Sixteen teams.<br>One destination.",
        "Best of seven. Everything you have built comes down to this.",
      ],
      resign: [
        "The season ends.<br>The work begins.",
        "Keep your core together. Review expiring contracts before the draft lottery.",
      ],
      draft: [
        "The next era<br>starts tonight.",
        "You have done the homework. Now put your scouting board to work.",
      ],
      freeAgency: [
        "Find the missing<br>piece of the puzzle.",
        "Make your offers, build the rotation, and get ready for another run.",
      ],
    };
    return (
      header(
        "Franchise overview",
        `${S.year} season · ${S.phase === "regular" ? `Game day ${S.day + 1} · ` : ""}${phaseName()}`,
        advanceButtons(),
      ) +
      `<section class="hero"><div class="hero-copy"><span class="tag">${S.phase === "regular" ? "The road to a championship" : phaseName()}</span><h2>${titles[S.phase][0]}</h2><p>${titles[S.phase][1]}</p><div class="hero-actions">${button("Manage roster " + icon("arrow"), "nav", 'data-route="roster"', "small primary")}${button("Set game plan", "nav", 'data-route="plan"', "small ghost")}</div></div><div class="hero-court">${court()}${r
        .slice(0, 5)
        .map(
          (p, i) =>
            `<div class="court-pin" style="left:${[43, 65, 68, 37, 56][i]}%;top:${[27, 36, 65, 71, 56][i]}%"><strong>${p.number}</strong><span>${esc(p.name.split(" ").slice(-1)[0])}</span></div>`,
        )
        .join(
          "",
        )}<div class="court-label">THE STARTING FIVE</div></div></section><div class="grid4">${metric("Season record", `${t.w}<span class="muted">–</span>${t.l}`, `${rank}${ordinal(rank)} in the ${t.conf} · ${t.last10.filter(Boolean).length}–${t.last10.length - t.last10.filter(Boolean).length} last ten`, "chart")}${metric("Team rating", H.strength(S, t.id), `${r.length} players · ${r.filter((p) => p.injury).length} injured`, "roster")}${metric("Cap room", money(cap), `${money(H.payroll(S, t.id))} payroll / ${money(S.cap)} cap`, "wallet", cap < 0 ? "negative" : "")}${metric("Owner confidence", `${Math.round(t.confidence)}<span class="muted" style="font-size:16px"> / 100</span>`, `${t.goal} wins expected this season`, "office")}</div><div class="dashboard-grid"><div class="stack"><section class="panel"><div class="panel-head"><h2>${next ? "Next on the schedule" : "Franchise priority"}</h2><span class="tag gray">${next ? (next.home === S.userId ? "Home game" : "Road game") : phaseName()}</span></div>${next ? matchup(next) : offseasonPriority()}</section><section class="panel"><div class="panel-head"><h2>Your core</h2>${button("Full roster " + icon("chevron"), "nav", 'data-route="roster"', "small ghost")}</div><div class="table-wrap"><table><thead><tr><th>Player</th><th>Pos</th><th>OVR</th><th class="num">PPG</th><th class="num">RPG</th><th class="num">APG</th></tr></thead><tbody>${r
        .slice(0, 5)
        .map(
          (p) =>
            `<tr class="click-row" data-a="player" data-id="${p.id}"><td>${nameCell(p)}</td><td class="muted">${p.pos}</td><td>${rate(p.ovr)}</td><td class="num">${avg(p, "pts")}</td><td class="num">${avg(p, "reb")}</td><td class="num">${avg(p, "ast")}</td></tr>`,
        )
        .join(
          "",
        )}</tbody></table></div></section></div><div class="stack"><section class="panel"><div class="panel-head"><h2>Franchise wire</h2>${icon("news")}</div>${S.news
        .slice(0, 4)
        .map(
          (n) =>
            `<div class="news-item"><div class="news-icon">${icon(n.type === "injury" ? "heart" : n.type === "transaction" ? "market" : n.type === "award" ? "league" : "news")}</div><div><p>${esc(n.text)}</p><div class="news-meta">${n.year} · ${n.day < 82 ? "Game day " + (n.day + 1) : "Postseason"}</div></div></div>`,
        )
        .join(
          "",
        )}</section><section class="panel"><div class="panel-head"><h2>Ownership objectives</h2><span class="tag orange">${t.confidence >= 65 ? "Stable" : t.confidence >= 35 ? "Under pressure" : "Hot seat"}</span></div><div class="goal-row"><p class="flex between"><span>Win ${t.goal} regular season games</span><strong>${t.w} / ${t.goal}</strong></p><div class="progress"><i style="width:${Math.min(100, (t.w / t.goal) * 100)}%"></i></div></div><div class="goal-row"><p class="flex between"><span>Finish the year in the black</span><strong class="${t.profit >= 0 ? "positive" : "negative"}">${money(t.profit)}</strong></p><span class="muted tiny">Broadcast revenue is credited at season opening.</span></div><div class="goal-row"><p class="flex between"><span>Keep the city behind you</span><strong>${Math.round(t.fans)}% support</strong></p><div class="progress"><i style="width:${t.fans}%"></i></div></div></section></div></div>`
    );
  }
  function ordinal(n) {
    return n % 10 === 1 && n !== 11
      ? "st"
      : n % 10 === 2 && n !== 12
        ? "nd"
        : n % 10 === 3 && n !== 13
          ? "rd"
          : "th";
  }
  function matchup(g) {
    const h = H.team(S, g.home),
      a = H.team(S, g.away);
    return `<div class="upcoming"><div class="team-block">${crest(a.id, "medium")}<div><span class="city">${esc(a.city)}</span><strong>${esc(a.name)}</strong><span class="muted tiny">${a.w}–${a.l} · ${H.strength(S, a.id)} OVR</span></div></div><span class="versus">VS</span><div class="team-block"><div style="text-align:right"><span class="city">${esc(h.city)}</span><strong>${esc(h.name)}</strong><span class="muted tiny">${h.w}–${h.l} · ${H.strength(S, h.id)} OVR</span></div>${crest(h.id, "medium")}</div></div><div class="upcoming-footer"><span>${g.playoff ? "Best-of-seven series" : `Game ${S.day + 1} · ${h.city} Arena`}</span>${button("Scout opponent", "team", `data-id="${g.home === S.userId ? g.away : g.home}"`, "small ghost")}</div>`;
  }
  function offseasonPriority() {
    if (S.phase === "resign") {
      const rights = S.players.filter(
        (p) => !p.retired && !p.teamId && p.prevTeamId === S.userId,
      );
      return `<div class="panel-body"><h2>${rights.length} expiring contracts</h2><p class="muted small" style="margin:12px 0 18px">Your returning players can re-sign above the cap in this phase. Unsigned players enter the open market after the draft.</p>${button("Review contracts", "nav", 'data-route="market"', "primary small")}</div>`;
    }
    return `<div class="panel-body"><p class="muted small" style="margin-bottom:18px">${S.phase === "draft" ? "The lottery order is set. Open the draft room to make your selections." : S.phase === "freeAgency" ? "Review your cap room and roster before opening the next season." : "Your team is out of the bracket. Follow the remaining series to crown a champion."}</p>${S.phase === "playoffs" ? button("View playoff bracket", "nav", 'data-route="league"', "small primary") : advanceButtons()}</div>`;
  }
  function roster() {
    let r = H.roster(S, S.userId)
      .filter((p) => rosterPos === "All" || p.pos === rosterPos)
      .sort((a, b) =>
        rosterSort === "name"
          ? a.name.localeCompare(b.name)
          : b[rosterSort] - a[rosterSort],
      );
    const total = H.roster(S, S.userId).reduce((n, p) => n + p.minutes, 0);
    return (
      header(
        "The roster",
        "Build your rotation. Know every contract. Find your edge.",
        button("Auto-set rotation", "auto-rotation", "", "ghost"),
      ) +
      `<div class="grid4" style="margin-bottom:20px">${metric("Players", H.roster(S, S.userId).length, "8–15 during the season · 20 in offseason", "roster")}${metric("Payroll", money(H.payroll(S, S.userId)), `${money(S.cap)} salary cap`, "wallet")}${metric("Average age", (H.roster(S, S.userId).reduce((n, p) => n + p.age, 0) / H.roster(S, S.userId).length).toFixed(1), "Youth has upside. Veterans have experience.", "chart")}${metric("Rotation minutes", total, "Target: 240 minutes per regulation game", "plan", total !== 240 ? "negative" : "")}</div><div class="filters"><label class="input-label">Position<select data-change="roster-pos">${["All", ...H.POS].map((x) => `<option ${x === rosterPos ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="input-label">Sort by<select data-change="roster-sort">${[
        ["ovr", "Overall"],
        ["potential", "Potential"],
        ["age", "Age"],
        ["salary", "Salary"],
        ["name", "Name"],
        ["minutes", "Minutes"],
      ]
        .map(
          ([v, l]) =>
            `<option value="${v}" ${v === rosterSort ? "selected" : ""}>${l}</option>`,
        )
        .join(
          "",
        )}</select></label><div class="grow"></div>${button("Normalize to 240", "normalize", "", "small ghost")}</div>${total !== 240 ? '<div class="notice">Your rotation does not total 240 minutes. Normalize it to preserve your chosen proportions.</div>' : ""}<section class="panel"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Pos</th><th>Age</th><th>OVR</th><th>POT</th><th class="num">Salary</th><th>Contract</th><th>MIN</th><th class="num">PPG</th><th>Condition</th></tr></thead><tbody>${r.map((p) => `<tr><td class="click-row" data-a="player" data-id="${p.id}">${nameCell(p)}</td><td>${p.pos}</td><td>${p.age}</td><td>${rate(p.ovr)}</td><td class="positive">${p.potential}</td><td class="num">${money(p.salary)}</td><td class="muted">${p.years} yr${p.years !== 1 ? "s" : ""}</td><td><input class="rotation-input" type="number" min="0" max="48" value="${p.minutes}" data-change="minutes" data-id="${p.id}" aria-label="${esc(p.name)} minutes"></td><td class="num">${avg(p, "pts")}</td><td>${p.injury ? `<span class="tag red">Out ${p.injury} games</span>` : `<span class="${p.energy < 75 ? "negative" : "positive"}">${Math.round(p.energy)}%</span>`}</td></tr>`).join("")}</tbody></table></div></section><p class="muted small" style="margin-top:15px">Click a player to view skills, career stats and contract actions. Minutes are targets; injuries and game length affect actual playing time.</p>`
    );
  }
  function plan() {
    const t = user(),
      strategy = t.strategy;
    const groups = [
      [
        "pace",
        "Tempo",
        [
          ["slow", "Deliberate", "Fewer possessions. Better shot selection."],
          ["balanced", "Balanced", "A steady tempo for a complete roster."],
          [
            "fast",
            "Push the pace",
            "More possessions, with a small efficiency cost.",
          ],
        ],
      ],
      [
        "offense",
        "Offensive identity",
        [
          ["balanced", "Read & react", "Let the roster determine the shots."],
          [
            "motion",
            "Motion offense",
            "Move the ball. Create assisted baskets.",
          ],
          ["perimeter", "Space the floor", "Prioritize three-point attempts."],
          ["paint", "Attack the paint", "Trade long shots for interior looks."],
        ],
      ],
      [
        "defense",
        "Defensive scheme",
        [
          ["man", "Man to man", "A balanced approach with clear matchups."],
          [
            "zone",
            "Protect the paint",
            "Limit interior efficiency; concede more threes.",
          ],
          [
            "press",
            "Full court pressure",
            "Force turnovers, at the cost of more fouls.",
          ],
        ],
      ],
      [
        "training",
        "Weekly development",
        [
          [
            "balanced",
            "All-around",
            "Develop a random skill each training week.",
          ],
          ["shooting", "Shooting lab", "Focus development on shooting."],
          [
            "defense",
            "Defensive drills",
            "Build individual defensive ability.",
          ],
          ["rest", "Recovery", "Restore condition; pause weekly skill gains."],
        ],
      ],
    ];
    return (
      header(
        "Game plan",
        "Your system changes the shots, tempo and development of the team.",
        button(
          "Edit rotation " + icon("arrow"),
          "nav",
          'data-route="roster"',
          "ghost",
        ),
      ) +
      `<div class="notice">Changes apply to the next possession, including during live games. Youth development also depends on your coach and development center.</div><div class="grid2">${groups.map(([key, label, opts]) => `<section class="panel"><div class="panel-head"><h2>${label}</h2>${icon("plan")}</div><div class="panel-body stack" style="padding-top:0;gap:10px">${opts.map(([val, title, desc]) => `<button class="strategy-option ${strategy[key] === val ? "active" : ""}" data-a="strategy" data-key="${key}" data-value="${val}" aria-pressed="${strategy[key] === val}"><h3>${title}${strategy[key] === val ? " ✓" : ""}</h3><p>${desc}</p></button>`).join("")}</div></section>`).join("")}</div>`
    );
  }
  function schedule() {
    const games = S.schedule.filter(
      (g) =>
        (g.home === S.userId || g.away === S.userId) &&
        (scheduleFilter === "all" ||
          (scheduleFilter === "played" ? g.played : !g.played)),
    );
    return (
      header(
        "The schedule",
        "82 games. A season full of opportunities.",
        advanceButtons(),
      ) +
      `<div class="tabs">${[
        ["all", "All games"],
        ["played", "Results"],
        ["upcoming", "Upcoming"],
      ]
        .map(
          ([v, l]) =>
            `<button class="tab ${v === scheduleFilter ? "active" : ""}" data-a="schedule-tab" data-value="${v}">${l}</button>`,
        )
        .join("")}</div><section class="panel">${
        games.length
          ? games
              .map((g) => {
                const opponent = g.home === S.userId ? g.away : g.home,
                  t = H.team(S, opponent),
                  won = g.home === S.userId ? g.hs > g.as : g.as > g.hs;
                return `<div class="schedule-row"><span class="schedule-date">GAME ${g.day + 1}<br><span class="tiny">${g.day < S.day ? "Completed" : g.day === S.day ? "Next game" : "Scheduled"}</span></span>${crest(opponent)}<div class="grow"><h3>${g.home === S.userId ? "vs." : "at"} ${esc(t.city)} ${esc(t.name)}</h3><span class="muted tiny">${g.home === S.userId ? "Home" : "Away"} · ${t.w}–${t.l}</span></div>${g.played ? `<span class="tag ${won ? "" : "red"}">${won ? "W" : "L"}</span><span class="schedule-score">${g.home === S.userId ? g.hs : g.as} <span class="muted">–</span> ${g.home === S.userId ? g.as : g.hs}</span>${button("Box score", "box", `data-id="${g.id}"`, "small ghost")}` : `<span class="muted small hide-phone">${H.strength(S, opponent)} OVR</span>`}</div>`;
              })
              .join("")
          : '<div class="empty">No games in this view.</div>'
      }</section>`
    );
  }
  function league() {
    return (
      header(
        "Around the league",
        "Know the contenders. Watch the races. Track the greats.",
      ) +
      `<div class="tabs">${[
        ["standings", "Standings"],
        ["leaders", "Player leaders"],
        ["playoffs", "Playoff bracket"],
      ]
        .map(
          ([v, l]) =>
            `<button class="tab ${leagueTab === v ? "active" : ""}" data-a="league-tab" data-value="${v}">${l}</button>`,
        )
        .join("")}</div>` +
      (leagueTab === "standings"
        ? standingsView()
        : leagueTab === "leaders"
          ? leadersView()
          : playoffsView())
    );
  }
  function standingsView() {
    const r = H.standings(S, leagueConf),
      lead = r[0];
    return `<div class="filters"><select data-change="conference" aria-label="Conference">${["East", "West"].map((c) => `<option ${leagueConf === c ? "selected" : ""}>${c}</option>`).join("")}</select><span class="muted small">Top eight in each conference advance. Ties: point differential, then team code.</span></div><section class="panel"><div class="table-wrap"><table><thead><tr><th>#</th><th>Team</th><th class="num">W</th><th class="num">L</th><th class="num">PCT</th><th class="num">GB</th><th class="num">PPG</th><th class="num">OPP</th><th>Last 10</th><th>Streak</th><th>OVR</th></tr></thead><tbody>${r.map((t, i) => `<tr class="click-row ${t.id === S.userId ? "self-row" : ""}" data-a="team" data-id="${t.id}" style="${i === 7 ? "border-bottom:2px solid #708858" : ""}"><td class="muted">${i + 1}</td><td><div class="flex">${crest(t.id)}<div><strong>${esc(t.city)} ${esc(t.name)}</strong><div class="muted tiny" style="margin-top:4px">${t.division}</div></div></div></td><td class="num">${t.w}</td><td class="num muted">${t.l}</td><td class="num">${t.w + t.l ? (t.w / (t.w + t.l)).toFixed(3) : ".000"}</td><td class="num muted">${i ? ((lead.w - t.w + t.l - lead.l) / 2).toFixed(1) : "—"}</td><td class="num">${t.w + t.l ? (t.pf / (t.w + t.l)).toFixed(1) : "—"}</td><td class="num muted">${t.w + t.l ? (t.pa / (t.w + t.l)).toFixed(1) : "—"}</td><td>${t.last10.filter(Boolean).length}–${t.last10.length - t.last10.filter(Boolean).length}</td><td>${t.streak ? `${t.streak > 0 ? "W" : "L"}${Math.abs(t.streak)}` : "—"}</td><td>${rate(H.strength(S, t.id))}</td></tr>`).join("")}</tbody></table></div></section>`;
  }
  function leadersView() {
    const r = S.players
      .filter((p) => p.stats.gp > 0)
      .sort(
        (a, b) =>
          b.stats[leaderStat] / b.stats.gp - a.stats[leaderStat] / a.stats.gp,
      )
      .slice(0, 70);
    return `<div class="filters"><label class="input-label">Rank by<select data-change="leader-stat">${[
      ["pts", "Points"],
      ["reb", "Rebounds"],
      ["ast", "Assists"],
      ["stl", "Steals"],
      ["blk", "Blocks"],
      ["min", "Minutes"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${v === leaderStat ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select></label><span class="muted small">Regular season averages · click a player for their full report</span></div><section class="panel"><div class="table-wrap"><table><thead><tr><th>#</th><th>Player</th><th>Team</th><th>GP</th><th class="num">PPG</th><th class="num">RPG</th><th class="num">APG</th><th class="num">SPG</th><th class="num">BPG</th><th class="num">FG%</th><th class="num">3P%</th></tr></thead><tbody>${r.map((p, i) => `<tr class="click-row ${p.teamId === S.userId ? "self-row" : ""}" data-a="player" data-id="${p.id}"><td class="muted">${i + 1}</td><td>${nameCell(p)}</td><td class="muted">${p.teamId || "FA"}</td><td>${p.stats.gp}</td>${["pts", "reb", "ast", "stl", "blk"].map((k) => `<td class="num">${avg(p, k)}</td>`).join("")}<td class="num">${pct(p.stats.fgm, p.stats.fga)}</td><td class="num">${pct(p.stats.tpm, p.stats.tpa)}</td></tr>`).join("")}</tbody></table></div>${r.length ? "" : '<div class="empty">League leaders appear after the first games are played.</div>'}</section>`;
  }
  let leaderStat = "pts";
  function seriesCard(x) {
    const winner = x.winner;
    return `<div class="series"><div class="series-head">${esc(x.conf)} · ${winner ? "Final" : `${x.aw + x.bw === 0 ? "Best of seven" : "In progress"}`}</div>${[
      [x.a, x.aw],
      [x.b, x.bw],
    ]
      .map(
        ([id, w]) =>
          `<div class="series-team ${winner === id ? "winner" : ""}">${crest(id)}<span>${S.playoffs.seeds[id] || ""}. ${esc(H.team(S, id).city)}</span><b>${w}</b></div>`,
      )
      .join("")}</div>`;
  }
  function playoffsView() {
    if (!S.playoffs)
      return `<div class="panel empty">${icon("league")}The bracket opens after game 82.<br>Eight teams from each conference. Four best-of-seven rounds.</div>`;
    const all = [...S.playoffs.completed, ...S.playoffs.series];
    return `${S.playoffs.champion ? `<div class="notice success">${icon("league")}${esc(H.team(S, S.playoffs.champion).city)} ${esc(H.team(S, S.playoffs.champion).name)} are the ${S.year} champions.</div>` : ""}<section class="panel panel-body"><div class="table-wrap"><div class="bracket">${[
      1, 2, 3, 4,
    ]
      .map(
        (round) =>
          `<div class="bracket-col"><div class="eyebrow" style="text-align:center">${["", "First round", "Semifinals", "Conference finals", "The Finals"][round]}</div>${
            all
              .filter((x) =>
                round === 4
                  ? x.conf === "Finals"
                  : x.conf !== "Finals" && x.id.includes("-" + round + "-"),
              )
              .map(seriesCard)
              .join("") || '<div class="empty small">To be decided</div>'
          }</div>`,
      )
      .join("")}</div></div></section>`;
  }
  function market() {
    if (S.phase === "resign") marketTab = "extensions";
    else if (marketTab === "extensions") marketTab = "free";
    return (
      header(
        "The market",
        "One good decision can change the direction of a franchise.",
      ) +
      `<div class="grid3" style="margin-bottom:20px">${metric("Cap room", money(S.cap - H.payroll(S, S.userId)), `${money(S.cap)} cap · Minimum exception: $0.8M`, "wallet")}${metric("Roster spots", `${H.roster(S, S.userId).length} / ${S.phase === "regular" ? 15 : 20}`, "Keep 8–15 players to begin a season", "roster")}${metric("Owned picks", S.picks.filter((p) => p.owner === S.userId && p.year >= S.year).length, "Draft assets for the next three classes", "scouting")}</div><div class="tabs">${(S.phase ===
      "resign"
        ? [["extensions", "Re-sign your players"]]
        : [
            ["free", "Free agents"],
            ["trades", "Trade center"],
            ["picks", "Draft capital"],
          ]
      )
        .map(
          ([v, l]) =>
            `<button class="tab ${marketTab === v ? "active" : ""}" data-a="market-tab" data-value="${v}">${l}</button>`,
        )
        .join("")}</div>` +
      (marketTab === "trades"
        ? tradeView()
        : marketTab === "picks"
          ? picksView()
          : freeAgents())
    );
  }
  function freeAgents() {
    const extensions = marketTab === "extensions";
    const r = S.players
      .filter(
        (p) =>
          !p.teamId &&
          !p.retired &&
          (!extensions || p.prevTeamId === S.userId) &&
          p.name.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => b.ovr - a.ovr);
    return `${extensions ? '<div class="notice">You hold returning-player rights in this phase. Re-sign your players above the salary cap. These rights expire when you enter the draft.</div>' : ""}<div class="filters"><input class="search" data-input="search" placeholder="Search player name…" aria-label="Search free agents" value="${esc(search)}"><span class="muted small">${r.length} players available · salaries shown per year</span></div><section class="panel"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Pos</th><th>Age</th><th>OVR</th><th>POT</th><th class="num">Asking salary</th><th></th></tr></thead><tbody>${r
      .slice(0, 100)
      .map(
        (p) =>
          `<tr><td data-a="player" data-id="${p.id}" class="click-row">${nameCell(p)}</td><td>${p.pos}</td><td>${p.age}</td><td>${rate(p.ovr)}</td><td class="positive">${p.potential}</td><td class="num">${money(H.demand(p))}</td><td>${button("Negotiate", "offer", `data-id="${p.id}"`, "small ghost")}</td></tr>`,
      )
      .join(
        "",
      )}</tbody></table></div>${r.length ? "" : '<div class="empty">No players match this view. Your roster may already be under contract.</div>'}</section>`;
  }
  function assetList(id, side) {
    const list = H.roster(S, id)
      .slice()
      .sort((a, b) => b.ovr - a.ovr);
    const selected = side === "send" ? send : get,
      selectedP = side === "send" ? sendPicks : getPicks;
    return `<div class="asset-list">${list.map((p) => `<label class="asset"><input type="checkbox" data-change="trade-asset" data-side="${side}" data-id="${p.id}" ${selected.includes(p.id) ? "checked" : ""}><div class="grow"><b>${esc(p.name)}</b><div class="muted tiny" style="margin-top:4px">${p.pos} · ${p.age} yrs · ${money(p.salary)} · ${p.years} yr deal</div></div>${rate(p.ovr)}</label>`).join("")}<div class="eyebrow" style="padding:18px 16px 10px">Draft picks</div>${S.picks
      .filter((p) => p.owner === id && p.year >= S.year)
      .map(
        (p) =>
          `<label class="asset"><input type="checkbox" data-change="trade-pick" data-side="${side}" data-id="${p.id}" ${selectedP.includes(p.id) ? "checked" : ""}>${icon("scouting")}<span>${p.year} round ${p.round} <span class="muted">(${p.original})</span></span></label>`,
      )
      .join("")}</div>`;
  }
  function tradeView() {
    const e = H.evaluateTrade(S, tradeTeam, send, get, sendPicks, getPicks);
    return `${S.day >= 60 && S.phase === "regular" ? '<div class="notice">The trade deadline has passed. Trades reopen in free agency.</div>' : ""}<div class="filters"><label class="input-label">Trade partner<select data-change="trade-team">${S.teams
      .filter((t) => t.id !== S.userId)
      .map(
        (t) =>
          `<option value="${t.id}" ${t.id === tradeTeam ? "selected" : ""}>${esc(t.city)} ${esc(t.name)}</option>`,
      )
      .join(
        "",
      )}</select></label><span class="muted small">Select any combination of players and draft picks.</span></div><div class="grid2"><section class="panel"><div class="panel-head"><h2>You send</h2><span class="muted small">${send.length + sendPicks.length} assets</span></div>${assetList(S.userId, "send")}</section><section class="panel"><div class="panel-head"><h2>You receive</h2><span class="muted small">${get.length + getPicks.length} assets</span></div>${assetList(tradeTeam, "get")}</section></div><div id="trade-evaluation">${tradeEvaluation(e)}</div><p class="muted small" style="margin-top:15px">Over-cap teams can receive up to 125% of outgoing salary plus $0.5M. The AI weighs ability, upside, age, salary and pick quality.</p>`;
  }
  function tradeEvaluation(e) {
    const active =
      send.length + get.length + sendPicks.length + getPicks.length;
    return `<div class="trade-status flex between wrap"><div><h3 class="${e.ok ? "positive" : ""}">${e.ok ? "Their front office is ready to deal" : active ? "Offer needs work" : "Build your offer"}</h3><p class="muted small" style="margin-top:7px">${esc(e.ok ? "The salaries work, and they like the value." : e.error || "Select assets from both rosters.")}</p>${e.legal && active ? `<div class="small muted" style="margin-top:9px">Value offered: ${Math.round(e.offered)} · Requested: ${Math.round(e.requested)}</div>` : ""}</div>${button("Propose trade " + icon("market"), "execute-trade", !e.ok ? "disabled" : "", "primary")}</div>`;
  }
  function picksView() {
    return `<section class="panel"><div class="table-wrap"><table><thead><tr><th>Year</th><th>Round</th><th>Original team</th><th>Projected value</th></tr></thead><tbody>${S.picks
      .filter((p) => p.owner === S.userId && p.year >= S.year)
      .sort((a, b) => a.year - b.year || a.round - b.round)
      .map(
        (p) =>
          `<tr><td><strong>${p.year}</strong></td><td>Round ${p.round}</td><td><div class="flex">${crest(p.original)}${esc(H.team(S, p.original).city)}</div></td><td class="muted">${p.round === 1 ? "Premium asset" : "Development prospect"}</td></tr>`,
      )
      .join(
        "",
      )}</tbody></table></div></section><p class="muted small" style="margin-top:15px">The 14 non-playoff teams enter a weighted lottery for the first four picks. All remaining positions follow reverse regular season standings.</p>`;
  }
  function scouting() {
    const isDraft = S.phase === "draft",
      cp = isDraft ? S.draft.order[S.draft.index] : null;
    const prospects = S.prospects
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .slice()
      .sort((a, b) => b[scoutSort] - a[scoutSort]);
    return (
      header(
        isDraft ? "The draft room" : "Scouting department",
        isDraft
          ? "Two rounds. Sixty chances to change a franchise."
          : "Find tomorrow’s difference makers before the rest of the league.",
        `<span class="tag orange">${S.scoutPoints} scouting points</span>`,
      ) +
      `${isDraft ? `<div class="draft-clock"><div><div class="eyebrow">On the clock · Round ${cp.round} · Pick ${cp.number}</div><div class="flex" style="margin-top:12px">${crest(cp.owner, "medium")}<div><h2>${esc(H.team(S, cp.owner).city)} ${esc(H.team(S, cp.owner).name)}</h2><p class="muted small">${cp.owner === S.userId ? "Your selection. Choose a prospect below." : "Simulate ahead to your next selection."}${cp.owner !== cp.original ? " · Pick acquired from " + cp.original : ""}</p></div></div></div><div class="flex wrap">${button("Sim to my pick", "sim-draft", cp.owner === S.userId ? "disabled" : "", "primary")}${button("Auto-draft all", "auto-draft-all", "", "ghost")}</div></div><div class="notice">Lottery winners: ${S.draft.lottery.map((id) => esc(H.team(S, id).city)).join(" · ")}. First-round contracts last three years; second-round contracts last two.</div>` : ""}${
        S.prospects.length
          ? `<div class="filters"><input class="search" data-input="search" placeholder="Search prospects…" aria-label="Search prospects" value="${esc(search)}"><label class="input-label">Rank board by<select data-change="scout-sort"><option value="estimate" ${scoutSort === "estimate" ? "selected" : ""}>Projected overall</option><option value="potEstimate" ${scoutSort === "potEstimate" ? "selected" : ""}>Projected potential</option></select></label><span class="muted small">15 points per scouting visit · three visits reveal exact ratings</span></div><div class="${isDraft ? "two-col-asym" : ""}"><section class="panel prospect-board"><div class="table-wrap"><table><thead><tr><th>Prospect</th><th>Pos</th><th>Age</th><th>OVR est.</th><th>Upside</th><th>Intel</th><th></th></tr></thead><tbody>${prospects.map((p) => `<tr><td class="click-row" data-a="prospect" data-id="${p.id}"><div class="player-name">${esc(p.name)}<div class="small">${esc(p.college)}</div></div></td><td>${p.pos}</td><td>${p.age}</td><td>${p.estimate}${p.scouted < 3 ? '<span class="muted tiny"> ±' + [10, 6, 3][p.scouted] + "</span>" : ""}</td><td class="positive">${p.potEstimate}</td><td><span class="muted tiny">${["Unseen", "Initial", "In depth", "Complete"][p.scouted]}</span></td><td><div class="flex">${button("Scout", "scout", `data-id="${p.id}" ${p.scouted === 3 || S.scoutPoints < 15 ? "disabled" : ""}`, "small ghost")}${isDraft && cp.owner === S.userId ? button("Draft", "draft-player", `data-id="${p.id}"`, "small primary") : ""}</div></td></tr>`).join("")}</tbody></table></div></section>${
              isDraft
                ? `<section class="panel"><div class="panel-head"><h2>Selections</h2><span class="muted small">${S.draft.results.length} / 60</span></div><div class="draft-results">${
                    S.draft.results
                      .slice()
                      .reverse()
                      .map(
                        (r) =>
                          `<div class="news-item"><span class="muted small">${r.pick}</span>${crest(r.teamId)}<div><strong class="small">${esc(r.name)}</strong><div class="muted tiny" style="margin-top:5px">${r.pos} · ${r.teamId} · ${r.ovr} OVR</div></div></div>`,
                      )
                      .join("") ||
                    '<div class="empty">The first pick is on the clock.</div>'
                  }</div></section>`
                : ""
            }</div>`
          : `<section class="panel empty">${icon("scouting")}The draft class has been selected.<br>A new scouting board arrives at the start of the next season.${S.phase === "freeAgency" ? '<div style="margin-top:20px">' + button("Manage free agency", "nav", 'data-route="market"', "primary") + "</div>" : ""}</section>`
      }`
    );
  }
  function office() {
    const t = user();
    const levels = (n) =>
      `<div class="level-dots">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
    return (
      header("The front office", "Build the organization behind the team.") +
      `<div class="grid4" style="margin-bottom:22px">${metric("Cash reserves", money(t.cash), "Funds operations, buyouts and investments", "wallet", t.cash < 0 ? "negative" : "")}${metric("Season profit", money(t.profit), "Gate receipts + broadcast − costs", "chart", t.profit < 0 ? "negative" : "positive")}${metric("Fan support", Math.round(t.fans) + "%", "Winning and marketing build attendance", "heart")}${metric("Job security", Math.round(t.confidence) + "/100", `Win target: ${t.goal} · Reviewed after Finals`, "office")}</div><div class="grid2"><section class="panel"><div class="panel-head"><h2>Business operations</h2>${icon("wallet")}</div><div class="panel-body"><label class="input-label">Ticket price · $<span id="ticket-value">${t.ticket}</span><input type="range" min="30" max="150" step="5" value="${t.ticket}" data-change="ticket" aria-label="Ticket price"></label><p class="muted small" style="margin:10px 0 20px">Higher prices increase revenue per seat and reduce attendance. Winning teams can sustain higher prices.</p><label class="input-label">Annual marketing budget<select data-change="marketing">${[0, 1, 2, 3, 5].map((v) => `<option value="${v}" ${t.marketing === v ? "selected" : ""}>${money(v)} / year</option>`).join("")}</select></label><hr><div class="flex between"><span class="small muted">Guaranteed buyouts on cap</span><strong>${money(t.deadCap)}</strong></div><p class="muted tiny" style="margin-top:12px">$22M annual broadcast payment is credited at the start of each season. Remaining operating expenses accrue each game.</p></div></section><section class="panel"><div class="panel-head"><h2>Head coach</h2><span class="tag">${money(t.coach.salary)} / yr</span></div><div class="panel-body"><h2>${esc(t.coach.name)}</h2>${[
        ["offense", "Offense"],
        ["defense", "Defense"],
        ["development", "Development"],
      ]
        .map(
          ([k, l]) =>
            `<div class="attribute"><span>${l}</span><div class="progress"><i style="width:${t.coach[k]}%"></i></div><b>${t.coach[k]}</b></div>`,
        )
        .join(
          "",
        )}<p class="muted small" style="margin:16px 0">Replace your coach for $4M. Specialists earn $3.5M per season.</p><div class="flex wrap">${["offense", "defense", "development"].map((x) => button(x[0].toUpperCase() + x.slice(1), "coach-confirm", `data-type="${x}"`, "small ghost")).join("")}</div></div></section></div><div class="grid3" style="margin-top:20px">${[
        [
          "facilities",
          "Arena experience",
          "Each level adds 500 seats. Better facilities cost more to operate.",
        ],
        [
          "development",
          "Development center",
          "Each level increases weekly skill growth and scouting points.",
        ],
        [
          "medical",
          "Sports medicine",
          "Each level reduces the chance of player injuries.",
        ],
      ]
        .map(
          ([key, label, desc]) =>
            `<section class="panel front-card"><div class="flex between"><h2>${label}</h2><span class="tag gray">Level ${t[key]}</span></div><div style="margin-top:18px">${levels(t[key])}</div><p>${desc}</p>${button(t[key] === 5 ? "Fully upgraded" : `Upgrade · ${money(t[key] * 5)}`, "upgrade", `data-key="${key}" ${t[key] === 5 || t.cash < t[key] * 5 ? "disabled" : ""}`, "small " + (t[key] < 5 ? "primary" : "ghost"))}</section>`,
        )
        .join("")}</div>`
    );
  }
  function history() {
    const wins = S.history.filter((h) => h.champion === h.userTeam).length;
    return (
      header(
        "Leave a legacy",
        "Championships are won in June. Dynasties are built over decades.",
      ) +
      `<div class="grid3" style="margin-bottom:22px">${metric("Seasons completed", S.seasonsPlayed, "Every year is another chapter", "history")}${metric("Championships", wins, "Titles won under your leadership", "league")}${metric("Career record", S.history.reduce((n, h) => n + h.userRecord[0], 0) + "–" + S.history.reduce((n, h) => n + h.userRecord[1], 0), "Completed regular seasons", "chart")}</div>${S.achievements.length ? `<div class="flex wrap" style="margin-bottom:22px">${S.achievements.map((a) => `<div class="badge-achievement">${icon("star")}${esc(a)}</div>`).join("")}</div>` : ""}<div class="stack">${S.history.length ? S.history.map((h) => `<section class="panel"><div class="panel-head"><div class="flex">${crest(h.champion, "medium")}<div><div class="eyebrow">${h.year} champions</div><h2 style="margin-top:7px">${esc(H.team(S, h.champion).city)} ${esc(H.team(S, h.champion).name)}</h2></div></div><span class="tag ${h.champion === h.userTeam ? "orange" : "gray"}">Your record: ${h.userRecord[0]}–${h.userRecord[1]}</span></div><div class="panel-body"><div class="grid3"><div><div class="muted tiny">MOST VALUABLE PLAYER</div><h3 style="margin:8px 0">${esc(h.mvp?.name || "—")}</h3><p class="muted small">${h.mvp ? h.mvp.pts.toFixed(1) + " points per game" : ""}</p></div><div><div class="muted tiny">DEFENSIVE PLAYER</div><h3 style="margin-top:8px">${esc(h.dpoy || "—")}</h3></div><div><div class="muted tiny">ROOKIE OF THE YEAR</div><h3 style="margin-top:8px">${esc(h.rookie)}</h3></div></div><hr><div class="eyebrow">All-league first team</div><div class="flex wrap" style="margin-top:14px;gap:24px">${h.allLeague.map((p) => `<div><strong class="small">${esc(p.name)}</strong><div class="muted tiny" style="margin-top:4px">${p.pos} · ${p.teamId || "FA"}</div></div>`).join("")}</div></div></section>`).join("") : '<section class="panel empty">' + icon("league") + "Your legacy is a blank page.<br>Finish your first season to see champions, awards, and career milestones.</section>"}</div><section class="panel" style="margin-top:22px"><div class="panel-head"><h2>Transaction ledger</h2><span class="muted small">Last ${S.transactions.length}</span></div>${
        S.transactions
          .slice(0, 30)
          .map(
            (t) =>
              `<div class="news-item"><span class="muted tiny">${t.year}</span><p>${esc(t.text)}</p></div>`,
          )
          .join("") ||
        '<div class="empty">Your first move is still ahead of you.</div>'
      }</section>`
    );
  }
  function game() {
    if (!S.live)
      return (
        header("Game center", "Your next game is waiting.") +
        `<div class="panel empty">${button("Return to franchise", "nav", 'data-route="overview"', "primary")}</div>`
      );
    const l = S.live,
      h = H.team(S, l.home),
      a = H.team(S, l.away);
    return (
      header(
        "Game night",
        "Coach the possessions. Change the plan. Own the result.",
        button("Back to franchise", "nav", 'data-route="overview"', "ghost"),
      ) +
      `<section class="panel"><div class="live-scoreboard"><div class="live-team">${crest(a.id, "medium")}<div><h2>${esc(a.city)}</h2><span class="muted small">${esc(a.name)}</span></div><div class="live-score" id="live-as">${l.as}</div></div><div class="live-center"><div class="live-clock" id="live-clock"></div><div class="live-period" id="live-period"></div></div><div class="live-team away"><div class="live-score" id="live-hs">${l.hs}</div><div><h2>${esc(h.city)}</h2><span class="muted small">${esc(h.name)}</span></div>${crest(h.id, "medium")}</div></div><div class="game-court-wrap" id="live-court">${court()}<div id="shot-marker"></div><div class="possession-banner" id="possession-text">The teams are ready. Your game plan is set.</div></div><div class="live-controls"><div class="flex wrap"><button class="btn primary" data-a="live-toggle" id="live-toggle">${icon("play")}Watch live</button>${button("Next possession", "live-step", "", "small ghost")}${button("Sim quarter", "live-quarter", "", "small ghost")}${button("Finish game", "live-finish", "", "small ghost")}</div><label class="flex small muted">Speed<select id="live-speed" data-change="live-speed" aria-label="Live simulation speed"><option value="650" ${speed === 650 ? "selected" : ""}>1×</option><option value="160" ${speed === 160 ? "selected" : ""}>4×</option><option value="30" ${speed === 30 ? "selected" : ""}>20×</option></select></label></div></section><div id="live-result-actions"></div><div class="two-col-asym" style="margin-top:20px"><section class="panel"><div class="panel-head"><h2>Play by play</h2><span class="tag gray">Live simulation</span></div><div class="play-feed" id="play-feed"></div></section><section class="panel"><div class="panel-head"><h2>Sideline adjustments</h2>${icon("plan")}</div><div class="panel-body" style="padding-top:0"><div class="stack" style="gap:13px">${[
        ["pace", "Tempo", ["slow", "balanced", "fast"]],
        ["offense", "Offense", ["balanced", "motion", "perimeter", "paint"]],
        ["defense", "Defense", ["man", "zone", "press"]],
      ]
        .map(
          ([key, label, values]) =>
            `<label class="input-label">${label}<select data-change="live-strategy" data-key="${key}">${values.map((v) => `<option value="${v}" ${user().strategy[key] === v ? "selected" : ""}>${{ slow: "Deliberate", balanced: "Balanced", fast: "Fast break", motion: "Motion", perimeter: "Perimeter", paint: "Attack paint", man: "Man to man", zone: "Zone", press: "Full court press" }[v]}</option>`).join("")}</select></label>`,
        )
        .join(
          "",
        )}</div><p class="muted tiny" style="margin-top:15px">Changes take effect on the next possession. You can also adjust minutes in the Roster screen.</p></div></section></div><section class="panel" style="margin-top:20px"><div class="panel-head"><h2>Live box score</h2></div><div id="live-box"></div></section>`
    );
  }
  function clock(l) {
    return `${Math.floor(l.clock / 60)}:${String(l.clock % 60).padStart(2, "0")}`;
  }
  function updateLive() {
    if (!S?.live || route !== "game") return;
    const l = S.live;
    $("#live-as").textContent = l.as;
    $("#live-hs").textContent = l.hs;
    $("#live-clock").textContent = l.done ? "FINAL" : clock(l);
    $("#live-period").textContent = l.done
      ? "Game over"
      : l.period > 4
        ? "OVERTIME " + (l.period - 4)
        : "QUARTER " + l.period;
    const e = l.events[l.events.length - 1];
    if (e) {
      $("#possession-text").textContent = e.text;
      $("#shot-marker").innerHTML = e.shot
        ? `<i class="shot-dot ${e.made ? "" : "miss"}" style="left:${e.x}%;top:${e.y}%"></i>`
        : "";
    }
    $("#play-feed").innerHTML =
      l.events
        .slice(-35)
        .reverse()
        .map(
          (e) =>
            `<div class="play-line ${e.points ? "scored" : ""}"><time>${e.period > 4 ? "OT" : "Q" + e.period} ${Math.floor(e.clock / 60)}:${String(e.clock % 60).padStart(2, "0")}</time><span>${e.points ? "<strong>+" + e.points + "</strong> " : ""}${esc(e.text)}</span></div>`,
        )
        .join("") || '<div class="empty small">The opening tip is next.</div>';
    $("#live-box").innerHTML = boxTable(l);
    const toggle = $("#live-toggle");
    toggle.innerHTML =
      icon(timer ? "pause" : "play") + (timer ? "Pause" : "Watch live");
    for (const a of [
      "live-toggle",
      "live-step",
      "live-quarter",
      "live-finish",
    ]) {
      const el = $(`[data-a="${a}"]`);
      if (el) el.disabled = l.done;
    }
    if (l.done) {
      stopLive();
      $("#live-result-actions").innerHTML =
        `<div class="notice success flex between wrap" style="margin-top:17px;margin-bottom:0"><strong>${esc(H.team(S, l.hs > l.as ? l.home : l.away).city)} win ${Math.max(l.hs, l.as)}–${Math.min(l.hs, l.as)}.</strong>${button("Continue to franchise " + icon("arrow"), "commit-game", "", "primary")}</div>`;
      save();
    }
  }
  function boxTable(l) {
    return `<div class="table-wrap"><table><thead><tr><th>Player</th><th>Team</th><th class="num">MIN</th><th class="num">PTS</th><th class="num">REB</th><th class="num">AST</th><th class="num">STL</th><th class="num">BLK</th><th class="num">TO</th><th class="num">FG</th><th class="num">3PT</th><th class="num">FT</th></tr></thead><tbody>${Object.values(
      l.box,
    )
      .filter((b) => b.min > 0.01)
      .sort((a, b) => a.teamId.localeCompare(b.teamId) || b.pts - a.pts)
      .map((b) => {
        const p = S.players.find((p) => p.id === b.id);
        return `<tr><td class="click-row" data-a="player" data-id="${b.id}"><strong>${esc(p?.name || "Retired player")}</strong></td><td class="muted">${b.teamId}</td><td class="num muted">${b.min.toFixed(0)}</td><td class="num positive">${b.pts}</td>${["reb", "ast", "stl", "blk", "tov"].map((k) => `<td class="num">${b[k]}</td>`).join("")}<td class="num">${b.fgm}–${b.fga}</td><td class="num">${b.tpm}–${b.tpa}</td><td class="num">${b.ftm}–${b.fta}</td></tr>`;
      })
      .join("")}</tbody></table></div>`;
  }
  function stopLive() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function tick() {
    if (!S?.live || S.live.done) {
      stopLive();
      return;
    }
    H.stepLive(S, S.live);
    updateLive();
    if (S.live.events.length % 25 === 0) save();
  }
  function playerModal(id) {
    const p = S.players.find((p) => p.id === id);
    if (!p) return;
    const team = H.team(S, p.teamId),
      attrs = Object.entries(p.skills);
    showModal(
      "Player report",
      `<div class="profile-head"><span class="player-avatar">${esc(initials(p.name))}</span><div><div class="eyebrow">${p.pos} · ${esc(p.archetype)}</div><h1 style="margin:9px 0">${esc(p.name)}</h1><p class="muted small">${p.age} years · ${Math.floor(p.height / 12)}′${p.height % 12}″ · ${esc(p.college)}<br>${team ? esc(team.city) + " " + esc(team.name) : p.retired ? "Retired" : "Free agent"}${p.draftPick ? " · " + p.draftYear + " pick #" + p.draftPick : ""}</p></div><div style="margin-left:auto;text-align:center">${rate(p.ovr)}<div class="muted tiny" style="margin-top:7px">OVERALL</div></div></div>${p.injury ? `<div class="notice">Out ${p.injury} games · ${esc(p.injuryName)}</div>` : ""}<div class="grid2"><div>${attrs.map(([k, n]) => `<div class="attribute"><span>${k[0].toUpperCase() + k.slice(1)}</span><div class="progress"><i style="width:${n}%"></i></div><strong>${n}</strong></div>`).join("")}</div><div class="panel panel-body"><div class="quick-action"><span class="muted">Potential</span><strong class="positive">${p.potential}</strong></div><div class="quick-action"><span class="muted">Morale</span><strong>${Math.round(p.morale)} / 100</strong></div><div class="quick-action"><span class="muted">Condition</span><strong>${Math.round(p.energy)}%</strong></div><div class="quick-action"><span class="muted">Contract</span><strong>${money(p.salary)} · ${p.years} yrs</strong></div>${p.teamId === S.userId ? `<label class="input-label" style="margin-top:15px">Scoring priority (relative to teammates)<input type="range" min="5" max="60" value="${p.usage}" data-change="usage" data-id="${p.id}"></label>` : ""}</div></div><div class="profile-metrics">${[
        ["pts", "POINTS"],
        ["reb", "REBOUNDS"],
        ["ast", "ASSISTS"],
        ["min", "MINUTES"],
      ]
        .map(
          ([k, l]) =>
            `<div><strong>${avg(p, k)}</strong><span>${l} / GAME</span></div>`,
        )
        .join(
          "",
        )}</div>${p.history.length ? `<div class="table-wrap"><table><thead><tr><th>Year</th><th>Team</th><th>GP</th><th>PPG</th><th>RPG</th><th>APG</th></tr></thead><tbody>${p.history.map((h) => `<tr><td>${h.year}</td><td>${h.teamId || "FA"}</td><td>${h.gp}</td><td>${h.pts.toFixed(1)}</td><td>${h.reb.toFixed(1)}</td><td>${h.ast.toFixed(1)}</td></tr>`).join("")}</tbody></table></div>` : ""}<div class="modal-actions">${!p.teamId && !p.retired ? button("Negotiate contract", "offer", `data-id="${p.id}"`, "primary") : ""}${p.teamId === S.userId ? button("Release player", "release-confirm", `data-id="${p.id}"`, "danger") : ""}${button("Close report", "close", "", "ghost")}</div>`,
    );
  }
  function prospectModal(id) {
    const p = S.prospects.find((p) => p.id === id);
    if (!p) return;
    const complete = p.scouted === 3;
    showModal(
      "Scouting report",
      `<div class="eyebrow">${esc(p.college)} · ${p.pos} · ${p.age} years</div><h1 style="margin:10px 0">${esc(p.name)}</h1><p class="muted small">${Math.floor(p.height / 12)}′${p.height % 12}″ · ${["Unscouted", "Initial report", "Detailed report", "Complete evaluation"][p.scouted]}</p><div class="profile-metrics"><div><strong>${p.estimate}${complete ? "" : " ±" + [10, 6, 3][p.scouted]}</strong><span>PROJECTED OVERALL</span></div><div><strong class="positive">${p.potEstimate}</strong><span>PROJECTED POTENTIAL</span></div></div><p class="muted small">${complete ? `Confirmed archetype: ${esc(p.archetype)}. ` : ""}Scouting reduces uncertainty. Potential is a ceiling; development depends on age, coaching and opportunity.</p>${
        complete
          ? Object.entries(p.skills)
              .map(
                ([k, v]) =>
                  `<div class="attribute"><span>${k}</span><div class="progress"><i style="width:${v}%"></i></div><b>${v}</b></div>`,
              )
              .join("")
          : ""
      }<div class="modal-actions">${button(complete ? "Report complete" : "Scout · 15 points", "scout-modal", `data-id="${p.id}" ${complete || S.scoutPoints < 15 ? "disabled" : ""}`, "primary")}${S.phase === "draft" && S.draft.order[S.draft.index].owner === S.userId ? button("Draft player", "draft-player", `data-id="${p.id}"`, "primary") : ""}${button("Close", "close", "", "ghost")}</div>`,
    );
  }
  function offerModal(id) {
    const p = S.players.find((p) => p.id === id);
    if (!p) return;
    const bird = S.phase === "resign" && p.prevTeamId === S.userId;
    showModal(
      "Contract negotiation",
      `<div class="eyebrow">${p.pos} · ${p.ovr} overall · Age ${p.age}</div><h1 style="margin:10px 0">${esc(p.name)}</h1><p class="muted small">Asking salary: <strong>${money(H.demand(p))}</strong> per season. ${bird ? "You can use returning-player rights to exceed the cap." : "Cap room: " + money(S.cap - H.payroll(S, S.userId)) + ". A minimum $0.8M deal can exceed the cap."}</p><div class="grid2" style="margin-top:24px"><label class="input-label">Contract length<select id="offer-years">${[1, 2, 3, 4].map((n) => `<option value="${n}" ${n === 2 ? "selected" : ""}>${n} year${n > 1 ? "s" : ""}</option>`).join("")}</select></label><label class="input-label">Annual salary ($ millions)<input type="number" id="offer-salary" min="0.8" max="100" step="0.1" value="${H.demand(p)}"></label></div><div class="form-error" id="offer-error" role="alert"></div><div class="modal-actions">${button("Make offer " + icon("arrow"), "sign", `data-id="${p.id}" data-bird="${bird}"`, "primary")}${button("Cancel", "close", "", "ghost")}</div>`,
    );
  }
  function teamModal(id) {
    const t = H.team(S, id);
    if (!t) return;
    showModal(
      "Team scouting",
      `<div class="flex" style="margin-bottom:22px">${crest(t.id, "large")}<div><div class="eyebrow">${t.conf} · ${t.division}</div><h1 style="margin:8px 0">${esc(t.city)} ${esc(t.name)}</h1><p class="muted small">${t.w}–${t.l} · ${H.strength(S, t.id)} OVR · ${money(H.payroll(S, t.id))} payroll</p></div></div><p class="muted small" style="margin-bottom:16px">Coach ${esc(t.coach.name)} · ${esc(t.strategy.pace)} pace · ${esc(t.strategy.offense)} offense · ${esc(t.strategy.defense)} defense</p><div class="table-wrap"><table><thead><tr><th>Player</th><th>Pos</th><th>OVR</th><th>Age</th><th>PPG</th><th>Salary</th></tr></thead><tbody>${H.roster(
        S,
        id,
      )
        .slice()
        .sort((a, b) => b.ovr - a.ovr)
        .map(
          (p) =>
            `<tr class="click-row" data-a="player" data-id="${p.id}"><td>${esc(p.name)}${p.injury ? " †" : ""}</td><td>${p.pos}</td><td>${rate(p.ovr)}</td><td>${p.age}</td><td>${avg(p, "pts")}</td><td>${money(p.salary)}</td></tr>`,
        )
        .join(
          "",
        )}</tbody></table></div><div class="modal-actions">${id !== S.userId ? button("Open trade talks", "trade-with", `data-id="${id}"`, "primary") : ""}${button("Close", "close", "", "ghost")}</div>`,
    );
  }
  function boxModal(id) {
    const l = S.boxes[id];
    if (!l) {
      toast(
        "Detailed box score is available for games involving your team.",
        true,
      );
      return;
    }
    showModal(
      "Final box score",
      `<div class="flex between" style="margin-bottom:22px"><div class="flex">${crest(l.away)}<strong>${esc(H.team(S, l.away).city)} ${l.as}</strong></div><span class="muted">FINAL</span><div class="flex"><strong>${esc(H.team(S, l.home).city)} ${l.hs}</strong>${crest(l.home)}</div></div>${boxTable(l)}`,
    );
  }
  function help() {
    showModal(
      "Your franchise playbook",
      `<div class="help-grid"><div><h3>Build the basketball operation</h3><p>Start in Roster. Give at least five players minutes, then normalize to 240. Click a player to change scoring priority. Use Game plan to set tempo, shot selection, defense and weekly training.</p></div><div><h3>Run the season</h3><p>Coach a game possession by possession, watch automatically, simulate a quarter, or finish instantly. The simulation menu advances one game, seven games, to the deadline, or through the regular season.</p></div><div><h3>Make roster moves</h3><p>Sign free agents with cap room or a $0.8M minimum exception. Trade players and picks. Over-cap matching allows 125% of outgoing salary plus $0.5M. Trades and roster moves lock after game 60 until the offseason.</p></div><div><h3>Win in the offseason</h3><p>After four best-of-seven playoff rounds: review awards, re-sign expiring players, enter the lottery, make two rounds of draft picks, then sign free agents. Trim to 8–15 players before the next season.</p></div><div><h3>Find your next star</h3><p>You start with 100 scouting points and earn more every game. Each 15-point visit narrows estimates. Three visits reveal exact overall and potential. The first four picks are drawn in a weighted lottery among the 14 non-playoff teams.</p></div><div><h3>Manage ownership</h3><p>Each season opens with $22M broadcast revenue. Home games generate ticket income. Salaries and operating costs accrue per game. Arena upgrades add capacity; development improves growth; medicine reduces injury risk.</p></div><div><h3>Keep your career</h3><p>Three browser save slots autosave after decisions. Use Career → Export save for a portable JSON backup. Import on another device or browser. Private browsing and clearing site data can remove local saves.</p></div><div><h3>What shapes results</h3><p>Skills, scoring priority, minutes, morale, condition, coaching and strategy drive individual possessions. Younger players grow toward potential; older players decline and retire. Standard difficulty sets normal trade and salary demands; Ruthless raises both.</p></div></div><hr><p class="muted small">This is a management simulation with a live game viewer. Teams, players, ratings and finances belong to an original fictional league. The league uses 82 round-robin-based games, 41 home and 41 away, and simplified cap and lottery rules.</p>`,
    );
  }
  function menu() {
    showModal(
      "Career menu",
      `<div class="flex" style="margin-bottom:22px">${crest(S.userId, "medium")}<div><h2>${esc(S.manager)} · ${esc(user().city)}</h2><p class="muted small">Slot ${slot} · ${S.year} · ${phaseName()}</p></div></div><div class="stack">${button(icon("download") + " Export save (.json)", "export", "", "primary full")}${button(icon("save") + " Save career now", "save", "", "ghost full")}${button(icon("download") + " Import a career", "import", "", "ghost full")}${button(icon("help") + " Playbook & help", "help", "", "ghost full")}${button("Return to career selection", "title", "", "ghost full")}</div><p class="muted small" style="margin-top:22px">Autosave stays in this browser. Export a backup before clearing browser data or moving devices.</p>`,
    );
  }
  function simOptions() {
    if (S.live) {
      toast("Finish your active game before simulating other games.", true);
      return;
    }
    showModal(
      "Advance the season",
      `<p class="muted small" style="margin-bottom:20px">Your rotation and game plan stay active while the league simulates.</p><div class="stack">${S.phase === "regular" ? `${button("Simulate next game", "simulate", 'data-count="1"', "primary full")}${button("Simulate seven games", "simulate", 'data-count="7"', "ghost full")}${S.day < 59 ? button("Simulate to trade deadline (before game 60)", "simulate", `data-count="${59 - S.day}"`, "ghost full") : ""}${button("Simulate remaining regular season", "simulate", `data-count="${82 - S.day}"`, "ghost full")}` : `${button("Simulate next playoff date", "simulate", 'data-count="1"', "primary full")}${button("Simulate this playoff round", "simulate", 'data-count="round"', "ghost full")}${button("Simulate through the Finals", "simulate", 'data-count="playoffs"', "ghost full")}`}</div>`,
    );
  }
  async function simulate(count) {
    if (busy || S.live) return;
    closeModal();
    busy = true;
    stopLive();
    const phase = S.phase,
      round = S.playoffs?.round;
    let n = 0,
      max = count === "playoffs" ? 40 : count === "round" ? 7 : Number(count);
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `<div><div class="loader-ring"></div><h2>The league is in motion.</h2><p id="sim-progress">Simulating games…</p></div>`;
    document.body.append(overlay);
    try {
      while (
        n < max &&
        S.phase === phase &&
        (count !== "round" || S.playoffs.round === round)
      ) {
        if (phase === "regular") H.simulateDay(S);
        else H.nextPlayoff(S);
        n++;
        $("#sim-progress").textContent =
          `${phase === "regular" ? "Game day" : "Playoff date"} ${n}${Number.isFinite(max) && max < 40 ? " of " + max : ""} complete`;
        if (n % 3 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      save();
      render();
      toast(
        S.phase !== phase
          ? `Welcome to ${phaseName().toLowerCase()}.`
          : `${n} ${n === 1 ? "game day" : "game days"} simulated.`,
      );
    } catch (e) {
      toast(
        "Simulation stopped. Your last autosave is preserved. " + e.message,
        true,
      );
    } finally {
      busy = false;
      overlay.remove();
    }
  }
  function exportSave() {
    save();
    if (window.webkit?.messageHandlers?.hardcourt) {
      window.webkit.messageHandlers.hardcourt.postMessage({
        type: "export",
        filename: `Hardcourt-${S.userId}-${S.year}-Career.json`,
        content: JSON.stringify(S, null, 2),
      });
      return;
    }
    const blob = new Blob([JSON.stringify(S, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `Hardcourt-${S.userId}-${S.year}-Career.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast("Career exported. Keep this file as your backup.");
  }
  function welcome() {
    showModal(
      "Welcome to the front office",
      `<div class="flex" style="margin-bottom:25px">${crest(S.userId, "large")}<div><div class="eyebrow">The keys are yours</div><h1 style="margin-top:9px">${esc(user().city)} ${esc(user().name)}</h1><p class="muted small">Ownership expects ${user().goal} wins. Your first season starts now.</p></div></div><div style="counter-reset:steps"><div class="intro-step"><div><h3>Meet your roster</h3><p>Review skills and contracts, set minutes, and choose the players who get the shots.</p></div></div><div class="intro-step"><div><h3>Build your identity</h3><p>Set your game plan, work the market, scout prospects and invest in your organization.</p></div></div><div class="intro-step"><div><h3>Take it to the court</h3><p>Coach live or simulate ahead. Run all 82 games, chase a title, then rebuild in the offseason.</p></div></div></div><div class="notice" style="margin-top:22px">The game autosaves to career slot ${slot}. Export a backup from the Career menu whenever you want.</div><div class="modal-actions">${button("Let’s get to work " + icon("arrow"), "close", "", "primary")}</div>`,
    );
  }
  const handlers = {
    close: () => closeModal(),
    nav: (d) => {
      if (route === "game") stopLive();
      route = d.route;
      search = "";
      render();
      window.scrollTo(0, 0);
    },
    "select-team": (d) => {
      selectedTeam = d.id;
      document.querySelectorAll(".team-select").forEach((el) => {
        const active = el.dataset.id === d.id;
        el.classList.toggle("selected", active);
        el.setAttribute("aria-pressed", active);
      });
    },
    create: () => {
      const target = Number($("#new-slot").value);
      if (
        storageGet("hardcourt.slot." + target) &&
        !confirm(
          `Replace the existing career in slot ${target}? Export it first if you want to keep it.`,
        )
      )
        return;
      slot = target;
      const manager = $("#manager").value.trim() || "General Manager";
      try {
        localStorage.setItem("hardcourt.manager", manager);
      } catch {}
      S = H.createCareer({
        teamId: selectedTeam,
        manager,
        difficulty: $("#difficulty").value,
      });
      route = "overview";
      leagueConf = user().conf;
      tradeTeam = S.userId === "BOS" ? "NYE" : "BOS";
      save();
      render();
      window.scrollTo(0, 0);
      welcome();
    },
    load: (d) => {
      try {
        const s = JSON.parse(storageGet("hardcourt.slot." + d.slot));
        if (!H.validateSave(s)) throw Error("Invalid career");
        S = s;
        slot = Number(d.slot);
        route = S.live ? "game" : "overview";
        leagueConf = user().conf;
        tradeTeam = S.userId === "BOS" ? "NYE" : "BOS";
        render();
        toast("Career loaded.");
      } catch {
        toast(
          "This career could not be loaded. Import an exported backup.",
          true,
        );
      }
    },
    player: (d) => playerModal(d.id),
    prospect: (d) => prospectModal(d.id),
    team: (d) => teamModal(d.id),
    box: (d) => boxModal(d.id),
    "auto-rotation": () => {
      H.autoRotation(S, S.userId);
      save();
      render();
      toast("Rotation set: five starters, five reserves.");
    },
    normalize: () => {
      if (result(H.normalizeRotation(S), "Rotation normalized to 240 minutes."))
        render();
    },
    strategy: (d) => {
      user().strategy[d.key] = d.value;
      save();
      render();
    },
    "schedule-tab": (d) => {
      scheduleFilter = d.value;
      render();
    },
    "league-tab": (d) => {
      leagueTab = d.value;
      render();
    },
    "market-tab": (d) => {
      marketTab = d.value;
      search = "";
      render();
    },
    offer: (d) => offerModal(d.id),
    sign: (d) => {
      const fn = d.bird === "true" ? H.resign : H.sign;
      const r = fn(
        S,
        d.id,
        Number($("#offer-years").value),
        Number($("#offer-salary").value),
      );
      if (r.error) {
        $("#offer-error").textContent = r.error;
        return;
      }
      save();
      closeModal();
      render();
      toast("Contract signed. Welcome to the team.");
    },
    "release-confirm": (d) => {
      const p = S.players.find((p) => p.id === d.id);
      showModal(
        "Release " + esc(p.name) + "?",
        `<p>Waiving this player costs <strong>${money(p.salary * p.years * 0.5)}</strong> in cash and adds <strong>${money(p.salary * 0.4)}</strong> to this season’s cap charge. The player becomes a free agent.</p><div class="modal-actions">${button("Release player", "release", `data-id="${p.id}"`, "danger")}${button("Keep player", "close", "", "ghost")}</div>`,
      );
    },
    release: (d) => {
      if (result(H.release(S, d.id), "Player released.")) {
        closeModal();
        render();
      }
    },
    "execute-trade": () => {
      if (
        result(
          H.trade(S, tradeTeam, send, get, sendPicks, getPicks),
          "Trade completed.",
        )
      ) {
        send = [];
        get = [];
        sendPicks = [];
        getPicks = [];
        render();
      }
    },
    "trade-with": (d) => {
      closeModal();
      tradeTeam = d.id;
      send = [];
      get = [];
      sendPicks = [];
      getPicks = [];
      marketTab = "trades";
      route = "market";
      render();
    },
    scout: (d) => {
      if (result(H.scout(S, d.id), "Scouting report updated.")) render();
    },
    "scout-modal": (d) => {
      if (result(H.scout(S, d.id))) {
        render();
        prospectModal(d.id);
      }
    },
    "draft-player": (d) => {
      const cp = S.draft?.order[S.draft.index];
      if (cp?.owner !== S.userId) return;
      if (result(H.draftPlayer(S, d.id), "Selection is in.")) {
        closeModal();
        render();
      }
    },
    "sim-draft": () => {
      H.simToPick(S);
      save();
      render();
      toast(
        S.phase === "draft"
          ? "Your franchise is on the clock."
          : "The draft is complete. Free agency is open.",
      );
    },
    "auto-draft-all": () => {
      showModal(
        "Delegate the rest of the draft?",
        `<p class="muted">Your assistant will select the best combination of ability, upside and positional need with your remaining picks.</p><div class="modal-actions">${button("Auto-draft remaining picks", "confirm-auto-draft", "", "primary")}${button("Keep control", "close", "", "ghost")}</div>`,
      );
    },
    "confirm-auto-draft": () => {
      while (S.phase === "draft") H.autoDraftPick(S);
      save();
      closeModal();
      render();
      toast("The draft is complete. Free agency is open.");
    },
    "begin-draft": () => {
      showModal(
        "Enter the draft lottery?",
        `<p class="muted">Finish re-signing any returning players first. Once the lottery starts, unsigned players lose their returning-player cap exception and enter free agency.</p><div class="modal-actions">${button("Enter lottery & draft", "confirm-draft", "", "primary")}${button("Review my contracts", "review-contracts", "", "ghost")}</div>`,
      );
    },
    "review-contracts": () => {
      closeModal();
      route = "market";
      render();
    },
    "confirm-draft": () => {
      if (result(H.startDraft(S))) {
        closeModal();
        route = "scouting";
        search = "";
        render();
        toast("The lottery is complete. The draft is open.");
      }
    },
    "new-season": () => {
      if (result(H.newSeason(S), "A new season begins.")) {
        route = "overview";
        save();
        render();
      }
    },
    upgrade: (d) => {
      if (result(H.upgrade(S, d.key), "Investment complete.")) render();
    },
    "coach-confirm": (d) =>
      showModal(
        "Hire a new head coach?",
        `<p class="muted">A ${esc(d.type)} specialist costs $4M to hire and earns $3.5M per season. Your current coach is replaced immediately.</p><div class="modal-actions">${button("Hire specialist", "coach", `data-type="${d.type}"`, "primary")}${button("Keep current coach", "close", "", "ghost")}</div>`,
      ),
    coach: (d) => {
      if (result(H.hireCoach(S, d.type), "New head coach hired.")) {
        closeModal();
        render();
      }
    },
    watch: () => {
      if (S.live) {
        route = "game";
        render();
        return;
      }
      if (result(H.startUserGame(S))) {
        route = "game";
        render();
      }
    },
    "live-toggle": () => {
      if (timer) stopLive();
      else timer = setInterval(tick, speed);
      updateLive();
    },
    "live-step": () => {
      stopLive();
      tick();
    },
    "live-quarter": () => {
      stopLive();
      const period = S.live.period;
      let guard = 0;
      while (!S.live.done && S.live.period === period && guard++ < 300)
        H.stepLive(S, S.live);
      save();
      updateLive();
    },
    "live-finish": () => {
      stopLive();
      H.finishLive(S, S.live);
      save();
      updateLive();
    },
    "commit-game": () => {
      if (result(H.commitUserGame(S), "Result recorded.")) {
        route = "overview";
        render();
      }
    },
    "advance-playoff": () => simulate(1),
    "sim-options": () => simOptions(),
    simulate: (d) => simulate(d.count),
    help: () => help(),
    menu: () => menu(),
    save: () => {
      save();
      toast(saveFailed ? "Export your career to keep it." : "Career saved.");
    },
    export: () => exportSave(),
    import: () => $("#import-file").click(),
    title: () => {
      save();
      stopLive();
      closeModal();
      S = null;
      landing();
      window.scrollTo(0, 0);
    },
  };
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-a]");
    if (!el || el.disabled || busy) return;
    const fn = handlers[el.dataset.a];
    if (fn) fn(el.dataset);
  });
  document.addEventListener("change", (e) => {
    const el = e.target,
      d = el.dataset;
    if (!d.change || !S) return;
    switch (d.change) {
      case "roster-pos":
        rosterPos = el.value;
        render();
        break;
      case "roster-sort":
        rosterSort = el.value;
        render();
        break;
      case "minutes":
        H.setMinutes(S, d.id, el.value);
        save();
        render();
        break;
      case "conference":
        leagueConf = el.value;
        render();
        break;
      case "leader-stat":
        leaderStat = el.value;
        render();
        break;
      case "trade-team":
        tradeTeam = el.value;
        send = [];
        get = [];
        sendPicks = [];
        getPicks = [];
        render();
        break;
      case "trade-asset":
      case "trade-pick": {
        const list =
          d.change === "trade-pick"
            ? d.side === "send"
              ? sendPicks
              : getPicks
            : d.side === "send"
              ? send
              : get;
        if (el.checked) list.push(d.id);
        else list.splice(list.indexOf(d.id), 1);
        $("#trade-evaluation").innerHTML = tradeEvaluation(
          H.evaluateTrade(S, tradeTeam, send, get, sendPicks, getPicks),
        );
        break;
      }
      case "scout-sort":
        scoutSort = el.value;
        render();
        break;
      case "ticket":
        user().ticket = Number(el.value);
        save();
        render();
        break;
      case "marketing":
        user().marketing = Number(el.value);
        save();
        render();
        break;
      case "usage": {
        const p = S.players.find((p) => p.id === d.id);
        if (p) p.usage = Number(el.value);
        save();
        break;
      }
      case "live-speed":
        speed = Number(el.value);
        if (timer) {
          stopLive();
          timer = setInterval(tick, speed);
        }
        break;
      case "live-strategy":
        user().strategy[d.key] = el.value;
        save();
        toast("Sideline adjustment applied.");
        break;
    }
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.input === "search") {
      const start = el.selectionStart;
      search = el.value;
      render();
      const input = $('[data-input="search"]');
      input.focus();
      input.setSelectionRange(start, start);
    }
    if (el.dataset.change === "ticket")
      $("#ticket-value").textContent = el.value;
  });
  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.size > 15000000) throw Error("Save file is too large.");
      const data = JSON.parse(await file.text());
      if (!H.validateSave(data))
        throw Error("This is not a compatible Hardcourt save.");
      const target = S ? slot : Number(storageGet("hardcourt.active")) || 1;
      if (
        storageGet("hardcourt.slot." + target) &&
        !confirm(
          `Import this career into slot ${target}? The career currently in that slot will be replaced.`,
        )
      )
        return;
      stopLive();
      S = data;
      slot = target;
      route = S.live ? "game" : "overview";
      leagueConf = user().conf;
      tradeTeam = S.userId === "BOS" ? "NYE" : "BOS";
      save();
      closeModal();
      render();
      toast("Career imported. Welcome back.");
    } catch (err) {
      toast(err.message || "Could not read this save file.", true);
    }
  });
  window.addEventListener("beforeunload", () => save());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLive();
      save();
    }
  });
  $("#modal").addEventListener("click", (e) => {
    if (e.target === $("#modal")) {
      const r = $("#modal").getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        closeModal();
    }
  });
  window.HardcourtNative = {
    save: () => {
      if (S) save();
    },
    exportCareer: () => {
      if (S) exportSave();
      else toast("Open a career before exporting.", true);
    },
    importCareer: () => $("#import-file").click(),
    title: () => {
      if (S) handlers.title();
    },
    help: () => {
      if (S) help();
    },
    exportResult: (status) =>
      toast(
        status === "saved"
          ? "Career exported. Keep this file as your backup."
          : status === "cancelled"
            ? "Export canceled."
            : "Could not save the file. Try exporting to another folder.",
        status === "error",
      ),
  };
  window.HardcourtDebug = {
    get state() {
      return S;
    },
    get route() {
      return route;
    },
    load(s) {
      S = s;
      route = "overview";
      leagueConf = user().conf;
      save();
      render();
    },
  };
  landing();
})();
