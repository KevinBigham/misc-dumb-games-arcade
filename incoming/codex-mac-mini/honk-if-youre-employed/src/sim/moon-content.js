/** Gameplay content is data. No dates, browser state, or presentation-owned mutation. */
export const MOON_LOADOUTS = Object.freeze([
  { id: 'classic', name: 'The Original Sin', short: 'CLASSIC', tagline: 'A dependable little appliance. Deeply undependable reality.', hp: 5, speed: 285, rate: 13, magnet: 75, dash: 85, color: '#fc8ba4', perk: 'Balanced toast, speed & health', symbol: '▣' },
  { id: 'courier', name: 'The Bread Runner', short: 'COURIER', tagline: 'Fast feet. Magnetic personality. Questionable insurance.', hp: 4, speed: 335, rate: 14, magnet: 125, dash: 65, color: '#96d9ce', perk: 'Fast skates · bigger pickup radius · 4 hearts', symbol: '↯' },
  { id: 'tank', name: 'The Waffle Witness', short: 'WAFFLE', tagline: 'Has seen everything. Has processed absolutely none of it.', hp: 7, speed: 245, rate: 16, magnet: 65, dash: 105, color: '#f3bd7e', perk: '7 hearts · sturdy shots · slower skates', symbol: '▦' },
]);
export const MOON_DIFFICULTIES = Object.freeze([
  { id: 'daydream', name: 'Daydream', description: 'Extra hearts. Slower trouble. Same nonsense.', speed: 0.8, spawn: 1.18, hp: 2, score: 0.8, bossHp: 170 },
  { id: 'night', name: 'Night shift', description: 'The intended dose of existential nonsense.', speed: 1, spawn: 1, hp: 0, score: 1, bossHp: 220 },
  { id: 'fever', name: 'Fever dream', description: 'Less health. More trouble. 40% more points.', speed: 1.19, spawn: 0.78, hp: -1, score: 1.4, bossHp: 280 },
]);
export const MOON_UPGRADES = Object.freeze([
  { id: 'spread', name: 'A second breakfast', tag: 'MORE TOAST', description: 'Fire three slices at once. A balanced diet is a firing pattern.', symbol: '×3' },
  { id: 'rapid', name: 'Espresso possession', tag: 'FASTER TOAST', description: 'About 35% less time between slices. Your warranty is now a suggestion.', symbol: '↯' },
  { id: 'magnet', name: 'Dental magnetism', tag: 'EASIER RENT', description: 'Pull teeth from far away. The moon accepts remote deposits.', symbol: '◎' },
  { id: 'heart', name: 'Emotional support egg', tag: 'MORE LIFE', description: 'Gain two heart slots and refill your health. Egg believes in you.', symbol: '♡' },
  { id: 'power', name: 'Legally a crouton', tag: 'HEAVY TOAST', description: 'Double toast damage. Crunch is now legally enforceable.', symbol: '✳' },
  { id: 'burp', name: 'Carbonated thoughts', tag: 'BIGGER BURPS', description: 'Burps charge twice as fast and reach the entire room.', symbol: '◌' },
  { id: 'orbit', name: 'Personal space bagels', tag: 'ORBITAL DEFENSE', description: 'Two loyal bagels orbit you, crunching enemies and blocking bullets.', symbol: '∞' },
  { id: 'pierce', name: 'Bread without borders', tag: 'PIERCING SHOTS', description: 'Each slice travels through three enemies. Extremely inclusive.', symbol: '⇶' },
  { id: 'ricochet', name: 'Return to bready', tag: 'BOUNCING TOAST', description: 'Toast bounces off two walls. Your mistakes become opportunities.', symbol: '↗' },
  { id: 'refund', name: 'Reverse customer service', tag: 'DASH REFLECTS', description: 'Dash into pink bullets to return them with emotional interest.', symbol: '↶' },
  { id: 'tips', name: 'The tooth fairy union', tag: 'RENT HEALS', description: 'Every 12 deposited teeth restores a heart. Dental benefits, finally.', symbol: '✚' },
  { id: 'severance', name: 'Explosive resignation', tag: 'CHAIN REACTIONS', description: 'Defeated enemies explode, damaging nearby colleagues. Exit loudly.', symbol: '✹' },
]);
export const MOON_LAWS = Object.freeze([
  { id: 'soup', name: 'THE FLOOR IS SOUP', description: 'Slippery skates. Delicious consequences.' },
  { id: 'bogo', name: 'BUY ONE. GET CHAOS.', description: 'Everyone gets extra projectiles. Including you.' },
  { id: 'tiny', name: 'YOU ARE TRAVEL-SIZED', description: 'Tiny toaster. Huge speed. Same emotional baggage.' },
  { id: 'magnet', name: 'TEETH LOVE YOU NOW', description: 'All teeth are attracted to your problems.' },
  { id: 'legs', name: 'THE MOON HAS LEGS NOW', description: 'Your landlord is taking a walk. Follow the rent arrow.' },
  { id: 'refund', name: 'CUSTOMER SERVICE IS REVERSED', description: 'Dash through pink bullets to send them back as toast.' },
]);
export const MOON_ACHIEVEMENTS = Object.freeze([
  { id: 'first-rent', name: 'A mouthful of rent', description: 'Pay your first rent bill.', symbol: '◡' },
  { id: 'union', name: 'Abolish the Sun', description: 'Finish a complete night shift.', symbol: '☼' },
  { id: 'flawless', name: 'Factory condition', description: 'Defeat the Sun without losing a heart.', symbol: '◇' },
  { id: 'streak', name: 'Serial bruncher', description: 'Toast 20 enemies in one streak.', symbol: '×' },
  { id: 'burp-five', name: 'Indoor voice', description: 'Toast five enemies with one burp.', symbol: '◌' },
  { id: 'portal', name: 'Wrong door. Right answer.', description: 'Use an unauthorized door.', symbol: '∩' },
  { id: 'reflect', name: 'Per my last toast', description: 'Reflect 10 hostile bullets in a run.', symbol: '↶' },
  { id: 'overtime', name: 'Cannot take a hint', description: 'Volunteer for overtime after winning.', symbol: '∞' },
  { id: 'fever-win', name: 'Medically inadvisable', description: 'Defeat the Sun in a Fever dream.', symbol: '↯' },
  { id: 'all-builds', name: 'Appliance alliance', description: 'Win with all three toaster builds.', symbol: '▦' },
]);
export const MOON_ENEMY_GUIDE = Object.freeze([
  { id: 'clock', name: 'Anxiety clock', description: 'It chases you. It is always late. Keep moving.', shift: 1 },
  { id: 'mail', name: 'Unopened correspondence', description: 'Keeps its distance and fires pink slips. Close the gap.', shift: 1 },
  { id: 'fish', name: 'Fish from accounting', description: 'Takes three hits, pays three teeth. No expense is approved.', shift: 1 },
  { id: 'chair', name: 'A chair with ambitions', description: 'Locks a charge direction before rushing. Sidestep the dotted line.', shift: 2 },
  { id: 'phone', name: 'Your childhood telephone', description: 'Calls down a red danger circle. Get out before it rings.', shift: 3 },
]);
export const MOON_QUOTES = Object.freeze([
  '“Excellent. These teeth will look wonderful in my teeth.”',
  '“The fish from accounting is not authorized to have feelings.”',
  '“You have been promoted to the same job, but worse.”',
  '“I have spoken to the Sun. Unfortunately, the Sun has spoken back.”',
  '“Your emergency contact is a smaller, more frightened toaster.”',
  '“Please keep all existential crises inside the designated area.”',
  '“We do not offer dental. We receive dental.”',
  '“Reality is a privilege. We can revoke it.”',
  '“The door is not a metaphor. The other door might be.”',
]);
