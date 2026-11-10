import { portraitImage, ownerImage } from './portraits.js';

export const SAVE_KEY = 'bscfd-legendary-gm-v1';
export const SAVE_VERSION = 1;

export const TEAMS = [
  { id:'aurora', city:'Aurora', name:'Comets', short:'AUR', primary:'#6c5ce7', secondary:'#45e6e6', ink:'#f7f5ff', offense:82, defense:75, market:68 },
  { id:'baltimore', city:'Baltimore', name:'Harbor', short:'BAL', primary:'#ef476f', secondary:'#ffd166', ink:'#ffffff', offense:77, defense:81, market:72 },
  { id:'boston', city:'Boston', name:'Foundry', short:'BOS', primary:'#1b9e77', secondary:'#d9f99d', ink:'#ffffff', offense:84, defense:84, market:86 },
  { id:'brooklyn', city:'Brooklyn', name:'Pulse', short:'BKN', primary:'#161b2e', secondary:'#5ee7ff', ink:'#ffffff', offense:86, defense:73, market:91 },
  { id:'chicago', city:'Chicago', name:'Stampede', short:'CHI', primary:'#d92038', secondary:'#f7f7f2', ink:'#ffffff', offense:78, defense:79, market:93 },
  { id:'cleveland', city:'Cleveland', name:'Engines', short:'CLE', primary:'#8a1538', secondary:'#ffb81c', ink:'#ffffff', offense:74, defense:77, market:65 },
  { id:'dallas', city:'Dallas', name:'Outlaws', short:'DAL', primary:'#1261a0', secondary:'#b8c4ce', ink:'#ffffff', offense:88, defense:76, market:84 },
  { id:'denver', city:'Denver', name:'Summit', short:'DEN', primary:'#183a6b', secondary:'#ffcf4a', ink:'#ffffff', offense:85, defense:83, market:71 },
  { id:'detroit', city:'Detroit', name:'Voltage', short:'DET', primary:'#0057b8', secondary:'#ff3b30', ink:'#ffffff', offense:72, defense:80, market:70 },
  { id:'golden', city:'Golden State', name:'Tide', short:'GST', primary:'#006bb6', secondary:'#fdb927', ink:'#ffffff', offense:90, defense:82, market:95 },
  { id:'houston', city:'Houston', name:'Meteors', short:'HOU', primary:'#ce1141', secondary:'#c4ced4', ink:'#ffffff', offense:83, defense:78, market:87 },
  { id:'indiana', city:'Indiana', name:'Cruisers', short:'IND', primary:'#002d62', secondary:'#fdbb30', ink:'#ffffff', offense:80, defense:82, market:62 },
  { id:'las-vegas', city:'Las Vegas', name:'Aces High', short:'LVA', primary:'#7b2cbf', secondary:'#ffd60a', ink:'#ffffff', offense:81, defense:72, market:78 },
  { id:'los-angeles', city:'Los Angeles', name:'Stars', short:'LAS', primary:'#552583', secondary:'#fdb927', ink:'#ffffff', offense:87, defense:85, market:99 },
  { id:'memphis', city:'Memphis', name:'Blues', short:'MEM', primary:'#5d76a9', secondary:'#12173f', ink:'#ffffff', offense:75, defense:86, market:58 },
  { id:'miami', city:'Miami', name:'Inferno', short:'MIA', primary:'#98002e', secondary:'#f9a01b', ink:'#ffffff', offense:82, defense:87, market:89 },
  { id:'milwaukee', city:'Milwaukee', name:'Stags', short:'MIL', primary:'#00471b', secondary:'#eee1c6', ink:'#ffffff', offense:84, defense:88, market:64 },
  { id:'minnesota', city:'Minnesota', name:'Timber', short:'MIN', primary:'#0c2340', secondary:'#78be20', ink:'#ffffff', offense:79, defense:81, market:66 },
  { id:'new-orleans', city:'New Orleans', name:'Brass', short:'NOB', primary:'#0a2240', secondary:'#c8102e', ink:'#ffffff', offense:78, defense:76, market:61 },
  { id:'new-york', city:'New York', name:'Empire', short:'NYE', primary:'#006bb6', secondary:'#f58426', ink:'#ffffff', offense:83, defense:80, market:100 },
  { id:'oklahoma', city:'Oklahoma City', name:'Storm', short:'OKC', primary:'#007ac1', secondary:'#ef3b24', ink:'#ffffff', offense:86, defense:89, market:60 },
  { id:'orlando', city:'Orlando', name:'Illusion', short:'ORL', primary:'#0077c0', secondary:'#c4ced4', ink:'#ffffff', offense:76, defense:78, market:67 },
  { id:'philadelphia', city:'Philadelphia', name:'Liberty', short:'PHI', primary:'#006bb6', secondary:'#ed174c', ink:'#ffffff', offense:85, defense:84, market:85 },
  { id:'phoenix', city:'Phoenix', name:'Sol', short:'PHX', primary:'#5f259f', secondary:'#ff6b35', ink:'#ffffff', offense:89, defense:77, market:76 },
  { id:'portland', city:'Portland', name:'Roses', short:'POR', primary:'#e03a3e', secondary:'#bac3c9', ink:'#ffffff', offense:80, defense:75, market:63 },
  { id:'sacramento', city:'Sacramento', name:'Regal', short:'SAC', primary:'#5a2d81', secondary:'#63727a', ink:'#ffffff', offense:82, defense:74, market:62 },
  { id:'san-antonio', city:'San Antonio', name:'Sentries', short:'SAS', primary:'#343a40', secondary:'#c4ced4', ink:'#ffffff', offense:79, defense:88, market:69 },
  { id:'seattle', city:'Seattle', name:'Sound', short:'SEA', primary:'#006241', secondary:'#ffc72c', ink:'#ffffff', offense:81, defense:85, market:82 },
  { id:'toronto', city:'Toronto', name:'North', short:'TOR', primary:'#ce1141', secondary:'#a1a1a4', ink:'#ffffff', offense:83, defense:83, market:88 },
  { id:'utah', city:'Utah', name:'Altitude', short:'UTA', primary:'#00471b', secondary:'#f9a01b', ink:'#ffffff', offense:77, defense:86, market:59 },
];

export const POSITIONS = ['PG','SG','SF','PF','C'];
const FIRST = ['Jalen','Marcus','Theo','Darius','Cameron','Isaiah','Malik','Jordan','Eli','Andre','Noah','Devin','Xavier','Micah','Trey','Julian','Amari','Dominic','Caleb','Miles','Kai','Roman','Zion','Damon','Luca','Owen','Tyler','Evan','Jasper','Nico','Reese','Shawn','Victor','Wesley','Aaron','Brandon','Cole','Derek','Felix','Grant'];
const LAST = ['Bennett','Carter','Brooks','Hayes','Walker','Turner','Reed','Morgan','Price','Bell','Foster','Coleman','Bryant','Griffin','Sanders','Hughes','Ward','Bailey','Rivera','Cooper','Richardson','Howard','Watts','Dixon','Hunt','Murray','Freeman','Wells','Webb','Barnes','Simmons','Patterson','Jenkins','Perry','Powell','Long','Washington','Butler','Russell','Stone'];

export function hashSeed(text) {
  let h = 2166136261 >>> 0;
  for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function rngFrom(seed) {
  let a = typeof seed === 'number' ? seed : hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTeam(id) { return TEAMS.find(t => t.id === id) || TEAMS[0]; }

export function teamOverall(team) { return Math.round((team.offense + team.defense) / 2); }

export function logoSVG(team, className = '') {
  const initials = team.name.replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase();
  return `<svg class="team-logo ${className}" viewBox="0 0 100 112" role="img" aria-label="${team.city} ${team.name} logo">
    <defs><linearGradient id="g-${team.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${team.primary}"/><stop offset="1" stop-color="${team.secondary}"/></linearGradient></defs>
    <path d="M50 3 91 18 85 70Q79 94 50 108 21 94 15 70L9 18Z" fill="#07111f" stroke="${team.secondary}" stroke-width="2"/>
    <path d="M50 11 82 23 77 66Q71 86 50 98 29 86 23 66L18 23Z" fill="url(#g-${team.id})" opacity=".92"/>
    <path d="M27 68 69 26M30 78 78 30" stroke="${team.ink}" stroke-opacity=".16" stroke-width="8"/>
    <circle cx="50" cy="52" r="25" fill="#07111f" fill-opacity=".72" stroke="${team.ink}" stroke-opacity=".55"/>
    <path d="M25 52h50M50 27c-10 12-10 38 0 50M50 27c10 12 10 38 0 50" fill="none" stroke="${team.ink}" stroke-opacity=".28" stroke-width="1.5"/>
    <text x="50" y="60" text-anchor="middle" fill="${team.ink}" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="24" letter-spacing="-1">${initials}</text>
  </svg>`;
}

export function generateRoster(team, seed = 'DYNASTY-2027') {
  const rand = rngFrom(`${seed}|roster|${team.id}`);
  const used = new Set();
  const roster = [];
  for (let i = 0; i < 12; i++) {
    let name = '';
    do { name = `${FIRST[Math.floor(rand()*FIRST.length)]} ${LAST[Math.floor(rand()*LAST.length)]}`; } while (used.has(name));
    used.add(name);
    const starter = i < 5;
    const base = starter ? teamOverall(team) + 4 - i : teamOverall(team) - 7 - Math.floor(i/3);
    const overall = Math.max(61, Math.min(96, base + Math.floor(rand()*7) - 3));
    const age = 20 + Math.floor(rand()*16);
    const pos = POSITIONS[i % 5];
    roster.push({
      id:`${team.id}-${i}`, name, pos, number: i === 0 ? 0 : Math.floor(rand()*55)+1,
      age, overall, potential:Math.min(99, overall + Math.max(0, 27-age) + Math.floor(rand()*7)),
      offense:Math.max(55, Math.min(99, overall + Math.floor(rand()*11)-4)),
      defense:Math.max(52, Math.min(99, overall + Math.floor(rand()*11)-5)),
      height: pos === 'PG' ? `6'${1+Math.floor(rand()*5)}"` : pos === 'SG' ? `6'${4+Math.floor(rand()*4)}"` : pos === 'SF' ? `6'${6+Math.floor(rand()*4)}"` : pos === 'PF' ? `6'${8+Math.floor(rand()*4)}"` : `6'${10+Math.floor(rand()*4)}"`,
      salary: Math.round((Math.max(1.1, (overall-58)**2*0.018)) * 10) / 10,
      years: 1+Math.floor(rand()*4), morale:65+Math.floor(rand()*31), starter,
      skin:['#5b3326','#7a4a32','#9a6242','#bd8560','#d9a37e','#e4b996'][Math.floor(rand()*6)],
      hair:['#111318','#251b17','#3b271d','#15100d'][Math.floor(rand()*4)],
    });
  }
  return roster;
}

export function portraitSVG(player, team) { return portraitImage(player,team); }

export function ownerPortraitSVG(team) { return ownerImage(team); }

export function money(value) { return `${value<0?'−':''}$${Math.abs(value).toFixed(1)}M`; }
