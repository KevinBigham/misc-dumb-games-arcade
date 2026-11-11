import type { UpgradeDef } from "./types";

export const UPGRADES: UpgradeDef[] = [
  {
    id: "pressure", icon: "♨", name: "PRESSURE COOKER", max: 5,
    description: "+18% fire rate. The soup is now legally a firearm.",
    flavor: "Do not open during an active haunting.",
    apply: (p) => { p.stats.fireRate *= 1.18; },
  },
  {
    id: "chunks", icon: "◉", name: "CHUNKY WITH INTENT", max: 5,
    description: "+28% soup damage. Every chunk has a grudge.",
    flavor: "Now with 40% more unidentified solids.",
    apply: (p) => { p.stats.damage *= 1.28; },
  },
  {
    id: "croutons", icon: "✦", name: "CROUTON BUCKSHOT", max: 3,
    description: "+1 projectile per shot, with a wider spread.",
    flavor: "Tiny toast. Tremendous consequences.",
    apply: (p) => { p.stats.multishot += 1; },
  },
  {
    id: "caffeine", icon: "⚡", name: "CAFFEINATED BROTH", max: 4,
    description: "+12% move speed and +10% projectile speed.",
    flavor: "Your wheels can see through time now.",
    apply: (p) => { p.stats.speed *= 1.12; p.stats.projectileSpeed *= 1.1; },
  },
  {
    id: "trolley", icon: "♥", name: "REINFORCED TROLLEY", max: 4,
    description: "+25 maximum integrity and repair 35 integrity.",
    flavor: "Rated for five stars and one apocalypse.",
    apply: (p) => { p.stats.maxHp += 25; p.hp = Math.min(p.stats.maxHp, p.hp + 35); },
  },
  {
    id: "magnet", icon: "▰", name: "COUPON MAGNET", max: 3,
    description: "Larger pickup field and +25% coupon value.",
    flavor: "Extreme couponing is a contact sport.",
    apply: (p) => { p.stats.magnet += 2.2; p.stats.couponBonus += 0.25; },
  },
  {
    id: "ram", icon: "➤", name: "RAMMING SPEED", max: 4,
    description: "+22 dash damage. Become the traffic accident.",
    flavor: "Insurance does not cover acts of soup.",
    apply: (p) => { p.stats.dashDamage += 22; },
  },
  {
    id: "armor", icon: "⬡", name: "SPITE-BASED ARMOR", max: 4,
    description: "Take 12% less damage. Powered by pure resentment.",
    flavor: "Customer complaints finally have a use.",
    apply: (p) => { p.stats.armor = Math.min(0.6, p.stats.armor + 0.12); },
  },
  {
    id: "pierce", icon: "↠", name: "RECURRING NIGHTMARE", max: 3,
    description: "Soup pierces +1 additional enemy.",
    flavor: "It comes back. It always comes back.",
    apply: (p) => { p.stats.pierce += 1; },
  },
  {
    id: "yeast", icon: "✹", name: "YEAST MODE", max: 3,
    description: "Defeated groceries explode and damage their friends.",
    flavor: "This is not what gluten-free meant.",
    apply: (p) => { p.stats.explosive += 1; },
  },
  {
    id: "crouton", icon: "◆", name: "SENTIENT CROUTON", max: 3,
    description: "Gain an orbiting crouton that blends nearby enemies.",
    flavor: "It knows what you did at the salad bar.",
    apply: (p) => { p.stats.orbitals += 1; },
  },
  {
    id: "intern", icon: "♟", name: "UNPAID INTERN", max: 2,
    description: "A tiny haunted drone automatically shoots the nearest enemy.",
    flavor: "Paid entirely in exposure to eldritch horrors.",
    apply: (p) => { p.stats.drones += 1; },
  },
  {
    id: "hotsauce", icon: "♨", name: "ILLEGAL HOT SAUCE", max: 3,
    description: "Shots ignite groceries for stacking damage over time.",
    flavor: "Scoville rating: approximately yes.",
    apply: (p) => { p.stats.burn += 1; },
  },
  {
    id: "breakfast", icon: "☀", name: "SECOND BREAKFAST", max: 1,
    description: "Revive once at 50% integrity after a fatal hit.",
    flavor: "Death is just an aggressive lunch break.",
    apply: (p) => { p.stats.revive += 1; },
  },
  {
    id: "dashrepair", icon: "✚", name: "INSURANCE FRAUD", max: 3,
    description: "Dashing through danger repairs 3 integrity per enemy rammed.",
    flavor: "Act now. Adjusters hate this one weird cart.",
    apply: (p) => { p.hp = Math.min(p.stats.maxHp, p.hp + 20); p.stats.dashDamage += 8; },
  },
];
