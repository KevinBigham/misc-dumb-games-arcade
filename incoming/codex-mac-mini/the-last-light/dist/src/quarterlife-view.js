import { LIFE_CARDS, LIFE_EVENTS, LIFE_UPGRADES, DAY_LINES } from './sim/quarterlife-data.js';
import { cardEffects, canPlay, comboFor } from './sim/quarterlife.js';
import { QUARTERLIFE_RENT } from './contracts.js';
import { lifeEra, weekRecap, sceneCaption } from './quarterlife-recap.js';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dollars = value => `${value < 0 ? '−' : ''}$${Math.abs(value).toLocaleString('en-US')}`;
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const paths = {
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20.9 13.2A9 9 0 0 1 10.8 3.1 9 9 0 1 0 20.9 13.2Z"/>',
  bowl: '<path d="M3 12h18a9 9 0 0 1-18 0Zm5 9h8M8 3v4m4-5v5m4-4v4"/>',
  laptop: '<rect x="4" y="3" width="16" height="13" rx="2"/><path d="M2 20h20l-2-4H4L2 20Zm6-12 3 2-3 2m5 0h3"/>',
  glass: '<path d="M7 3h10l2 6a7 7 0 0 1-14 0l2-6Zm5 13v6m-4 0h8M6 9h12"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  check: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 7-7"/>',
  shirt: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 5-8 5-8 0Z"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  box: '<path d="m12 2 10 5v11l-10 5-10-5V7l10-5Zm0 10 10-5M12 12 2 7m10 5v11M7 4.5l10 5"/>',
  mug: '<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Zm14 1h2a3 3 0 0 1 0 6h-2M6 2v3m4-3v3m4-3v3"/>',
  cash: '<rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="12" cy="12" r="3"/><path d="M5 12h.01M19 12h.01"/>',
  energy: '<path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z"/>',
  peace: '<path d="M12 21C1 16 2 7 2 7c6 0 10 5 10 5s4-5 10-5c0 0 1 9-10 14Z"/><path d="M12 21V11s-5-4 0-9c5 5 0 9 0 9"/>',
  sound: '<path d="M11 3 6 7H2v10h4l5 4V3Zm4 5a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="M11 3 6 7H2v10h4l5 4V3Zm5 6 6 6m0-6-6 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  refresh: '<path d="M20 7a9 9 0 1 0 1 9M20 2v6h-6"/>',
  cat: '<path d="M4 12V3l6 5h4l6-5v9c4 12-20 12-16 0Z"/><path d="M8 12h.01M16 12h.01m-5 4 1 1 1-1M1 15h4m14 0h4"/>',
};
export function icon(name, cls = '') { return `<svg class="icon ${cls}" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`; }

function room(s) {
  const tidy = s.tidy > 0;
  const isNight = s.stats.energy < 30;
  const resting = LIFE_CARDS[s.previous]?.tag === 'rest';
  const social = LIFE_CARDS[s.previous]?.tag === 'social';
  return `<svg class="apartment" viewBox="0 0 850 380" role="img" aria-label="Your cozy little apartment: terracotta sofa, sleepy cat, plants, coffee, ${tidy ? 'a freshly cleared floor' : 'laundry on the chair'}, and you, figuring it out.">
  <defs>
    <linearGradient id="wall" x2="0" y2="1"><stop stop-color="#ede5cf"/><stop offset="1" stop-color="#e8ddc3"/></linearGradient>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="${isNight ? '#78899d' : '#b8ccbb'}"/><stop offset="1" stop-color="${isNight ? '#b0b4bd' : '#d9dfbf'}"/></linearGradient>
    <pattern id="rug" width="15" height="15" patternUnits="userSpaceOnUse"><rect width="15" height="15" fill="#d7bc95"/><path d="M0 7h15M7 0v15" stroke="#c8ab82" stroke-width=".8"/></pattern>
  </defs>
  <rect width="850" height="380" fill="url(#wall)"/>
  <path d="M0 277h850v103H0Z" fill="#d2b591"/><path d="M0 277h850" stroke="#b99874" stroke-width="5"/>
  <g stroke="#bc9d7b" stroke-width="1" opacity=".5"><path d="M0 312h850M0 351h850M100 277l-50 103m170-103-24 103m145-103v103m128-103 24 103m130-103 50 103m90-103 70 103"/></g>
  <path d="m270 293 339-2 94 70-480 2Z" fill="url(#rug)"/><path d="m274 302 329-2 64 48-406 1Z" fill="none" stroke="#f5e9cf" stroke-width="3"/>
  <g transform="translate(85,47)">
    <rect x="-8" y="-8" width="199" height="181" rx="3" fill="#ad9677"/>
    <rect width="183" height="165" fill="url(#sky)"/>
    <circle cx="133" cy="40" r="23" fill="#f8e8ac"/>
    <path d="M0 112h24V76h40v28h31V86h28v30h27V67h33v98H0Z" fill="#8da193"/>
    <path d="M0 138h33v-24h40v20h29v-17h41v18h40v30H0Z" fill="#738f81"/>
    <g stroke="#d4d6ba" stroke-width="4"><path d="M35 89v11m17-11v11m55 0v12m54-29v11m12-11v11"/></g>
    <path d="M91 0v165M0 80h183" stroke="#f2ecd9" stroke-width="8"/>
    <rect width="183" height="165" fill="none" stroke="#f4eedc" stroke-width="8"/>
    <path d="M-17 176h221" stroke="#b89973" stroke-width="10" stroke-linecap="round"/>
    <path d="M-24-10h228" stroke="#806d51" stroke-width="4" stroke-linecap="round"/>
    <path d="M-19-5h37L9 168h-35Z" fill="#e7c57c"/><path d="m-8-2-8 163m25-163-9 163" stroke="#d4b371" stroke-width="2"/>
  </g>
  <g transform="translate(381,63) rotate(-3)"><rect width="85" height="104" rx="2" fill="#91765b"/><rect x="5" y="5" width="75" height="94" fill="#f4ead2"/><path d="M22 52c1-28 42-28 42 0" fill="#d48058"/><path d="M27 52c1-21 32-21 32 0" fill="#f0d49c"/><path d="M32 52c1-14 22-14 22 0" fill="#a5b7a0"/><text x="42" y="75" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#53644e">it's fine.</text><text x="42" y="88" text-anchor="middle" font-family="sans-serif" font-size="5.5" letter-spacing="1" fill="#53644e">EVERYTHING IS FINE.</text></g>
  <g transform="translate(544,62)"><path d="M-5 56h150" stroke="#b28c62" stroke-width="9" stroke-linecap="round"/><rect x="4" y="19" width="12" height="34" rx="1" fill="#758f7f"/><rect x="18" y="10" width="9" height="43" rx="1" fill="#b87456"/><rect x="29" y="22" width="13" height="31" rx="1" fill="#d7b96d"/><rect x="46" y="8" width="9" height="45" rx="1" transform="rotate(-10 46 53)" fill="#a59ab3"/><path d="M93 32h31l-4 24H97Z" fill="#b46e51"/><path d="M107 33V2m0 13c-22 1-22-16-22-16 20-4 22 16 22 16m0 5c22 1 23-16 23-16-20-5-23 16-23 16" fill="#6d8962" stroke="#6d8962" stroke-width="2"/><path d="M123 32q27-8 22 22t18 22" stroke="#759364" stroke-width="5" fill="none"/><ellipse cx="149" cy="54" rx="5" ry="10" fill="#759364" transform="rotate(30 149 54)"/></g>
  <g transform="translate(296,190)">
    <path d="M11 86v28m260-28v28" stroke="#79684f" stroke-width="10"/>
    <rect x="9" y="-17" width="270" height="103" rx="24" fill="#bb7257" stroke="#a7654e" stroke-width="2"/>
    <rect x="21" y="-9" width="119" height="75" rx="18" fill="#ca8162"/><rect x="145" y="-9" width="121" height="75" rx="18" fill="#cc8463"/>
    <rect x="6" y="57" width="277" height="35" rx="13" fill="#d58c68"/>
    <rect x="-10" y="21" width="37" height="78" rx="14" fill="#c47b5d"/><rect x="264" y="21" width="37" height="78" rx="14" fill="#c47b5d"/>
    <path d="M140 61v29" stroke="#b97456" stroke-width="2"/>
    <rect x="31" y="9" width="53" height="48" rx="11" fill="#d7c895" transform="rotate(-12 31 9)"/><path d="m39 17 33 25m-35-7 33 25" stroke="#eaddb4" stroke-width="3"/>
    <path d="m218 23 37 5-3 70-51 2 7-40Z" fill="#879c83"/><path d="M216 31v64m12-62v62m12-60v60" stroke="#b4bda0" stroke-width="3"/>
  </g>
  <g class="person" transform="translate(441,175)">
    <path d="m-14 59-15 33 23 27 10-7-10-24 18-17m6-8 28 20-14 31-12-6 12-21-23-11" fill="#647c7b" stroke="#526a69" stroke-width="2"/>
    <path d="m-7 110 13 0 3 10-22 4c-9-4-5-9 6-14m35-3 11 6 1 10-21-2c-5-5-1-9 9-14" fill="#e7deca"/>
    <path d="M-17 20q18-10 35 0l8 45q-23 9-51-1Z" fill="#efc46d"/>
    <path d="m-16 26-17 29 23 9m26-36 20 26-24 10" fill="none" stroke="#efc46d" stroke-width="13" stroke-linecap="round"/>
    <rect x="-5" y="7" width="12" height="15" rx="5" fill="#be8662"/>
    <ellipse cx="0" cy="-2" rx="19" ry="23" fill="#cc9873"/>
    <path d="M-19-3c-14-29 40-38 39-3L12-15Q0-10-14-15l-3 18Z" fill="#53463b"/>
    <path d="${resting ? 'M-10-3q4 5 7 0m5 0q4 5 7 0' : 'M-7-2h1m11-1h1'}" fill="none" stroke="#53463b" stroke-width="2.5" stroke-linecap="round"/><path d="M-3 7q4 4 8-1" fill="none" stroke="#956247" stroke-width="1.6" stroke-linecap="round"/>
    ${resting ? '<path d="M-29 44h57l6 62h-68Z" fill="#98a58c"/><path d="M-20 49v49m12-49v49m12-49v49m12-49v49" stroke="#bfc8ab" stroke-width="3"/><text x="28" y="-20" fill="#7c8a75" font-family="Georgia" font-size="15">z z</text>' : social ? '<path d="M-7 45H9v17Q1 69-7 62Z" fill="#e9e0c7"/><path d="M9 48q12 0 6 10H9" fill="none" stroke="#e9e0c7" stroke-width="3"/>' : '<path d="m-26 43 52 0-7 30h-39Z" fill="#adbbb0" stroke="#7e9088" stroke-width="2"/><circle cx="0" cy="56" r="4" fill="#e7e8d6"/><path d="M-25 74h48" stroke="#74867e" stroke-width="4" stroke-linecap="round"/>'}
  </g>
  ${social ? '<g transform="translate(355,182)"><path d="m-9 51-7 37 9 17m16-54 15 35-5 19" fill="none" stroke="#64777d" stroke-width="13" stroke-linecap="round"/><path d="M-14 17Q0 9 13 17l8 44h-43Z" fill="#a6a4ba"/><ellipse cy="-2" rx="16" ry="20" fill="#9b6d4c"/><path d="M-17 6q-6-39 16-30 27-6 19 33l-6-18-7-9q-8 14-20 8Z" fill="#493f35"/><path d="m-6-2 1 0m9 0 1 0m-8 10q4 3 7-1" stroke="#3c392e" stroke-width="2" fill="none" stroke-linecap="round"/><path d="m-10 25-13 21 18 10m17-30 11 18-17 11" stroke="#a6a4ba" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-4 43h13v15H-4Z" fill="#d4b274"/></g>' : ''}
  <g transform="translate(654,186)"><path d="M0 100V-9" stroke="#6e7158" stroke-width="5"/><path d="M-31 0h62L17-35h-34Z" fill="#e6c87a"/><ellipse cy="104" rx="26" ry="5" fill="#737861"/><circle cy="6" r="5" fill="#ffe2a2"/></g>
  <g transform="translate(733,234)"><path d="M-23 4h48l-7 54h-33Z" fill="#bd805e"/><path d="M0 6v-78M0-24c-45 6-42-34-42-34C-7-60 0-24 0-24m0-13c44 7 40-35 40-35C8-72 0-37 0-37m0-14c-24-24-8-48-8-48 30 14 8 48 8 48" stroke="#678261" stroke-width="3" fill="#7f986c"/><path d="M-11 16v29m12-29v29m12-29v29" stroke="#ac6f50" stroke-width="2"/></g>
  <g transform="translate(153,258)"><path d="M-31 8v59m65-59v59" stroke="#8e765c" stroke-width="6"/><path d="M-41-2h84v18h-84Z" fill="#aa8b66"/><path d="M-29-13v-50h60v50" stroke="#9d805d" stroke-width="6" fill="none"/>
  ${tidy ? '<rect x="-19" y="-9" width="38" height="8" rx="3" fill="#b6c4aa"/>' : '<path d="m-29-20 18-29 28 2 20 24-13 9-12-13 1 27h-37l5-28-6 12Z" fill="#a0a4b2"/><path d="M-17-23-7-6M11-27l8 20" stroke="#8c91a0" stroke-width="2"/>'}
  </g>
  <g transform="translate(309,307)"><ellipse rx="62" ry="22" fill="#b5946d"/><ellipse cy="-5" rx="62" ry="22" fill="#ddc8a0"/><path d="M-39 3v37m78-37v37" stroke="#9f805d" stroke-width="5"/>
    <ellipse cx="-17" cy="-7" rx="13" ry="5" fill="#b4a27d"/><path d="M-27-23h20v14q-9 10-20 0Z" fill="#e9e3d3"/><path d="M-7-20q13-2 10 7-3 6-10 2" stroke="#e9e3d3" stroke-width="4" fill="none"/><ellipse cx="-17" cy="-23" rx="10" ry="3" fill="#79634d"/><path class="steam" d="M-20-31q-7-8 0-15m8 14q7-8 0-14" stroke="#f6edda" stroke-width="2" fill="none"/>
    <rect x="10" y="-14" width="29" height="19" rx="2" fill="#d49a69" transform="rotate(12 10 -14)"/><path d="m16-8 16 3m-17 2 16 3" stroke="#f3dbb1" stroke-width="1.5"/>
  </g>
  <g class="room-cat ${s.petted ? 'petted' : ''}" transform="translate(548,324)"><ellipse rx="36" ry="15" fill="#5d6660"/><path d="M25 5q37 10 33-8" fill="none" stroke="#5d6660" stroke-width="10" stroke-linecap="round"/><path d="m-30-2-7-22 14 9 13-9-1 24Z" fill="#5d6660"/><path d="m-31-6 6 1m6 0 5-2" stroke="#e8d8b4" stroke-width="1.8" stroke-linecap="round"/><path d="m-23 0 2 2 2-2" stroke="#e8d8b4" stroke-width="1" fill="none"/>${s.petted ? '<text x="-23" y="-37" font-size="20" fill="#c76c57">♥</text>' : '<text x="-2" y="-23" font-family="Georgia" font-size="13" fill="#667566">z z</text>'}</g>
  ${s.food > 0 ? '<g transform="translate(42,259)"><rect width="48" height="25" rx="5" fill="#b4be9e"/><path d="M-3 0h54" stroke="#718466" stroke-width="5" stroke-linecap="round"/><rect x="5" y="-23" width="38" height="20" rx="4" fill="#c8b179"/><path d="M2-23h44" stroke="#a39163" stroke-width="4" stroke-linecap="round"/></g>' : ''}
  ${s.memories.length > 0 ? `<g transform="translate(300,80) rotate(7)"><rect width="38" height="48" fill="#fcf6e5"/><rect x="4" y="4" width="30" height="30" fill="#b2bca2"/><path d="m8 28 9-13 8 8 5-6 4 17H4Z" fill="#d2a476"/><rect x="10" y="-4" width="18" height="9" fill="#d3c393" opacity=".8"/></g>` : ''}
  </svg>`;
}

function statCard(key, label, s, subtitle, delta = 0) {
  const color = { cash: 'sage', energy: 'butter', peace: 'lavender', social: 'peach' }[key];
  const value = s.stats[key];
  return `<div class="stat ${color} ${key !== 'cash' && value < 25 ? 'low' : ''}"><div class="stat-icon">${icon(key === 'social' ? 'heart' : key)}</div><div class="stat-copy"><span class="eyebrow">${label}</span><div class="stat-value">${key === 'cash' ? dollars(value) : value}<small>${key === 'cash' ? 'available' : '/ 100'}</small></div>${key !== 'cash' ? `<div class="meter" role="meter" aria-label="${label}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><i style="width:${value}%"></i></div>` : `<span class="stat-note">${subtitle}</span>`}</div>${delta ? `<span class="stat-delta ${delta > 0 ? 'positive' : 'negative'}" aria-label="Latest change ${delta}">${delta > 0 ? '+' : '−'}${key === 'cash' ? '$' : ''}${Math.abs(delta)}</span>` : ''}</div>`;
}

function effectsHtml(effects) {
  return Object.entries(effects).map(([key, value]) => `<span class="effect ${value < 0 ? 'cost' : 'gain'}">${icon(key === 'social' ? 'heart' : key)} ${key === 'cash' ? `${value < 0 ? '−' : '+'}$${Math.abs(value)}` : `${value < 0 ? '−' : '+'}${Math.abs(value)}`}<span class="sr-only"> ${key}</span></span>`).join('');
}

function planLabel(s, id, error) {
  const card = LIFE_CARDS[id];
  const effects = Object.entries(cardEffects(s, id)).map(([key, value]) => `${value > 0 ? 'plus' : 'minus'} ${Math.abs(value)} ${key === 'social' ? 'connection' : key === 'cash' ? 'dollars' : key}`).join(', ');
  const combo = comboFor(s, id);
  return escapeHtml(`${card.title}. ${card.subtitle} ${effects}.${card.food ? ` Makes ${card.food + (s.upgrades.includes('rice') ? 2 : 0)} meals.` : ''}${combo ? ` Combo ready: ${combo.text}` : ''}${error ? ` ${error}` : ''}`);
}

function plans(s, started) {
  return `<section class="plans" id="plans" aria-labelledby="plans-title"><div class="section-title"><div><span class="eyebrow">ONE EVENING. MANY POSSIBILITIES.</span><h2 id="plans-title" tabindex="-1">What’s the move?</h2></div><button class="text-button reroll" data-action="reroll" ${!started || s.phase !== 'playing' || s.rerolled || s.stats.peace < 5 ? 'disabled' : ''}>${icon('refresh')} Rethink <small>−5 peace</small></button></div>
  <div class="cards">${s.hand.map((id, i) => {
    const card = LIFE_CARDS[id], combo = comboFor(s, id), error = canPlay(s, id);
    return `<button class="plan ${card.color} ${combo ? 'has-combo' : ''}" data-action="play" data-id="${id}" ${!started || error ? 'disabled' : ''} aria-label="${planLabel(s, id, error)}"><div class="card-top"><span class="card-symbol">${icon(card.icon)}</span><span class="tag">${card.tag === 'chance' ? 'a little risky' : card.tag}</span><kbd>${i + 1}</kbd></div><h3>${card.title}</h3><p>${card.subtitle}</p><div class="effects">${effectsHtml(cardEffects(s, id))}${card.food ? `<span class="effect food">${icon('bowl')} +${card.food + (s.upgrades.includes('rice') ? 2 : 0)} meals</span>` : ''}</div><div class="card-bottom">${error && started ? `<span>${escapeHtml(error)}</span>` : combo ? `<span class="combo-label">${icon('spark')} COMBO READY</span>` : `<span>${card.memory ? '＋ A little memory' : card.chance ? '55% spark · 45% story' : card.scroll ? '30% joy · 70% regrets' : 'Make a little room for life'}</span>`}${icon('arrow')}</div>${combo ? `<span class="combo-tooltip">${combo.text}</span>` : ''}</button>`;
  }).join('')}</div>
  <div class="plan-footer"><span>Day job: handled. Choose how to spend your evening.</span><button class="rest-button" data-action="play" data-id="sleep" ${!started || s.phase !== 'playing' ? 'disabled' : ''}>${icon('moon')} Just go to bed <span>+${cardEffects(s, 'sleep').energy} energy</span><kbd>4</kbd>${comboFor(s, 'sleep') ? '<b>+ combo</b>' : ''}</button></div>
  <p class="daily-cost">Daily upkeep: ${((s.day - 1) % 7 >= 5 ? 4 : 8)} energy${s.food ? ' − 4 with a stocked meal' : ''}, ${s.upgrades.includes('boundaries') ? 1 : 3} peace, 3 connection. Values stay between 0 and 100.</p></section>`;
}

function sidebar(s) {
  const coverage = Math.min(100, Math.max(0, s.stats.cash / QUARTERLIFE_RENT * 100));
  const currentWeek = Math.ceil(s.day / 7);
  return `<aside class="sidebar"><section class="rent-panel"><div class="side-heading"><span class="eyebrow">THE FINANCIAL SITUATION</span>${icon('cash')}</div><h2>Rent is a real thing.</h2><div class="rent-amount">$1,200 <span>due day 28</span></div><div class="rent-bar"><i style="width:${coverage}%"></i><span class="rent-target"></span></div><div class="rent-labels"><span>${Math.round(coverage)}% covered</span><span>${s.day === 28 ? 'due today' : `${28 - s.day} days to go`}</span></div><p>Spendable cash, not a locked fund. Friday pay: <b>+$420.</b> Sunday bills: <b>−$250.</b></p></section>
  <section class="quests"><span class="eyebrow">A LIFE, NOT JUST A LIVING</span><div class="quest ${s.memories.length >= 4 ? 'complete' : ''}">${icon(s.memories.length >= 4 ? 'check' : 'heart')}<span>Make a few memories<small>Have stories. Not just receipts.</small></span><b>${s.memories.length}/4</b></div><div class="quest ${s.boundaries >= 3 ? 'complete' : ''}">${icon(s.boundaries >= 3 ? 'check' : 'shield')}<span>Protect your peace<small>Say no. The world keeps turning.</small></span><b>${s.boundaries}/3</b></div><div class="quest ${['energy', 'peace', 'social'].every(k => s.stats[k] >= 25) ? 'complete' : ''}">${icon('peace')}<span>Keep a little in the tank<small>Finish with every meter at 25+.</small></span></div></section>
  <section class="phone-panel"><div class="side-heading"><span class="eyebrow">LIFE LATELY</span><span class="live-dot"></span></div>${s.feed.slice(0, 3).map((f, i) => `<div class="feed-entry ${i === 0 ? 'latest' : ''}"><div class="feed-avatar ${f.kind === 'money' ? 'sage' : f.kind === 'combo' ? 'butter' : 'lavender'}">${icon(f.kind === 'money' ? 'cash' : f.kind === 'combo' ? 'spark' : f.kind === 'message' ? 'phone' : 'heart')}</div><div><span class="feed-date">DAY ${String(f.day).padStart(2, '0')}</span><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.text)}</p></div></div>`).join('')}<button class="text-button" data-action="journal">Open the life log ${icon('arrow')}</button></section>
  <div class="little-note">“Nobody knows what they’re doing.<br>Some people just own a steamer.”<span>— a reliable source (the group chat)</span></div>
  ${s.upgrades.length ? `<section class="perks"><span class="eyebrow">THINGS THAT HELP · WEEK ${currentWeek}</span><div>${s.upgrades.map(id => `<span title="${escapeHtml(LIFE_UPGRADES[id].description)}">${icon(LIFE_UPGRADES[id].icon)}${LIFE_UPGRADES[id].title}</span>`).join('')}</div></section>` : ''}</aside>`;
}

export function renderLife(s, { started = true, muted = true, warning = '', deltas = {} } = {}) {
  const weekStart = Math.floor((s.day - 1) / 7) * 7 + 1;
  return `<div class="game-shell"><header class="topbar"><a class="brand" href="./twenty-six.html" aria-label="26: Doing My Best home"><span class="brand-age">26<span>™</span></span><span class="brand-words">DOING<br>MY BEST<span>A GAME ABOUT FIGURING IT OUT.</span></span></a><span class="header-note">a little chaotic. very human.</span><nav aria-label="Game controls"><button class="icon-button" data-action="sound" aria-label="${muted ? 'Turn sound on' : 'Mute sound'}" title="${muted ? 'Turn sound on' : 'Mute sound'}">${icon(muted ? 'mute' : 'sound')}</button><button class="quiet-button" data-action="help">How to play <span>?</span></button><button class="quiet-button" data-action="restart">New month ${icon('refresh')}</button></nav></header>
  ${warning ? `<div class="storage-warning" role="alert">${escapeHtml(warning)}</div>` : ''}
  <main><section class="heading"><div><span class="eyebrow">THE QUARTER-LIFE SURVIVAL GAME</span><h1>${started ? `${days[(s.day - 1) % 7]}. <em>${s.phase === 'ended' ? 'You made it.' : 'We’ve got this.'}</em>` : 'Big feelings. <em>Small apartment.</em>'}</h1><p>${DAY_LINES[s.day - 1]}</p></div><div class="day-counter"><span class="eyebrow">YOUR MONTH</span><strong>${String(s.day).padStart(2, '0')}<small> / 28</small></strong><span class="week-label">WEEK ${Math.ceil(s.day / 7)} OF 4</span></div></section>
  <section class="stats" aria-label="Your life right now">${statCard('cash', 'BANK BALANCE', s, 'Not a lot. Not nothing.', deltas.cash)}${statCard('energy', 'ENERGY', s, '', deltas.energy)}${statCard('peace', 'PEACE OF MIND', s, '', deltas.peace)}${statCard('social', 'CONNECTION', s, '', deltas.social)}</section>
  <div class="main-grid"><div class="main-column"><div class="week-strip" aria-label="This week">${days.map((day, i) => {
    const dayNo = weekStart + i, history = s.history.find(h => h.day === dayNo);
    return `<div class="week-day ${dayNo === s.day ? 'today' : ''} ${history ? 'done' : ''}" ${dayNo === s.day ? 'aria-current="date"' : ''}><span>${day.slice(0, 3)}</span>${history ? icon(LIFE_CARDS[history.card].icon) : `<b>${String(dayNo).padStart(2, '0')}</b>`}${i === 4 ? '<small>payday</small>' : i === 6 ? '<small>bills</small>' : '<small>one little day</small>'}</div>`;
  }).join('')}</div>
  <section class="room-panel" aria-label="Your apartment"><div class="room-label"><span class="live-dot"></span> YOUR PLACE <span>·</span> ${s.tidy ? 'suspiciously tidy' : 'a work in progress'}</div>${room(s)}<div class="room-bottom"><span>${s.food ? `${icon('bowl')} ${s.food} meals in the fridge` : `${icon('sun')} ${sceneCaption(s)}`}</span><button class="pet-button" data-action="pet" ${!started || s.phase !== 'playing' || s.petted ? 'disabled' : ''}>${icon('cat')} ${s.petted ? 'Miso loves you. Probably.' : 'Pet Miso'}<small>${s.petted ? '♥' : '+3 peace'}</small></button></div>${!started ? `<div class="welcome"><div class="welcome-card"><span class="eyebrow">WELCOME TO BEING 26.</span><h2>You’re not behind.<br><em>You’re just here.</em></h2><p>One month. One free evening a day.<br>Pay rent, find your people, keep a little peace.</p><button class="primary-button" data-action="start">Okay. Let’s do this. ${icon('arrow')}</button><small>5–10 minutes · no timer · autosaves</small></div></div>` : ''}</section>
  ${s.last ? `<div class="last-moment ${s.last.combo ? 'combo-moment' : ''}" aria-label="Latest outcome">${icon(s.last.combo ? 'spark' : 'check')}<div><strong>${escapeHtml(s.last.title)}</strong><span>${escapeHtml(s.last.text)}</span></div>${s.last.combo ? '<b>COMBO!</b>' : ''}</div>` : `<div class="first-tip">${icon('spark')} <span><b>Small wins stack.</b> Try cooking, then seeing friends. Or working, then actually resting.</span></div>`}
  ${s.phase !== 'ended' ? plans(s, started) : `<section class="end-inline"><h2>${escapeHtml(s.ending.title)}</h2><p>${escapeHtml(s.ending.text)}</p><button class="primary-button" data-action="results">Your month, wrapped ${icon('arrow')}</button></section>`}
  <div class="memory-shelf"><span class="eyebrow">THE LITTLE THINGS <span>${s.memories.length} ${s.memories.length === 1 ? 'MEMORY' : 'MEMORIES'}</span></span>${s.memories.length ? `<div class="memory-chips">${s.memories.slice(-5).map(m => `<span>${icon('heart')}${escapeHtml(m.title)}</span>`).join('')}</div>` : '<p>Good nights. Bad dates. Stories you’ll tell later. Make some.</p>'}</div></div>${sidebar(s)}</div></main>
  <footer class="page-footer"><span>26. STILL BECOMING.</span><span>Nothing to win at life. A few things to figure out.</span><span>${started && !warning ? '● Saved on this device' : 'OFFLINE. ON YOUR TERMS.'}</span></footer></div>`;
}

export function momentDialog(s) {
  if (s.phase === 'event') {
    const e = LIFE_EVENTS.find(item => item.id === s.pending);
    return `<div class="modal-icon peach">${icon(e.icon)}</div><span class="eyebrow">${e.from}</span><h2 id="modal-title">${e.title}</h2><p class="modal-lead">${e.text}</p><span class="event-note">An unexpected moment. This doesn’t use another day.</span><div class="event-options">${e.options.map((o, i) => `<button data-action="event" data-index="${i}" ${o.effects.cash < 0 && s.stats.cash + o.effects.cash < 0 ? 'disabled' : ''}><kbd>${i + 1}</kbd><span><strong>${o.label}</strong><small>${o.detail}${o.effects.cash < 0 && s.stats.cash + o.effects.cash < 0 ? ' · not enough cash' : ''}</small></span>${icon('arrow')}</button>`).join('')}</div>`;
  }
  if (s.phase === 'upgrade') return `<div class="modal-icon butter">${icon('spark')}</div><span class="eyebrow">WEEK ${s.day / 7} IN THE BOOKS</span><h2 id="modal-title">A little life upgrade.</h2><p class="modal-lead">You’re learning how to be you. Pick one thing to make next week a little easier.</p>${weeklyHighlights(s)}<div class="event-options">${s.offers.map((id, i) => `<button data-action="upgrade" data-id="${id}"><kbd>${i + 1}</kbd><span><strong>${LIFE_UPGRADES[id].title}</strong><small>${LIFE_UPGRADES[id].description}</small><em>${LIFE_UPGRADES[id].flavor}</em></span>${icon(LIFE_UPGRADES[id].icon)}</button>`).join('')}</div>`;
  if (s.phase === 'ended') return resultsDialog(s);
  return '';
}

export function resultsDialog(s) {
  const era = lifeEra(s);
  return `<button class="modal-close" data-action="close" aria-label="Close results">×</button><div class="modal-icon butter">${icon('sun')}</div><span class="eyebrow">YOUR MONTH, WRAPPED</span><h2 id="modal-title">${escapeHtml(s.ending.title)}</h2><p class="modal-lead">${escapeHtml(s.ending.text)}</p><div class="era-card">${icon(era.icon)}<div><span class="eyebrow">THE GROUP CHAT HAS NAMED YOUR ERA</span><h3>${era.name}</h3><p>${era.line}</p></div></div><div class="results-stats"><div><b>${dollars(s.stats.cash)}</b><span>after rent</span></div><div><b>${s.memories.length}</b><span>little memories</span></div><div><b>${s.combos}</b><span>small-win combos</span></div><div><b>${s.boundaries}</b><span>healthy boundaries</span></div></div><div class="result-goals">${[['solvent', 'Rent paid'], ['richLife', '4+ memories'], ['boundaried', '3+ boundaries'], ['balanced', 'All meters 25+']].map(([key, label]) => `<span class="${s.ending[key] ? 'achieved' : ''}">${s.ending[key] ? '✓' : '○'} ${label}</span>`).join('')}</div>${s.memories.length ? `<div class="result-memories"><span class="eyebrow">A FEW THINGS YOU GET TO KEEP</span>${s.memories.slice(-3).map(m => `<p>${icon("heart")}${escapeHtml(m.title)}</p>`).join("")}</div>` : ""}<div class="receipt"><span>DOING-MY-BEST SCORE</span><strong>${s.ending.score.toLocaleString('en-US')}</strong><small>A game score. Absolutely not your value as a person.</small></div><button class="primary-button" data-action="new">Another month. Another me. ${icon('arrow')}</button><button class="download-button" data-action="download">${icon("box")} Save my month as a picture</button><button class="text-button replay" data-action="same">Replay this month’s seed (${s.seed})</button>`;
}

export function helpDialog() {
  return `<button class="modal-close" data-action="close" aria-label="Close instructions">×</button><span class="eyebrow">A QUICK ORIENTATION TO EXISTING</span><h2 id="modal-title">One evening at a time.</h2><p class="modal-lead">Make it through 28 days with rent paid, a few good stories, and something left in the tank.</p><ol class="help-list"><li><b>Pick one of three plans each day.</b> Each card shows its costs and gains. Your day job happens in the background. Going to bed is always free.</li><li><b>Your ordinary life has upkeep.</b> Lose 8 energy on weekdays, 4 on weekends, plus 3 peace and 3 connection each day. A stocked meal reduces energy loss by 4. Clean spaces give +2 peace while tidy.</li><li><b>Know what’s coming.</b> +$420 every Friday. −$250 in bills every Sunday. $1,200 rent after the last evening. Your cash is spendable; it is not reserved.</li><li><b>Chain small wins.</b> Cook → socialize. Walk → create. Work → rest. Admin → rest. Socialize → set a boundary. A matching card shows COMBO READY.</li><li><b>You’re a person, not a productivity app.</b> Collect 4 different memories, set 3 boundaries, and finish with every meter at 25+. Zero energy or peace triggers a helping-hand reset; it never ends your run.</li></ol><div class="keyboard-help"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> choose a plan <kbd>4</kbd> go to bed <kbd>M</kbd> sound</div><p class="help-footnote">A new month gets a new seed. Replay the same seed to compare strategies. Autosaves stay in this browser. No account, no ads, no internet needed.</p><button class="primary-button" data-action="close">Okay. I can do this. ${icon('arrow')}</button>`;
}

export function journalDialog(s) {
  return `<button class="modal-close" data-action="close" aria-label="Close life log">×</button><span class="eyebrow">THE RECEIPTS, EMOTIONALLY</span><h2 id="modal-title">Your life lately.</h2><div class="journal">${s.feed.map(f => `<article><span class="eyebrow">DAY ${f.day} · ${escapeHtml(f.kind)}</span><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.text)}</p></article>`).join('')}</div>`;
}

function weeklyHighlights(s) {
  const recap = weekRecap(s);
  return `<div class="weekly-highlights"><div><b>${recap.memories}</b><span>new memories</span></div><div><b>${recap.combos}</b><span>little combos</span></div><div><b>${recap.rest}</b><span>rest nights</span></div></div><p class="week-observation">${recap.rest === 0 ? 'You kept going all week. Next week, remember you are allowed to stop.' : recap.social === 0 ? 'A quiet week. Maybe make room for one of your people next time.' : 'You made room for different parts of yourself. That is a pretty good week.'}</p>`;
}
