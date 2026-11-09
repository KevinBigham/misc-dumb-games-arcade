// ===================== SNAPTHREAD CORE =====================
// CONFIG + DATA + seeded RNG + pure rules. No DOM in this script.
// Rules.apply(state, cmd) -> { state, events }  (input state is never mutated)
var ST = (function () {
  'use strict';

  // ---------- CONFIG (every tunable number lives here) ----------
  var CONFIG = {
    SAVE_V: 1, RULES_V: 1,
    START_HP: 64, ENERGY: 3, HAND: 5, HAND_MAX: 10, PLAY_CAP: 40,
    T_MAX: 10,          // tension that makes the thread snap
    WEAVE_FRAY: 1,      // Weave loses this much at the start of each of your turns after the first
    SNAP_DMG: 3,        // a snap whips back at you this much, through block
    SNAP_HIT: 6,        // ...and lashes every enemy this much
    SNAP_RESET: 3,      // tension after a snap
    SLACK: 2,           // tension lost at the end of each of your turns
    KNOT_TENSION: 2,    // a knot still in hand at end of turn adds this
    ROWS: 10, COLS: 4, PATHS: 3,
    ROW_HP_SCALE: 0.025, // enemy hp grows this much per terrace row
    GOLD_FIGHT: [11, 18], GOLD_ELITE: [28, 38], START_GOLD: 40,
    REST_HEAL: 0.30,
    PRICE: { common: 45, uncommon: 70, rare: 110, relic: 140, chip: 50, chipStep: 25 },
    ODDS: { normal: [62, 31, 7], elite: [40, 42, 18], market: [50, 35, 15] },
    BRITTLE_MULT: 1.5, DULL_MULT: 0.75,
    SCORE: { row: 10, kill: 3, win: 250, hpOnWin: 2, goldDiv: 10 }
  };

  // ---------- DATA: cards ----------
  // fx ops are described in describe(); text is always generated from the numbers.
  var CARDS = {
    // starters
    tug:     { name: 'Tug', cost: 1, type: 'attack', plan: 'neutral', rarity: 'starter', fx: [['dmg', 6]], up: { fx: [['dmg', 9]] }, art: 'tug' },
    brace:   { name: 'Brace', cost: 1, type: 'skill', plan: 'weave', rarity: 'starter', fx: [['block', 5]], up: { fx: [['block', 8]] }, art: 'brace' },
    pluck:   { name: 'Pluck', cost: 1, type: 'attack', plan: 'taut', rarity: 'starter', fx: [['dmg', 6], ['tense', 2]], up: { fx: [['dmg', 9], ['tense', 2]] }, art: 'pluck' },
    // TAUT plan
    reel:    { name: 'Reel In', cost: 0, type: 'skill', plan: 'taut', rarity: 'common', fx: [['tense', 3]], up: { fx: [['tense', 4], ['draw', 1]] }, art: 'reel' },
    lash:    { name: 'Lash', cost: 1, type: 'attack', plan: 'taut', rarity: 'common', fx: [['dmgT', 3, 2]], up: { fx: [['dmgT', 5, 2]] }, art: 'lash' },
    flick:   { name: 'Flick', cost: 0, type: 'attack', plan: 'taut', rarity: 'common', fx: [['dmg', 3], ['tense', 1]], up: { fx: [['dmg', 5], ['tense', 1]] }, art: 'flick' },
    bline:   { name: 'Guy Line', cost: 1, type: 'skill', plan: 'taut', rarity: 'common', fx: [['block', 7], ['tense', 2]], up: { fx: [['block', 10], ['tense', 2]] }, art: 'guyline' },
    hold:    { name: 'Hold Fast', cost: 1, type: 'skill', plan: 'taut', rarity: 'common', fx: [['blockT', 5, 1]], up: { fx: [['blockT', 8, 1]] }, art: 'hold' },
    loosen:  { name: 'Let Out', cost: 1, type: 'skill', plan: 'taut', rarity: 'common', fx: [['loosen', 4, 4]], up: { fx: [['loosen', 5, 5]] }, art: 'letout' },
    whip:    { name: 'Whipstitch', cost: 1, type: 'attack', plan: 'taut', rarity: 'uncommon', fx: [['whip', 3, 2]], up: { fx: [['whip', 4, 2]] }, art: 'whip' },
    release: { name: 'Release', cost: 1, type: 'attack', plan: 'taut', rarity: 'uncommon', fx: [['release', 3]], up: { fx: [['release', 4]] }, art: 'release' },
    trip:    { name: 'Tripwire', cost: 1, type: 'skill', plan: 'taut', rarity: 'uncommon', fx: [['tense', 2], ['brittle', 2]], up: { fx: [['tense', 2], ['brittle', 3]] }, art: 'trip' },
    windup:  { name: 'Wind-Up', cost: 1, type: 'power', plan: 'taut', rarity: 'uncommon', fx: [['power', 'windup', 2]], up: { cost: 0 }, art: 'windup' },
    snapback:{ name: 'Snapback', cost: 1, type: 'power', plan: 'taut', rarity: 'uncommon', fx: [['power', 'snapback', 5]], up: { cost: 0 }, art: 'snapback' },
    hstring: { name: 'High String', cost: 2, type: 'attack', plan: 'taut', rarity: 'rare', fx: [['dmgT', 10, 2], ['tense', 3]], up: { fx: [['dmgT', 14, 2], ['tense', 3]] }, art: 'hstring' },
    // WEAVE plan
    weave:   { name: 'Weave', cost: 1, type: 'skill', plan: 'weave', rarity: 'common', fx: [['block', 5], ['weave', 2]], up: { fx: [['block', 7], ['weave', 3]] }, art: 'weave' },
    slam:    { name: 'Bolt Slam', cost: 1, type: 'attack', plan: 'weave', rarity: 'common', fx: [['dmgBlock']], up: { cost: 0 }, art: 'slam' },
    shuttle: { name: 'Shuttle', cost: 1, type: 'attack', plan: 'weave', rarity: 'common', fx: [['dmg', 5], ['block', 5]], up: { fx: [['dmg', 7], ['block', 7]] }, art: 'shuttle' },
    mesh:    { name: 'Mesh', cost: 0, type: 'skill', plan: 'weave', rarity: 'common', fx: [['block', 2], ['dull', 1]], up: { fx: [['block', 4], ['dull', 1]] }, art: 'mesh' },
    bolt:    { name: 'Bolt of Cloth', cost: 2, type: 'skill', plan: 'weave', rarity: 'uncommon', fx: [['block', 14]], up: { fx: [['block', 19]] }, art: 'bolt' },
    heavy:   { name: 'Heavy Bolt', cost: 1, type: 'attack', plan: 'weave', rarity: 'uncommon', fx: [['heavy', 7, 10]], up: { fx: [['heavy', 9, 10]] }, art: 'heavy' },
    hem:     { name: 'Hem', cost: 1, type: 'power', plan: 'weave', rarity: 'uncommon', fx: [['power', 'hem', 3]], up: { fx: [['power', 'hem', 5]] }, art: 'hem' },
    dknit:   { name: 'Double Knit', cost: 1, type: 'skill', plan: 'weave', rarity: 'uncommon', exhaust: true, fx: [['double'], ['weave', 1]], up: { cost: 0 }, art: 'dknit' },
    barbed:  { name: 'Barbed Weft', cost: 1, type: 'power', plan: 'weave', rarity: 'rare', fx: [['power', 'barbed', 3]], up: { fx: [['power', 'barbed', 5]] }, art: 'barbed' },
    felting: { name: 'Felting', cost: 2, type: 'power', plan: 'weave', rarity: 'rare', fx: [['power', 'felting', 2]], up: { cost: 1 }, art: 'felting' },
    // NEUTRAL
    snip:    { name: 'Snip', cost: 1, type: 'attack', plan: 'neutral', rarity: 'common', fx: [['hits', 4, 2]], up: { fx: [['hits', 5, 2]] }, art: 'snip' },
    fray:    { name: 'Fray', cost: 1, type: 'attack', plan: 'neutral', rarity: 'common', fx: [['dmg', 5], ['brittle', 2]], up: { fx: [['dmg', 7], ['brittle', 2]] }, art: 'fray' },
    unspool: { name: 'Unspool', cost: 0, type: 'skill', plan: 'neutral', rarity: 'common', exhaust: true, fx: [['draw', 2]], up: { fx: [['draw', 3]] }, art: 'unspool' },
    heave:   { name: 'Heave', cost: 2, type: 'attack', plan: 'neutral', rarity: 'common', fx: [['dmg', 15]], up: { fx: [['dmg', 20]] }, art: 'heave' },
    sweep:   { name: 'Sweep', cost: 1, type: 'attack', plan: 'neutral', rarity: 'common', fx: [['dmgAll', 6]], up: { fx: [['dmgAll', 9]] }, art: 'sweep' },
    snare:   { name: 'Snare', cost: 1, type: 'skill', plan: 'neutral', rarity: 'common', fx: [['dull', 1], ['block', 5]], up: { fx: [['dull', 2], ['block', 7]] }, art: 'snare' },
    breath:  { name: 'Second Wind', cost: 0, type: 'skill', plan: 'neutral', rarity: 'uncommon', exhaust: true, fx: [['energy', 1], ['draw', 2]], up: { fx: [['energy', 2], ['draw', 2]] }, art: 'breath' },
    patch:   { name: 'Patch Up', cost: 1, type: 'skill', plan: 'neutral', rarity: 'rare', exhaust: true, fx: [['heal', 6]], up: { fx: [['heal', 9]] }, art: 'patch' },
    // status
    knot:    { name: 'Knot', cost: -1, type: 'status', plan: 'none', rarity: 'status', fx: [], art: 'knot', unplayable: true }
  };

  var POWERS = {
    snapback: { name: 'Snapback', text: function (n) { return 'Snaps don’t hurt you and deal ' + n + ' more.'; } },
    windup:   { name: 'Wind-Up', text: function (n) { return 'Start of turn: +' + n + ' Tension.'; } },
    hem:      { name: 'Hem', text: function (n) { return 'Start of turn: gain ' + n + ' Block.'; } },
    barbed:   { name: 'Barbed Weft', text: function (n) { return 'When a card gives you Block, deal ' + n + ' to a random enemy.'; } },
    felting:  { name: 'Felting', text: function (n) { return 'Start of turn: gain ' + n + ' Weave.'; } }
  };

  // ---------- DATA: charms (relics) ----------
  var CHARMS = {
    spindle: { name: 'Spindle Ring', text: 'Start each fight with 2 Tension.', start: true },
    mordant: { name: 'Mordant Pot', text: 'Start each fight with 2 Weave.', start: true },
    hook:    { name: 'Iron Hook', text: 'Your attacks deal +1 damage.' },
    linen:   { name: 'Cool Linen', text: 'Lose 1 extra Tension at the end of each turn.' },
    thimble: { name: 'Thimble', text: 'Gain 5 Block whenever you Snap.' },
    teacup:  { name: 'Chipped Teacup', text: 'Heal 4 after each fight.' },
    shuttle2:{ name: 'Spare Shuttle', text: 'Draw 2 extra cards on your first turn.' },
    purse:   { name: 'Coin Purse', text: 'Gain 8 extra gold after each fight.' },
    sand:    { name: 'Sandglass', text: 'Every 3rd turn, gain 1 Energy.' },
    spool:   { name: 'Heavy Spool', text: 'Gain 10 Max HP.' },
    dyemark: { name: 'Dye Mark', text: 'Start each fight by applying 1 Brittle to ALL enemies.' },
    belt:    { name: 'Woven Belt', text: 'Start each fight with 6 Block.' }
  };
  var CHARM_POOL = ['hook', 'linen', 'thimble', 'teacup', 'shuttle2', 'purse', 'sand', 'spool', 'dyemark', 'belt'];

  // ---------- DATA: characters ----------
  var CHARS = {
    weaver: { name: 'The Weaver', charm: 'spindle', hp: 64,
      deck: ['tug', 'tug', 'tug', 'tug', 'brace', 'brace', 'brace', 'brace', 'pluck', 'reel'], blurb: 'Balanced. Leans into Tension.' },
    dyer:   { name: 'The Dyer', charm: 'mordant', hp: 54, unlock: 'win1',
      deck: ['tug', 'tug', 'tug', 'tug', 'tug', 'brace', 'brace', 'brace', 'brace', 'weave'], blurb: 'Less health, but every fight starts with Weave. Block that lasts; Tension plays get harder.' }
  };

  // ---------- DATA: enemies ----------
  // move fx: atk v times | block v | str v | strAll v | dull n | brittle n | knot n | tense n | slackP n | heal v
  var ENEMIES = {
    burrling:  { name: 'Burrling', hp: [15, 19], pattern: 'random', moves: [
      { name: 'Prick', fx: [['atk', 6]] }, { name: 'Cling', fx: [['atk', 3, 2]] }] },
    burrlet:   { name: 'Burrlet', hp: [10, 12], pattern: 'random', moves: [
      { name: 'Prick', fx: [['atk', 5]] }, { name: 'Cling', fx: [['atk', 2, 2]] }] },
    knotworm:  { name: 'Knotworm', hp: [22, 26], pattern: 'cycle', moves: [
      { name: 'Coil', fx: [['block', 6], ['atk', 3]] }, { name: 'Bite', fx: [['atk', 7]] }] },
    finch:     { name: 'Fray Finch', hp: [13, 16], pattern: 'random', moves: [
      { name: 'Peck', fx: [['atk', 5]] }, { name: 'Twist', fx: [['tense', 3], ['atk', 3]] }] },
    guard:     { name: 'Spindle Guard', hp: [38, 42], pattern: 'cycle', moves: [
      { name: 'Wind', fx: [['block', 12]] }, { name: 'Slam', fx: [['atk', 13]] }] },
    wisp:      { name: 'Tangle Wisp', hp: [26, 30], pattern: 'cycle', moves: [
      { name: 'Snarl', fx: [['knot', 2], ['atk', 4]] }, { name: 'Lash', fx: [['atk', 9]] }] },
    shearA:    { name: 'Left Shear', hp: [18, 20], pattern: 'cycle', moves: [
      { name: 'Snip', fx: [['atk', 5]] }, { name: 'Rally', fx: [['strAll', 2]] }] },
    shearB:    { name: 'Right Shear', hp: [18, 20], pattern: 'cycle', moves: [
      { name: 'Snip', fx: [['atk', 6]] }, { name: 'Pinch', fx: [['atk', 3], ['dull', 1]] }] },
    hound:     { name: 'Loom Hound', hp: [32, 36], pattern: 'cycle', moves: [
      { name: 'Bite', fx: [['atk', 8]] }, { name: 'Howl', fx: [['str', 3], ['block', 5]] }, { name: 'Maul', fx: [['atk', 5, 2]] }] },
    mite:      { name: 'Lint Mite', hp: [8, 10], pattern: 'random', moves: [
      { name: 'Nibble', fx: [['atk', 4]] }, { name: 'Wriggle', fx: [['tense', 2], ['atk', 2]] }] },
    // elites
    warden:    { name: 'Spindle Warden', elite: true, hp: [50, 54], pattern: 'cycle', moves: [
      { name: 'Crank', fx: [['str', 2], ['block', 8]] }, { name: 'Strike', fx: [['atk', 13]] }, { name: 'Whirl', fx: [['atk', 4, 3]] }] },
    colossus:  { name: 'Matted Colossus', elite: true, hp: [66, 70], pattern: 'cycle', moves: [
      { name: 'Gather', fx: [['block', 15]] }, { name: 'Crush', fx: [['atk', 19]] }, { name: 'Shed', fx: [['atk', 8], ['brittle', 2]] }] },
    witch:     { name: 'Dye Witch', elite: true, hp: [44, 48], pattern: 'cycle', moves: [
      { name: 'Soak', fx: [['dull', 2], ['atk', 6]] }, { name: 'Steep', fx: [['str', 2], ['heal', 8]] }, { name: 'Boil', fx: [['atk', 10], ['knot', 1]] }] },
    // boss
    unraveler: { name: 'The Unraveler', boss: true, hp: [108, 108], pattern: 'cycle', moves: [
      { name: 'Unwind', fx: [['block', 10], ['str', 1]] }, { name: 'Lashes', fx: [['atk', 4, 3]] },
      { name: 'Tangle', fx: [['knot', 2], ['atk', 8]] }, { name: 'Pull Taut', fx: [['tense', 3], ['atk', 9]] }],
      phase2: { at: 0.5, name: 'Frays Loose', fx: [['str', 2]], moves: [
        { name: 'Lashes', fx: [['atk', 5, 3]] }, { name: 'Pull Taut', fx: [['tense', 3], ['atk', 10]] },
        { name: 'Rewind', fx: [['block', 10]] }, { name: 'Tangle', fx: [['knot', 1], ['atk', 9]] }] } }
  };
  var ENCOUNTERS = {
    easy: [['burrling'], ['knotworm'], ['finch', 'burrlet'], ['burrlet', 'burrlet'], ['finch', 'finch']],
    hard: [['guard'], ['wisp', 'burrlet'], ['shearA', 'shearB'], ['hound'], ['mite', 'mite', 'mite'], ['knotworm', 'finch'], ['guard', 'mite']],
    elite: [['warden'], ['colossus'], ['witch', 'mite']],
    boss: [['unraveler']]
  };

  // ---------- DATA: wayside events ----------
  var SHRINES = {
    urn:    { name: 'A Split Dye Urn', text: 'Something glints at the bottom of a cracked urn of madder dye.',
      opts: [{ label: 'Reach in', hint: 'Lose 7 HP. Gain a random rare card.', fx: [['hurt', 7], ['rareCard']] },
             { label: 'Walk on', hint: 'Nothing happens.', fx: [] }] },
    loom:   { name: 'An Abandoned Loom', text: 'The heddles still move. You could rework a card here.',
      opts: [{ label: 'Rework', hint: 'Upgrade a card of your choice.', fx: [['mend']] },
             { label: 'Unpick', hint: 'Remove a card of your choice.', fx: [['chip']] }] },
    aunt:   { name: 'A Kind Dyer', text: 'An old dyer offers tea or a little coin for the climb.',
      opts: [{ label: 'Tea', hint: 'Heal 15 HP.', fx: [['heal', 15]] },
             { label: 'Coin', hint: 'Gain 45 gold.', fx: [['gold', 45]] }] },
    vat:    { name: 'The Indigo Vat', text: 'Dip your cards and they come out deeper, but the fumes sting.',
      opts: [{ label: 'Dip two', hint: 'Upgrade 2 random cards. Lose 5 Max HP.', fx: [['upRandom', 2], ['maxHp', -5]] },
             { label: 'Breathe easy', hint: 'Heal 6 HP.', fx: [['heal', 6]] }] },
    peddler:{ name: 'A Thread Peddler', text: '“A charm for a price,” she says, holding out a pouch.',
      opts: [{ label: 'Pay 35 gold', hint: 'Gain a random charm.', need: 35, fx: [['gold', -35], ['charm']] },
             { label: 'Decline', hint: 'Nothing happens.', fx: [] }] }
  };

  var DATA = { CARDS: CARDS, POWERS: POWERS, CHARMS: CHARMS, CHARM_POOL: CHARM_POOL, CHARS: CHARS, ENEMIES: ENEMIES, ENCOUNTERS: ENCOUNTERS, SHRINES: SHRINES };

  // ---------- RNG (mulberry32 + string/number hash) ----------
  function hash() {
    var h = 2166136261 >>> 0;
    for (var a = 0; a < arguments.length; a++) {
      var s = String(arguments[a]);
      for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
      h ^= 0x9e37; h = Math.imul(h, 16777619) >>> 0;
    }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16;
    return h >>> 0;
  }
  // stream object {s:uint32}; next() returns float [0,1)
  function rnd(stream) {
    stream.s = (stream.s + 0x6D2B79F5) >>> 0;
    var t = stream.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rint(stream, lo, hi) { return lo + Math.floor(rnd(stream) * (hi - lo + 1)); }
  function shuffle(stream, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rnd(stream) * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function pickW(stream, items, weights) {
    var tot = 0; for (var i = 0; i < weights.length; i++) tot += weights[i];
    var r = rnd(stream) * tot; for (i = 0; i < items.length; i++) { r -= weights[i]; if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  var RNG = { hash: hash, rnd: rnd, rint: rint, shuffle: shuffle };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------- card helpers ----------
  function cardDef(c) { return CARDS[c.id]; }
  function cardCost(c) { var d = CARDS[c.id]; if (c.up && d.up && d.up.cost !== undefined) return d.up.cost; return d.cost; }
  function cardFx(c) { var d = CARDS[c.id]; if (c.up && d.up && d.up.fx) return d.up.fx; return d.fx; }
  var TARGETED = { dmg: 1, hits: 1, dmgT: 1, whip: 1, dmgBlock: 1, heavy: 1, brittle: 1, dull: 1 };
  function needsTarget(c) { var fx = cardFx(c); for (var i = 0; i < fx.length; i++) if (TARGETED[fx[i][0]]) return true; return false; }
  function whipHits(per, T) { return 1 + Math.floor(T / per); }

  // ctx (optional): {T, temper, block, dull} — gives live numbers inside a fight
  function describe(c, ctx) {
    var fx = cardFx(c), out = [], d = CARDS[c.id];
    var tmp = ctx ? (ctx.temper || 0) : 0;
    function dm(n) { if (!ctx) return String(n); var v = n + tmp; if (ctx.dull) v = Math.floor(v * CONFIG.DULL_MULT); return String(v); }
    for (var i = 0; i < fx.length; i++) {
      var f = fx[i];
      switch (f[0]) {
        case 'dmg': out.push('Deal ' + dm(f[1]) + '.'); break;
        case 'hits': out.push('Deal ' + dm(f[1]) + ' ×' + f[2] + '.'); break;
        case 'dmgT': out.push('Deal ' + f[1] + ' + ' + (f[2] > 1 ? f[2] + '×' : '') + 'Tension' + (ctx ? ' (' + dm(f[1] + f[2] * ctx.T) + ')' : '') + '.'); break;
        case 'whip': out.push('Deal ' + dm(f[1]) + ', once plus once per ' + f[2] + ' Tension' + (ctx ? ' (×' + whipHits(f[2], ctx.T) + ')' : '') + '.'); break;
        case 'dmgBlock': out.push('Deal damage equal to your Block' + (ctx ? ' (' + dm(ctx.block) + ')' : '') + '.'); break;
        case 'dmgAll': out.push('Deal ' + dm(f[1]) + ' to ALL.'); break;
        case 'release': out.push('Spend all Tension. Deal ' + f[1] + '× that to ALL' + (ctx ? ' (' + dm(f[1] * ctx.T) + ')' : '') + '.'); break;
        case 'heavy': out.push('Deal ' + dm(f[1]) + '. With ' + f[2] + '+ Block, deal it again.'); break;
        case 'block': out.push('Gain ' + f[1] + ' Block.'); break;
        case 'blockT': out.push('Gain ' + f[1] + ' + ' + (f[2] > 1 ? f[2] + '×' : '') + 'Tension Block' + (ctx ? ' (' + (f[1] + f[2] * ctx.T) + ')' : '') + '.'); break;
        case 'weave': out.push('Gain ' + f[1] + ' Weave.'); break;
        case 'tense': out.push('+' + f[1] + ' Tension.'); break;
        case 'slack': out.push('−' + f[1] + ' Tension.'); break;
        case 'loosen': out.push('Spend up to ' + f[2] + ' Tension. Gain ' + f[1] + ' Block for each.'); break;
        case 'draw': out.push('Draw ' + f[1] + '.'); break;
        case 'energy': out.push('Gain ' + f[1] + ' Energy.'); break;
        case 'brittle': out.push('Apply ' + f[1] + ' Brittle.'); break;
        case 'dull': out.push('Apply ' + f[1] + ' Dull.'); break;
        case 'double': out.push('Double your Block.'); break;
        case 'heal': out.push('Heal ' + f[1] + '.'); break;
        case 'power': out.push(POWERS[f[1]].text(f[2])); break;
      }
    }
    if (d.unplayable) out.push('Unplayable. In hand at end of turn: +' + CONFIG.KNOT_TENSION + ' Tension. Gone after the fight.');
    if (d.exhaust) out.push('Exhaust.');
    return out.join(' ');
  }

  // ---------- map ----------
  var NODE_W = { F: 46, E: 16, R: 12, M: 12, S: 14 };
  function makeMap(seed) {
    var s = { s: hash(seed, 'map') };
    var nodes = {}, R = CONFIG.ROWS, C = CONFIG.COLS;
    function key(r, c) { return r + '-' + c; }
    function node(r, c) { var k = key(r, c); if (!nodes[k]) nodes[k] = { id: k, r: r, c: c, type: null, next: [] }; return nodes[k]; }
    var starts = shuffle(s, [0, 1, 2, 3]).slice(0, CONFIG.PATHS);
    for (var p = 0; p < CONFIG.PATHS; p++) {
      var c = starts[p];
      for (var r = 0; r < R; r++) {
        var n = node(r, c);
        if (r < R - 1) {
          var nc = Math.max(0, Math.min(C - 1, c + rint(s, -1, 1)));
          var m = node(r + 1, nc);
          if (n.next.indexOf(m.id) < 0) n.next.push(m.id);
          c = nc;
        } else if (n.next.indexOf('boss') < 0) n.next.push('boss');
      }
    }
    nodes.boss = { id: 'boss', r: R, c: 1.5, type: 'B', next: [] };
    // types, in row order so parents are typed first
    var list = Object.keys(nodes).map(function (k) { return nodes[k]; }).filter(function (n) { return n.id !== 'boss'; });
    list.sort(function (a, b) { return a.r - b.r || a.c - b.c; });
    var parents = {};
    list.forEach(function (n) { n.next.forEach(function (m) { (parents[m] = parents[m] || []).push(n.id); }); });
    list.forEach(function (n) {
      if (n.r === 0) { n.type = 'F'; return; }
      if (n.r === R - 1) { n.type = 'R'; return; }
      if (n.r <= 2) { n.type = rnd(s) < 0.78 ? 'F' : 'S'; return; }
      var ptypes = (parents[n.id] || []).map(function (pid) { return nodes[pid].type; });
      var types = ['F', 'E', 'R', 'M', 'S'], w = [];
      for (var i = 0; i < types.length; i++) {
        var t = types[i], wt = NODE_W[t];
        if (t === 'E' && n.r < 4) wt = 0;
        if ((t === 'R' || t === 'M' || t === 'E') && ptypes.indexOf(t) >= 0) wt = 0; // no back-to-back
        if (t === 'R' && n.r === R - 2) wt = 0; // rest row comes next anyway
        w.push(wt);
      }
      n.type = pickW(s, types, w);
    });
    var rows = [];
    for (var r2 = 0; r2 <= R; r2++) rows.push([]);
    Object.keys(nodes).forEach(function (k) { var n = nodes[k]; rows[n.r].push(n.id); });
    rows.forEach(function (row) { row.sort(function (a, b) { return nodes[a].c - nodes[b].c; }); });
    return { nodes: nodes, rows: rows };
  }

  // ---------- new run ----------
  function newRun(opts) {
    opts = opts || {};
    var seed = (opts.seed >>> 0) || (hash(Date.now(), Math.random()) >>> 0);
    var ch = CHARS[opts.char] ? opts.char : 'weaver';
    var C = CHARS[ch];
    var st = {
      v: CONFIG.SAVE_V, rulesV: CONFIG.RULES_V, seed: seed, daily: !!opts.daily, dailyKey: opts.dailyKey || null, char: ch,
      phase: 'map', hp: C.hp, maxHp: C.hp, gold: CONFIG.START_GOLD,
      deck: [], charms: [C.charm], uid: 1,
      map: makeMap(seed), pos: null, visited: [],
      combat: null, reward: null, rest: null, market: null, shrine: null, pick: null,
      stats: { rows: 0, kills: 0, fights: 0, elites: 0, turns: 0, dealt: 0, taken: 0, snaps: 0, played: 0, biggest: 0, biggestCard: null },
      log: [], score: 0, end: null, chipCount: 0
    };
    for (var i = 0; i < C.deck.length; i++) st.deck.push({ uid: st.uid++, id: C.deck[i], up: 0 });
    return st;
  }

  function reachable(st) {
    if (st.phase !== 'map') return [];
    if (!st.pos) return st.map.rows[0].slice();
    return st.map.nodes[st.pos].next.slice();
  }

  // ---------- combat ----------
  function hasCharm(st, k) { return st.charms.indexOf(k) >= 0; }
  function alive(c) { return c.enemies.filter(function (e) { return e.hp > 0; }); }

  function startCombat(st, ev, node) {
    var kind = node.type === 'E' ? 'elite' : node.type === 'B' ? 'boss' : node.r <= 2 ? 'easy' : 'hard';
    var pool = ENCOUNTERS[kind];
    var enc = pool[hash(st.seed, node.id, 'enc') % pool.length];
    var rs = { s: hash(st.seed, node.id, 'fight') };
    var scale = 1 + CONFIG.ROW_HP_SCALE * node.r;
    var c = {
      kind: kind, node: node.id, turn: 0, energy: 0, T: 0, block: 0, weave: 0, temper: 0, dull: 0, brittle: 0,
      powers: {}, draw: [], hand: [], discard: [], exhaust: [], plays: 0, rng: rs,
      enemies: [], hpStart: st.hp
    };
    for (var i = 0; i < enc.length; i++) {
      var d = ENEMIES[enc[i]];
      var hp = Math.round(rint(rs, d.hp[0], d.hp[1]) * (d.boss ? 1 : scale));
      c.enemies.push({ key: enc[i], name: d.name, hp: hp, maxHp: hp, block: 0, str: 0, dull: 0, brittle: 0, mi: -1, intent: null, hist: [], phase: 1, cyc: rint(rs, 0, d.moves.length - 1) });
    }
    c.draw = shuffle(rs, st.deck.map(function (x) { return { uid: x.uid, id: x.id, up: x.up }; }));
    st.combat = c; st.phase = 'combat';
    if (hasCharm(st, 'hook')) c.temper += 1;
    if (hasCharm(st, 'belt')) c.block += 6;
    if (hasCharm(st, 'mordant')) c.weave += 2;
    if (hasCharm(st, 'dyemark')) c.enemies.forEach(function (e) { e.brittle += 1; });
    ev.push({ e: 'combatStart', kind: kind, names: c.enemies.map(function (e) { return e.name; }) });
    c.enemies.forEach(function (e, idx) { chooseIntent(st, idx); });
    if (hasCharm(st, 'spindle')) addTension(st, ev, 2);
    startTurn(st, ev);
  }

  function chooseIntent(st, idx) {
    var c = st.combat, e = c.enemies[idx], d = ENEMIES[e.key];
    var moves = (e.phase === 2 && d.phase2) ? d.phase2.moves : d.moves;
    var mi;
    if (d.pattern === 'cycle') { mi = (e.cyc + e.hist.length) % moves.length; }
    else {
      var h = e.hist, tries = 0;
      do { mi = rint(c.rng, 0, moves.length - 1); tries++; }
      while (tries < 8 && h.length >= 2 && h[h.length - 1] === mi && h[h.length - 2] === mi);
    }
    e.mi = mi; e.intent = clone(moves[mi]);
  }

  // honest intent preview used by the UI
  function intentDamage(st, idx) {
    var c = st.combat, e = c.enemies[idx], out = [];
    if (!e.intent) return out;
    e.intent.fx.forEach(function (f) {
      if (f[0] === 'atk') {
        var v = f[1] + e.str;
        if (e.dull > 0) v = Math.floor(v * CONFIG.DULL_MULT);
        if (c.brittle > 0) v = Math.floor(v * CONFIG.BRITTLE_MULT);
        out.push({ dmg: Math.max(0, v), times: f[2] || 1 });
      }
    });
    return out;
  }
  function incoming(st) {
    var tot = 0, c = st.combat;
    c.enemies.forEach(function (e, i) { if (e.hp > 0) intentDamage(st, i).forEach(function (a) { tot += a.dmg * a.times; }); });
    return tot;
  }

  function drawCards(st, ev, n) {
    var c = st.combat;
    for (var i = 0; i < n; i++) {
      if (c.hand.length >= CONFIG.HAND_MAX) break;
      if (!c.draw.length) {
        if (!c.discard.length) break;
        c.draw = shuffle(c.rng, c.discard); c.discard = [];
        ev.push({ e: 'reshuffle' });
      }
      var card = c.draw.pop(); c.hand.push(card);
      ev.push({ e: 'draw', uid: card.uid });
    }
  }

  function startTurn(st, ev) {
    var c = st.combat;
    c.turn++; st.stats.turns++;
    c.block = Math.min(c.block, c.weave);
    if (c.turn > 1 && c.weave > 0 && CONFIG.WEAVE_FRAY) { var wf = Math.min(c.weave, CONFIG.WEAVE_FRAY); c.weave -= wf; ev.push({ e: 'weave', n: -wf }); }
    c.energy = CONFIG.ENERGY + (hasCharm(st, 'sand') && c.turn % 3 === 0 ? 1 : 0);
    c.plays = 0;
    ev.push({ e: 'turn', n: c.turn });
    if (c.powers.felting) { c.weave += c.powers.felting; ev.push({ e: 'weave', n: c.powers.felting }); }
    if (c.powers.hem) { c.block += c.powers.hem; ev.push({ e: 'block', who: 'p', n: c.powers.hem }); }
    if (c.powers.windup) addTension(st, ev, c.powers.windup);
    if (st.phase !== 'combat') return;
    drawCards(st, ev, CONFIG.HAND + (c.turn === 1 && hasCharm(st, 'shuttle2') ? 2 : 0));
  }

  function hurtPlayer(st, ev, amt, src, pierce) {
    var c = st.combat;
    if (amt <= 0) return;
    var blocked = 0;
    if (!pierce) { blocked = Math.min(c.block, amt); c.block -= blocked; }
    var dmg = amt - blocked;
    st.hp -= dmg; st.stats.taken += dmg;
    ev.push({ e: 'hurt', n: dmg, blocked: blocked, src: src });
    if (st.hp <= 0) {
      st.hp = 0;
      if (st.phase === 'combat') endRun(st, ev, false, src);
    }
  }

  function addTension(st, ev, n) {
    var c = st.combat;
    if (!c || st.phase !== 'combat') return;
    c.T += n;
    ev.push({ e: 'tension', n: n, T: Math.min(c.T, CONFIG.T_MAX) });
    while (c.T >= CONFIG.T_MAX && st.phase === 'combat') {
      c.T = CONFIG.SNAP_RESET;
      st.stats.snaps++;
      ev.push({ e: 'snap', T: c.T });
      if (hasCharm(st, 'thimble')) { c.block += 5; ev.push({ e: 'block', who: 'p', n: 5 }); }
      var dmgv = CONFIG.SNAP_HIT + (c.powers.snapback || 0);
      c.enemies.forEach(function (e, i) { if (e.hp > 0) hitEnemy(st, ev, i, dmgv, false, 'a snap'); });
      if (checkWin(st, ev)) return;
      if (!c.powers.snapback) hurtPlayer(st, ev, CONFIG.SNAP_DMG, { name: 'your own snapped thread' }, true);
    }
  }

  function hitEnemy(st, ev, i, base, isAttack, srcName) {
    var c = st.combat, e = c.enemies[i];
    if (!e || e.hp <= 0) return 0;
    var d = base + (isAttack ? c.temper : 0);
    if (isAttack && c.dull > 0) d = Math.floor(d * CONFIG.DULL_MULT);
    if (e.brittle > 0) d = Math.floor(d * CONFIG.BRITTLE_MULT);
    d = Math.max(0, d);
    var ab = Math.min(e.block, d); e.block -= ab;
    var net = d - ab;
    e.hp -= net; st.stats.dealt += net;
    if (net > st.stats.biggest) { st.stats.biggest = net; st.stats.biggestCard = srcName || null; }
    ev.push({ e: 'hit', i: i, n: net, blocked: ab });
    if (e.hp <= 0) { e.hp = 0; e.block = 0; st.stats.kills++; ev.push({ e: 'kill', i: i, name: e.name }); }
    else if (ENEMIES[e.key].phase2 && e.phase === 1 && e.hp <= e.maxHp * ENEMIES[e.key].phase2.at) {
      e.phase = 2; e.hist = []; e.cyc = 0;
      var p2 = ENEMIES[e.key].phase2;
      ev.push({ e: 'phase', i: i, name: p2.name });
      runEnemyFx(st, ev, i, p2.fx, p2.name);
      chooseIntent(st, i);
    }
    return net;
  }

  function gainBlock(st, ev, n, fromCard) {
    var c = st.combat;
    c.block += n; ev.push({ e: 'block', who: 'p', n: n });
    if (fromCard && c.powers.barbed) {
      var al = []; c.enemies.forEach(function (e, i) { if (e.hp > 0) al.push(i); });
      if (al.length) { var t = al[rint(c.rng, 0, al.length - 1)]; hitEnemy(st, ev, t, c.powers.barbed, false, 'Barbed Weft'); }
    }
  }

  function checkWin(st, ev) {
    var c = st.combat;
    if (st.phase !== 'combat') return true;
    if (alive(c).length) return false;
    winCombat(st, ev);
    return true;
  }

  function runCardFx(st, ev, card, target) {
    var c = st.combat, fx = cardFx(card), name = CARDS[card.id].name;
    for (var k = 0; k < fx.length; k++) {
      if (st.phase !== 'combat') return;
      var f = fx[k];
      var tgt = target;
      if (TARGETED[f[0]] && (tgt === null || tgt === undefined || !c.enemies[tgt] || c.enemies[tgt].hp <= 0)) {
        var al = alive(c); tgt = al.length ? c.enemies.indexOf(al[0]) : -1;
      }
      switch (f[0]) {
        case 'dmg': hitEnemy(st, ev, tgt, f[1], true, name); break;
        case 'hits': for (var h = 0; h < f[2]; h++) hitEnemy(st, ev, tgt, f[1], true, name); break;
        case 'dmgT': hitEnemy(st, ev, tgt, f[1] + f[2] * c.T, true, name); break;
        case 'whip': var n = whipHits(f[2], c.T); for (var w = 0; w < n; w++) hitEnemy(st, ev, tgt, f[1], true, name); break;
        case 'dmgBlock': hitEnemy(st, ev, tgt, c.block, true, name); break;
        case 'dmgAll': c.enemies.forEach(function (e, i) { if (e.hp > 0) hitEnemy(st, ev, i, f[1], true, name); }); break;
        case 'release':
          var spent = c.T; c.T = 0; ev.push({ e: 'tension', n: -spent, T: 0 });
          c.enemies.forEach(function (e, i) { if (e.hp > 0) hitEnemy(st, ev, i, f[1] * spent, true, name); });
          break;
        case 'heavy': hitEnemy(st, ev, tgt, f[1], true, name); if (c.block >= f[2]) hitEnemy(st, ev, tgt, f[1], true, name); break;
        case 'block': gainBlock(st, ev, f[1], true); break;
        case 'blockT': gainBlock(st, ev, f[1] + f[2] * c.T, true); break;
        case 'weave': c.weave += f[1]; ev.push({ e: 'weave', n: f[1] }); break;
        case 'tense': addTension(st, ev, f[1]); break;
        case 'slack': var sl = Math.min(c.T, f[1]); c.T -= sl; ev.push({ e: 'tension', n: -sl, T: c.T }); break;
        case 'loosen': var sp = Math.min(c.T, f[2]); c.T -= sp; ev.push({ e: 'tension', n: -sp, T: c.T }); if (sp > 0) gainBlock(st, ev, sp * f[1], true); break;
        case 'draw': drawCards(st, ev, f[1]); break;
        case 'energy': c.energy += f[1]; ev.push({ e: 'energy', n: f[1] }); break;
        case 'brittle': if (tgt >= 0) { c.enemies[tgt].brittle += f[1]; ev.push({ e: 'status', i: tgt, k: 'brittle', n: f[1] }); } break;
        case 'dull': if (tgt >= 0) { c.enemies[tgt].dull += f[1]; ev.push({ e: 'status', i: tgt, k: 'dull', n: f[1] }); } break;
        case 'double': gainBlock(st, ev, c.block, true); break;
        case 'heal': var hl = Math.min(f[1], st.maxHp - st.hp); st.hp += hl; ev.push({ e: 'heal', n: hl }); break;
        case 'power': c.powers[f[1]] = (c.powers[f[1]] || 0) + f[2]; ev.push({ e: 'power', k: f[1] }); break;
      }
      if (checkWin(st, ev)) return;
    }
  }

  function canPlay(st, card) {
    var c = st.combat;
    if (!c || st.phase !== 'combat') return false;
    var d = CARDS[card.id];
    if (d.unplayable) return false;
    if (c.plays >= CONFIG.PLAY_CAP) return false;
    return cardCost(card) <= c.energy;
  }

  function playCard(st, ev, uid, target) {
    var c = st.combat;
    var hi = -1; for (var i = 0; i < c.hand.length; i++) if (c.hand[i].uid === uid) hi = i;
    if (hi < 0) return 'no such card';
    var card = c.hand[hi];
    if (!canPlay(st, card)) return 'cannot play';
    if (needsTarget(card)) {
      if (target === undefined || target === null || !c.enemies[target] || c.enemies[target].hp <= 0) {
        var al = alive(c); target = al.length ? c.enemies.indexOf(al[0]) : null;
      }
    }
    c.energy -= cardCost(card);
    c.hand.splice(hi, 1);
    c.plays++; st.stats.played++;
    ev.push({ e: 'play', uid: uid, id: card.id, target: target });
    var d = CARDS[card.id];
    if (d.type === 'power') c.exhaust.push(card);
    else if (d.exhaust) { c.exhaust.push(card); ev.push({ e: 'exhaust', uid: uid }); }
    else c.discard.push(card);
    runCardFx(st, ev, card, target);
    return null;
  }

  function runEnemyFx(st, ev, i, fx, moveName) {
    var c = st.combat, e = c.enemies[i];
    for (var k = 0; k < fx.length; k++) {
      if (st.phase !== 'combat' || e.hp <= 0) return;
      var f = fx[k];
      switch (f[0]) {
        case 'atk':
          var times = f[2] || 1;
          for (var t = 0; t < times; t++) {
            var v = f[1] + e.str;
            if (e.dull > 0) v = Math.floor(v * CONFIG.DULL_MULT);
            if (c.brittle > 0) v = Math.floor(v * CONFIG.BRITTLE_MULT);
            ev.push({ e: 'enemyAtk', i: i });
            hurtPlayer(st, ev, Math.max(0, v), { name: e.name, move: moveName }, false);
            if (st.phase !== 'combat') return;
          }
          break;
        case 'block': e.block += f[1]; ev.push({ e: 'block', who: i, n: f[1] }); break;
        case 'str': e.str += f[1]; ev.push({ e: 'status', i: i, k: 'str', n: f[1] }); break;
        case 'strAll': c.enemies.forEach(function (o, j) { if (o.hp > 0) { o.str += f[1]; ev.push({ e: 'status', i: j, k: 'str', n: f[1] }); } }); break;
        case 'heal': var hl = Math.min(f[1], e.maxHp - e.hp); e.hp += hl; ev.push({ e: 'eheal', i: i, n: hl }); break;
        case 'dull': c.dull += f[1]; ev.push({ e: 'pstatus', k: 'dull', n: f[1] }); break;
        case 'brittle': c.brittle += f[1]; ev.push({ e: 'pstatus', k: 'brittle', n: f[1] }); break;
        case 'knot': for (var q = 0; q < f[1]; q++) c.discard.push({ uid: st.uid++, id: 'knot', up: 0, temp: 1 }); ev.push({ e: 'knot', n: f[1] }); break;
        case 'tense': addTension(st, ev, f[1]); break;
        case 'slackP': var sl = Math.min(c.T, f[1]); c.T -= sl; ev.push({ e: 'tension', n: -sl, T: c.T }); break;
      }
    }
  }

  function endTurn(st, ev) {
    var c = st.combat;
    // knots in hand pull the thread tighter
    var knots = c.hand.filter(function (x) { return x.id === 'knot'; }).length;
    if (knots) addTension(st, ev, knots * CONFIG.KNOT_TENSION);
    if (st.phase !== 'combat') return;
    c.discard = c.discard.concat(c.hand); c.hand = [];
    var slack = CONFIG.SLACK + (hasCharm(st, 'linen') ? 1 : 0);
    var s2 = Math.min(c.T, slack); c.T -= s2; ev.push({ e: 'tension', n: -s2, T: c.T });
    if (c.dull > 0) c.dull--; if (c.brittle > 0) c.brittle--;
    ev.push({ e: 'enemyTurn' });
    for (var i = 0; i < c.enemies.length; i++) {
      var e = c.enemies[i];
      if (e.hp <= 0) continue;
      e.block = 0;
      ev.push({ e: 'enemyMove', i: i, name: e.intent.name });
      runEnemyFx(st, ev, i, e.intent.fx, e.intent.name);
      if (st.phase !== 'combat') return;
      e.hist.push(e.mi);
    }
    c.enemies.forEach(function (e, i) {
      if (e.hp <= 0) return;
      if (e.dull > 0) e.dull--; if (e.brittle > 0) e.brittle--;
      chooseIntent(st, i);
    });
    startTurn(st, ev);
  }

  function cardReward(st, key, oddsKey, n) {
    var rs = { s: hash(st.seed, key, 'cards') };
    var pool = Object.keys(CARDS).filter(function (k) { var r = CARDS[k].rarity; return r === 'common' || r === 'uncommon' || r === 'rare'; });
    var out = [], guard = 0;
    while (out.length < n && guard++ < 100) {
      var rar = pickW(rs, ['common', 'uncommon', 'rare'], CONFIG.ODDS[oddsKey]);
      var opts = pool.filter(function (k) { return CARDS[k].rarity === rar && out.indexOf(k) < 0; });
      if (opts.length) out.push(opts[rint(rs, 0, opts.length - 1)]);
    }
    return out;
  }
  function randomCharm(st, key) {
    var rs = { s: hash(st.seed, key, 'charm') };
    var opts = CHARM_POOL.filter(function (k) { return st.charms.indexOf(k) < 0; });
    if (!opts.length) return null;
    return opts[rint(rs, 0, opts.length - 1)];
  }
  function gainCharm(st, ev, k) {
    if (!k || st.charms.indexOf(k) >= 0) return;
    st.charms.push(k); ev.push({ e: 'charm', k: k });
    if (k === 'spool') { st.maxHp += 10; st.hp += 10; }
  }

  function winCombat(st, ev) {
    var c = st.combat;
    st.stats.fights++;
    if (c.kind === 'elite') st.stats.elites++;
    st.log.push({ t: 'fight', row: st.map.nodes[c.node].r, kind: c.kind, names: c.enemies.map(function (e) { return e.name; }), turns: c.turn, hpLost: Math.max(0, c.hpStart - st.hp) });
    ev.push({ e: 'win', kind: c.kind });
    if (c.kind === 'boss') { st.combat = null; endRun(st, ev, true, null); return; }
    var heal = hasCharm(st, 'teacup') ? Math.min(4, st.maxHp - st.hp) : 0; st.hp += heal;
    var key = c.node;
    var gs = { s: hash(st.seed, key, 'gold') };
    var g = c.kind === 'elite' ? rint(gs, CONFIG.GOLD_ELITE[0], CONFIG.GOLD_ELITE[1]) : rint(gs, CONFIG.GOLD_FIGHT[0], CONFIG.GOLD_FIGHT[1]);
    if (hasCharm(st, 'purse')) g += 8;
    st.gold += g;
    var charm = c.kind === 'elite' ? randomCharm(st, key) : null;
    if (charm) gainCharm(st, ev, charm);
    st.reward = { gold: g, heal: heal, cards: cardReward(st, key, c.kind === 'elite' ? 'elite' : 'normal', 3), charm: charm };
    st.combat = null;
    st.phase = 'reward';
  }

  function computeScore(st, won) {
    var S = CONFIG.SCORE;
    return st.stats.rows * S.row + st.stats.kills * S.kill + (won ? S.win + st.hp * S.hpOnWin : 0) + Math.floor(st.gold / S.goldDiv);
  }

  function endRun(st, ev, won, src) {
    st.phase = won ? 'victory' : 'defeat';
    if (won) st.stats.rows = CONFIG.ROWS + 1;
    st.score = computeScore(st, won);
    st.end = { won: won, by: src ? { name: src.name, move: src.move || null } : null, row: st.pos ? st.map.nodes[st.pos].r : 0 };
    st.log.push({ t: won ? 'won' : 'lost', by: st.end.by });
    st.combat = st.combat || null;
    ev.push({ e: won ? 'victory' : 'defeat' });
  }

  function upgradeable(st) { return st.deck.filter(function (x) { var d = CARDS[x.id]; return !x.up && d.up; }); }

  function enterNode(st, ev, id) {
    var n = st.map.nodes[id];
    st.pos = id; st.visited.push(id);
    if (n.r > 0 || n.type === 'B') st.stats.rows = Math.max(st.stats.rows, n.r);
    ev.push({ e: 'enter', id: id, type: n.type });
    if (n.type === 'F' || n.type === 'E' || n.type === 'B') startCombat(st, ev, n);
    else if (n.type === 'R') { st.phase = 'rest'; st.rest = { done: false }; }
    else if (n.type === 'M') {
      var cards = cardReward(st, id, 'market', 4);
      st.market = { cards: cards.map(function (k) { return { id: k, price: CONFIG.PRICE[CARDS[k].rarity], sold: false }; }),
        charm: randomCharm(st, id), charmSold: false, chipPrice: CONFIG.PRICE.chip + CONFIG.PRICE.chipStep * st.chipCount, chipUsed: false };
      st.phase = 'market';
    } else if (n.type === 'S') {
      var keys = Object.keys(SHRINES);
      st.shrine = { key: keys[hash(st.seed, id, 'shrine') % keys.length], done: false };
      st.phase = 'shrine';
    }
  }

  function findDeck(st, uid) { for (var i = 0; i < st.deck.length; i++) if (st.deck[i].uid === uid) return i; return -1; }

  function runShrineFx(st, ev, fx, uid) {
    for (var i = 0; i < fx.length; i++) {
      var f = fx[i];
      switch (f[0]) {
        case 'hurt': st.hp = Math.max(1, st.hp - f[1]); ev.push({ e: 'hurt', n: f[1], blocked: 0 }); break;
        case 'heal': var h = Math.min(f[1], st.maxHp - st.hp); st.hp += h; ev.push({ e: 'heal', n: h }); break;
        case 'gold': st.gold += f[1]; ev.push({ e: 'gold', n: f[1] }); break;
        case 'maxHp': st.maxHp = Math.max(10, st.maxHp + f[1]); st.hp = Math.min(st.hp, st.maxHp); break;
        case 'rareCard':
          var rs = { s: hash(st.seed, st.pos, 'rare') };
          var rares = Object.keys(CARDS).filter(function (k) { return CARDS[k].rarity === 'rare'; });
          var k = rares[rint(rs, 0, rares.length - 1)];
          st.deck.push({ uid: st.uid++, id: k, up: 0 }); ev.push({ e: 'addCard', id: k }); break;
        case 'charm': gainCharm(st, ev, randomCharm(st, st.pos)); break;
        case 'upRandom':
          var rs2 = { s: hash(st.seed, st.pos, 'up') };
          var ups = shuffle(rs2, upgradeable(st)).slice(0, f[1]);
          ups.forEach(function (x) { x.up = 1; ev.push({ e: 'upgrade', uid: x.uid }); }); break;
        case 'mend': var mi = findDeck(st, uid); if (mi >= 0 && !st.deck[mi].up && CARDS[st.deck[mi].id].up) { st.deck[mi].up = 1; ev.push({ e: 'upgrade', uid: uid }); } break;
        case 'chip': var ci = findDeck(st, uid); if (ci >= 0 && st.deck.length > 1) { ev.push({ e: 'chip', id: st.deck[ci].id }); st.deck.splice(ci, 1); } break;
      }
    }
  }

  // ---------- the single command boundary ----------
  function apply(state, cmd) {
    var st = clone(state), ev = [];
    var err = applyMut(st, ev, cmd);
    return { state: st, events: ev, error: err };
  }

  function applyMut(st, ev, cmd) {
    if (!cmd || !cmd.t) return 'bad command';
    switch (cmd.t) {
      case 'pick': {
        if (st.phase !== 'map') return 'not on map';
        if (reachable(st).indexOf(cmd.id) < 0) return 'unreachable';
        enterNode(st, ev, cmd.id); return null;
      }
      case 'play': {
        if (st.phase !== 'combat') return 'not in combat';
        return playCard(st, ev, cmd.uid, cmd.target);
      }
      case 'end': {
        if (st.phase !== 'combat') return 'not in combat';
        endTurn(st, ev); return null;
      }
      case 'reward': {
        if (st.phase !== 'reward') return 'no reward';
        var R = st.reward;
        if (cmd.kind === 'card') {
          if (R.cards.indexOf(cmd.id) < 0) return 'not offered';
          st.deck.push({ uid: st.uid++, id: cmd.id, up: 0 }); ev.push({ e: 'addCard', id: cmd.id });
        } else if (cmd.kind === 'chip') {
          var i = findDeck(st, cmd.uid); if (i < 0 || st.deck.length <= 1) return 'bad chip';
          ev.push({ e: 'chip', id: st.deck[i].id }); st.deck.splice(i, 1);
        } else if (cmd.kind !== 'skip') return 'bad reward';
        st.reward = null; st.phase = 'map'; return null;
      }
      case 'rest': {
        if (st.phase !== 'rest') return 'not resting';
        if (cmd.kind === 'heal') { var h = Math.min(Math.round(st.maxHp * CONFIG.REST_HEAL), st.maxHp - st.hp); st.hp += h; ev.push({ e: 'heal', n: h }); }
        else if (cmd.kind === 'mend') {
          var j = findDeck(st, cmd.uid); if (j < 0 || st.deck[j].up || !CARDS[st.deck[j].id].up) return 'cannot mend';
          st.deck[j].up = 1; ev.push({ e: 'upgrade', uid: cmd.uid });
        } else return 'bad rest';
        st.rest = null; st.phase = 'map'; return null;
      }
      case 'buy': {
        if (st.phase !== 'market') return 'not in market';
        var M = st.market;
        if (cmd.kind === 'card') {
          var it = M.cards[cmd.slot]; if (!it || it.sold || st.gold < it.price) return 'cannot buy';
          st.gold -= it.price; it.sold = true; st.deck.push({ uid: st.uid++, id: it.id, up: 0 }); ev.push({ e: 'addCard', id: it.id });
        } else if (cmd.kind === 'charm') {
          if (!M.charm || M.charmSold || st.gold < CONFIG.PRICE.relic) return 'cannot buy';
          st.gold -= CONFIG.PRICE.relic; M.charmSold = true; gainCharm(st, ev, M.charm);
        } else if (cmd.kind === 'chip') {
          var k = findDeck(st, cmd.uid);
          if (M.chipUsed || k < 0 || st.gold < M.chipPrice || st.deck.length <= 1) return 'cannot chip';
          st.gold -= M.chipPrice; M.chipUsed = true; st.chipCount++; ev.push({ e: 'chip', id: st.deck[k].id }); st.deck.splice(k, 1);
        } else return 'bad buy';
        return null;
      }
      case 'leave': {
        if (st.phase !== 'market') return 'not in market';
        st.market = null; st.phase = 'map'; return null;
      }
      case 'shrine': {
        if (st.phase !== 'shrine') return 'no shrine';
        var S = SHRINES[st.shrine.key], o = S.opts[cmd.opt];
        if (!o) return 'bad option';
        if (o.need && st.gold < o.need) return 'not enough gold';
        var needsCard = o.fx.some(function (f) { return f[0] === 'mend' || f[0] === 'chip'; });
        if (needsCard) {
          var di = findDeck(st, cmd.uid); if (di < 0) return 'pick a card';
          if (o.fx[0][0] === 'mend' && (st.deck[di].up || !CARDS[st.deck[di].id].up)) return 'cannot mend';
          if (o.fx[0][0] === 'chip' && st.deck.length <= 1) return 'cannot chip';
        }
        runShrineFx(st, ev, o.fx, cmd.uid);
        st.log.push({ t: 'shrine', name: S.name, opt: o.label });
        st.shrine = null; st.phase = 'map'; return null;
      }
    }
    return 'unknown command';
  }

  // ---------- validation (content + saves) ----------
  function validateContent() {
    var errs = [];
    Object.keys(CARDS).forEach(function (k) {
      var d = CARDS[k];
      if (!d.name || typeof d.cost !== 'number') errs.push('card ' + k + ' missing name/cost');
      (d.fx || []).forEach(function (f) { if (f[0] === 'power' && !POWERS[f[1]]) errs.push('card ' + k + ' unknown power ' + f[1]); });
      if (d.up && d.up.fx) d.up.fx.forEach(function (f) { if (f[0] === 'power' && !POWERS[f[1]]) errs.push('card ' + k + ' up unknown power'); });
    });
    Object.keys(CHARS).forEach(function (k) {
      CHARS[k].deck.forEach(function (id) { if (!CARDS[id]) errs.push('char ' + k + ' bad card ' + id); });
      if (!CHARMS[CHARS[k].charm]) errs.push('char ' + k + ' bad charm');
    });
    Object.keys(ENCOUNTERS).forEach(function (k) { ENCOUNTERS[k].forEach(function (enc) { enc.forEach(function (e) { if (!ENEMIES[e]) errs.push('encounter bad enemy ' + e); }); }); });
    Object.keys(ENEMIES).forEach(function (k) { if (!ENEMIES[k].moves.length) errs.push('enemy ' + k + ' no moves'); });
    CHARM_POOL.forEach(function (k) { if (!CHARMS[k]) errs.push('pool bad charm ' + k); });
    return errs;
  }

  function validateSave(st) {
    var errs = [];
    function need(c, m) { if (!c) errs.push(m); }
    need(st && typeof st === 'object', 'not an object');
    if (errs.length) return errs;
    need(st.v === CONFIG.SAVE_V, 'save version');
    need(['map', 'combat', 'reward', 'rest', 'market', 'shrine', 'victory', 'defeat'].indexOf(st.phase) >= 0, 'phase');
    need(typeof st.hp === 'number' && st.hp >= 0 && typeof st.maxHp === 'number' && st.hp <= st.maxHp + 0.001, 'hp');
    need(typeof st.gold === 'number' && st.gold >= 0, 'gold');
    need(Array.isArray(st.deck) && st.deck.length > 0 && st.deck.every(function (c) { return c && CARDS[c.id] && typeof c.uid === 'number'; }), 'deck');
    need(Array.isArray(st.charms) && st.charms.every(function (k) { return CHARMS[k]; }), 'charms');
    need(st.map && st.map.nodes && st.map.rows && st.map.nodes.boss, 'map');
    need(st.pos === null || (st.map && st.map.nodes && st.map.nodes[st.pos]), 'pos');
    need(CHARS[st.char], 'char');
    if (st.phase === 'combat') {
      var c = st.combat;
      need(c && Array.isArray(c.hand) && Array.isArray(c.draw) && Array.isArray(c.discard) && Array.isArray(c.enemies) && c.enemies.length, 'combat');
      if (c && c.enemies) need(c.enemies.every(function (e) { return ENEMIES[e.key] && e.intent && typeof e.hp === 'number'; }), 'enemies');
      if (c && c.hand) need(c.hand.concat(c.draw || [], c.discard || []).every(function (x) { return x && CARDS[x.id]; }), 'piles');
      if (c) need(c.rng && typeof c.rng.s === 'number', 'combat rng');
    }
    if (st.phase === 'reward') need(st.reward && Array.isArray(st.reward.cards), 'reward');
    if (st.phase === 'market') need(st.market && Array.isArray(st.market.cards), 'market');
    if (st.phase === 'shrine') need(st.shrine && SHRINES[st.shrine.key], 'shrine');
    return errs;
  }

  function dailySeed(date) {
    var d = date || new Date();
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return { key: key, seed: hash('snapthread-daily', key) };
  }

  var Rules = {
    newRun: newRun, apply: apply, applyMut: applyMut, reachable: reachable, canPlay: canPlay, needsTarget: needsTarget,
    cardCost: cardCost, cardFx: cardFx, describe: describe, intentDamage: intentDamage, incoming: incoming,
    upgradeable: upgradeable, computeScore: computeScore, makeMap: makeMap, dailySeed: dailySeed, whipHits: whipHits
  };
  var Validate = { content: validateContent, save: validateSave };
  return { CONFIG: CONFIG, DATA: DATA, RNG: RNG, Rules: Rules, Validate: Validate, clone: clone };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ST;
