/** Original fiction. Memory order is shuffled by the simulation's seeded RNG. */
export const MEMORIES = Object.freeze([
  { name: 'Mara', role: 'night-shift nurse', text: 'My father always cut the sandwiches diagonally. He said they tasted braver.' },
  { name: 'Ivo', role: 'bus driver', text: 'There was a stop nobody used. I stopped anyway. Just in case.' },
  { name: 'June', role: 'eight years old', text: 'The moon followed our car. Dad said it liked our music.' },
  { name: 'Sol', role: 'gardener', text: 'I planted a tree knowing I would never sit in its shade.' },
  { name: 'Ada', role: 'piano tuner', text: 'She played the wrong note at our wedding. It became my favorite part.' },
  { name: 'Ren', role: 'dishwasher', text: 'The chef saved the burnt edges for me. He pretended nobody else wanted them.' },
  { name: 'Lea', role: 'astronomer', text: 'The first star I showed my daughter was actually a plane. She was still amazed.' },
  { name: 'Emil', role: 'retired teacher', text: 'A student came back twenty years later. I had forgotten the lesson. She had not.' },
  { name: 'Noor', role: 'mechanic', text: 'My brother called every Sunday. Mostly we just listened to each other make dinner.' },
  { name: 'Paz', role: 'lifeguard', text: 'She was terrified of the deep end. One day she let go of the wall.' },
  { name: 'Kit', role: 'street musician', text: 'Nobody stopped for the song, except a dog. I played an encore.' },
  { name: 'Sana', role: 'baker', text: 'My mother measured everything with a cup that had no markings.' },
  { name: 'Oren', role: 'librarian', text: 'Someone underlined “you are not alone” in every copy. I never erased it.' },
  { name: 'Bea', role: 'postal worker', text: 'He sent himself birthday cards. I always delivered them first.' },
  { name: 'Tao', role: 'cook', text: 'Our family recipe began with an argument about the family recipe.' },
  { name: 'Wren', role: 'sound engineer', text: 'I kept the recording after the concert ended. You could hear everyone breathing.' },
  { name: 'Luis', role: 'tailor', text: 'She wanted pockets in her wedding dress. For snacks, she said.' },
  { name: 'Faye', role: 'train conductor', text: 'Every morning, a man waved from the same bridge. Once, we all waved back.' },
  { name: 'Nico', role: 'swimming coach', text: 'He finished last. His teammates cheered like he had won the world.' },
  { name: 'Eli', role: 'cartographer', text: 'The best place I ever found was not on the map I was making.' },
  { name: 'Alma', role: 'electrician', text: 'When the power came back, the whole street applauded the light.' },
  { name: 'Rafi', role: 'photographer', text: 'The photo was out of focus. I could still recognize her laugh.' },
  { name: 'Mae', role: 'accountant', text: 'We spent the emergency money on a trip. For once, nothing went wrong.' },
  { name: 'Otis', role: 'janitor', text: 'After everyone left, I danced on the stage I had just swept.' },
  { name: 'Cleo', role: 'translator', text: 'There was no word for it in his language. So he made me tea.' },
  { name: 'Ash', role: 'paramedic', text: 'I do not remember what I said. I remember that I stayed.' },
  { name: 'Lumi', role: 'seamstress', text: 'He wore the sweater inside out for a year. The soft part was on the outside.' },
  { name: 'Dara', role: 'comedian', text: 'The worst joke I ever told made my mother laugh the hardest.' },
  { name: 'Hugo', role: 'fisherman', text: 'We never caught anything on Tuesdays. That was why we liked Tuesdays.' },
  { name: 'Vera', role: 'chemist', text: 'I knew exactly why the sunset was red. It did not make it less beautiful.' },
  { name: 'Rosa', role: 'sculptor', text: 'The crack appeared overnight. People thought I had put it there on purpose.' },
  { name: 'Finn', role: 'nine years old', text: 'I buried my robot so it could grow into a bigger robot.' },
  { name: 'Milo', role: 'barista', text: 'He ordered two coffees for a month after she died. I made both.' },
  { name: 'Esme', role: 'violinist', text: 'The audience was three people. I played like it was three thousand.' },
  { name: 'Yara', role: 'farmer', text: 'After the flood, the neighbors brought seeds instead of flowers.' },
  { name: 'Jules', role: 'architect', text: 'My favorite building was the blanket fort my sister made.' },
]);

export const NIGHT_NAMES = ['THE FIRST STRANGERS', 'A USEFUL SACRIFICE', 'THE PEOPLE WE BECOME', 'WHO GETS A TOMORROW', 'THE LONGEST NIGHT'];
export const NIGHT_LINES = [
  'The world did not end all at once. First, it stopped remembering.',
  'The machine has learned what a memory is worth. Have you?',
  'A person is more than the useful parts. Even now.',
  'There are still voices outside the wall.',
  'The Editor is coming. It calls forgetting a form of peace.',
];

/** Choices grant real mechanical differences. None is presented as a moral score. */
export const COUNCILS = Object.freeze([
  { title: 'What deserves a second chance?', line: 'The archive can become a weapon, a shelter, or something more efficient.', choices: [
    { id: 'fork', name: 'Keep the rough edges', tag: 'WEAPON · SPLIT SIGNAL', description: 'Your weapon fires two diverging bolts. Nobody loses a memory.', effect: '2 bolts per shot · wider spread', thought: '“Contradictions are not errors.”' },
    { id: 'shelter', name: 'Build a place to return', tag: 'SANCTUARY · RESTORATION', description: 'Repair the archive and expand its healing field. You heal twice as fast inside.', effect: '+35 archive · larger sanctuary · 2× healing', thought: '“Survival needs somewhere to sit down.”' },
    { id: 'engine', name: 'Make the past useful', tag: 'POWER · ONE MEMORY', description: 'Burn the next memory for a permanent weapon overclock. Its person stays alive.', effect: '−1 memory · fire 45% faster', thought: '“They would want it to mean something.”', requiresMemory: true },
  ] },
  { title: 'How much can one person carry?', line: 'More people are finding the light. You cannot be everywhere.', choices: [
    { id: 'caravan', name: 'No one walks alone', tag: 'RESCUE · CARAVAN', description: 'Escort up to six people at once. Run faster while someone follows you.', effect: 'Escort limit 3 → 6 · +20% escort speed', thought: '“The slowest person sets our pace.”' },
    { id: 'sentinel', name: 'Teach the light to fight', tag: 'DEFENSE · SENTINEL', description: 'Build an automatic turret at the archive. Its power draw reduces your movement speed.', effect: 'Archive turret · −12% movement speed', thought: '“A safe place is worth moving slowly for.”' },
    { id: 'mercy', name: 'Give forgetting a purpose', tag: 'PULSE · AFTERCARE', description: 'Every memory pulse also repairs the archive and restores your health.', effect: 'Pulse adds +25 archive and +30 health', thought: '“We can at least make the loss count.”' },
  ] },
  { title: 'Who decides what is kept?', line: 'The archive is not neutral. It keeps whatever you give it.', choices: [
    { id: 'precision', name: 'Protect the particular', tag: 'WEAPON · PRECISION', description: 'Your bolts pierce three enemies and deal more damage. Rescue remains hands-on.', effect: '+35% damage · 3-target penetration', thought: '“Every name. Even the difficult ones.”' },
    { id: 'magnet', name: 'Make room for strangers', tag: 'RESCUE · OPEN SIGNAL', description: 'People hear your signal from farther away. Every rescue repairs the archive.', effect: '3× recruitment radius · +5 archive per rescue', thought: '“Belonging should not require an invitation.”' },
    { id: 'erase', name: 'Simplify the story', tag: 'POWER · TWO MEMORIES', description: 'Burn the next two memories to create a protective orbit of destructive light.', effect: '−2 memories · damaging orbital shield', thought: '“A cleaner history. A stronger future.”', memoryCost: 2 },
  ] },
  { title: 'There is knocking at the gate.', line: 'One more night. You can hear people outside. So can the dark.', choices: [
    { id: 'open', name: 'Leave the gate open', tag: 'FINAL NIGHT · OPEN DOOR', description: 'Six extra people arrive immediately. The signal also draws a stronger swarm.', effect: '+6 people to rescue · 25% more enemies', thought: '“There is no us without a way in.”' },
    { id: 'beacon', name: 'Send someone to guide them', tag: 'FINAL NIGHT · GUIDING LIGHT', description: 'Four extra people arrive already following you. Split your shield to power their signal.', effect: '+4 followers · −25 current health (minimum 1)', thought: '“A light is only useful if it reaches someone.”' },
    { id: 'closed', name: 'Close the gate', tag: 'FINAL NIGHT · FORTRESS', description: 'Turn away the six people at the gate. No more arrivals. Reinforce the archive and your weapon.', effect: '6 people turned away · +45 archive · +25% damage', thought: '“We owe something to the people already here.”' },
  ] },
]);

export const PROMISES = Object.freeze([
  { id: 'memory', name: 'No story gets burned.', description: 'Protect the record, even when forgetting would make you stronger.', short: 'Every story matters' },
  { id: 'people', name: 'No one gets left outside.', description: 'Bring every signal home. Even when the safer choice is to stay.', short: 'No one left behind' },
  { id: 'none', name: 'I will decide when I get there.', description: 'Make no promise before you know what keeping it will cost.', short: 'No promise made' },
]);

export const ENEMY_NOTES = Object.freeze({
  seeker: 'SEEKERS / Triangles hunt you. Keep moving; your gun handles the nearest threat.',
  siege: 'SIEGE / Diamonds attack the archive. Take them out before they reach the center.',
  ranged: 'SCRIBES / Five-point shapes shoot from a distance. Dash through their fire.',
  brute: 'BRUTES / Heavy hexagons hit the archive hard. Manual aim helps focus them down.',
  warden: 'WARDENS / A stranger is being redacted. Reach them or break the scanning ring.',
});
