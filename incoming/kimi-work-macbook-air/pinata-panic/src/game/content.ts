export const CFG = {
  arenaX: 13,
  arenaZ: 10,
  playerSpeed: 6.4,
  playerAcceleration: 22,
  dashSpeed: 16,
  dashDuration: 0.25,
  dashCooldown: 1.75,
  throwCost: 3,
  throwRange: 8,
  maxGuests: 44,
  maxCandies: 110,
  maxParticles: 260,
  bankRate: 10,
  hitInvulnerability: 1.45,
  startingCandy: 18,
} as const;

export interface WaveSpec {
  name: string;
  kicker: string;
  quota: number;
  seconds: number;
  guests: number;
  rule: string;
}

export const WAVES: readonly WaveSpec[] = [
  {
    name: "ARRIVAL",
    kicker: "THE GUESTS HAVE ARRIVED. UNFORTUNATELY, SO HAVE YOU.",
    quota: 18,
    seconds: 58,
    guests: 4,
    rule: "Bank candy. Do not become the entertainment.",
  },
  {
    name: "MUSICAL CHAIRS",
    kicker: "THE MUSIC HAS STOPPED. THE CHAIRS HAVE NOT.",
    quota: 26,
    seconds: 65,
    guests: 6,
    rule: "When the music stops, stand by a glowing chair — or dodge.",
  },
  {
    name: "CONGA OF CONSEQUENCES",
    kicker: "THE LINE IS COMING. THE LINE DOES NOT NEGOTIATE.",
    quota: 32,
    seconds: 70,
    guests: 8,
    rule: "Watch the floor lanes. Conga lines cannot be distracted.",
  },
  {
    name: "THE CAKE ESCAPES",
    kicker: "IT REMEMBERS WHAT YOU DID TO ITS COUSIN.",
    quota: 38,
    seconds: 76,
    guests: 9,
    rule: "The cake telegraphs its charge. Make it hit your problems.",
  },
  {
    name: "THE BIRTHDAY CHILD",
    kicker: "SOMEONE MADE A WISH. IT WAS A TERRIBLE WISH.",
    quota: 46,
    seconds: 90,
    guests: 11,
    rule: "Bank the final quota. Avoid the wish slam. End this party.",
  },
] as const;

export type UpgradeId =
  | "speed"
  | "candy"
  | "shield"
  | "decoy"
  | "dash"
  | "sour"
  | "bank"
  | "knockback"
  | "magnet"
  | "combo"
  | "regen"
  | "gifts";

export interface UpgradeSpec {
  id: UpgradeId;
  icon: string;
  name: string;
  description: string;
  footnote: string;
  max: number;
}

export const UPGRADES: readonly UpgradeSpec[] = [
  { id: "speed", icon: "♞", name: "CARDIO LLAMA", description: "+14% scampering speed.", footnote: "Legs were a mistake. Make them faster.", max: 3 },
  { id: "candy", icon: "◆", name: "DOUBLE-STUFFED", description: "+12 candy immediately. +4 each new wave.", footnote: "A structural decision you will regret.", max: 3 },
  { id: "shield", icon: "⬡", name: "HARD CANDY SHELL", description: "Block one grab every wave.", footnote: "Now with 30% more emotional armor.", max: 2 },
  { id: "decoy", icon: "◎", name: "CHIC DECOYS", description: "+45% bait range and +4s bait lifetime.", footnote: "This season, candy is everywhere.", max: 2 },
  { id: "dash", icon: "➜", name: "PANIC! LONGER", description: "Dash recharges 22% faster.", footnote: "Cardio, but with worse intentions.", max: 3 },
  { id: "sour", icon: "✦", name: "SOUR PATCH", description: "Eaten bait stuns guests instead of hyping them.", footnote: "Weaponized poor taste.", max: 1 },
  { id: "bank", icon: "▣", name: "BANK SYNDICATE", description: "+35% banking speed and +25% score.", footnote: "Extremely legitimate party accounting.", max: 2 },
  { id: "knockback", icon: "✹", name: "CONFETTI RECOIL", description: "Dashing launches nearby guests.", footnote: "An opinion, delivered physically.", max: 1 },
  { id: "magnet", icon: "∪", name: "MAGNETIC PERSONALITY", description: "+70% candy pickup radius.", footnote: "People find you attractive. Mostly candy.", max: 2 },
  { id: "combo", icon: "×", name: "DRAMA LLAMA", description: "Start each bank streak at ×2.", footnote: "Every deposit deserves an audience.", max: 1 },
  { id: "regen", icon: "♻", name: "REGENERATIVE FRINGE", description: "Regrow 1 candy every 9s when nearly empty.", footnote: "Biology has left the building.", max: 2 },
  { id: "gifts", icon: "□", name: "BIRTHDAY CRIMINAL", description: "Presents contain +4 extra candy.", footnote: "The wrapping paper never stood a chance.", max: 2 },
] as const;

export const PARTY_LINES = {
  idle: [
    "THE GUESTS ARE FILING A NOISE COMPLAINT AGAINST YOUR LEGS.",
    "STANDING STILL IS A BOLD PARTY STRATEGY.",
    "THE CAKE HAS ASKED FOR YOUR ESTIMATED TIME OF DESSERT.",
  ],
  bank: [
    "CANDY SECURED. DIGNITY REMAINS PENDING.",
    "THE GOODY BAG ACCEPTS YOUR QUESTIONABLE DEPOSIT.",
    "YOUR SUCCESS HAS BEEN REPORTED TO THE BIRTHDAY CHILD.",
  ],
  empty: [
    "YOU ARE OUT OF CANDY AND FULL OF BAD IDEAS.",
    "EMPTY PIÑATA. ONE MORE GRAB ENDS THE PARTY.",
    "FIND CANDY. YOUR INSIDES ARE A PUBLIC SERVICE.",
  ],
  rush: [
    "SUGAR RUSH! THIS IS WHY WE CANNOT HAVE NICE THINGS.",
    "A GUEST HAS DISCOVERED CAFFEINE'S COOL AUNT.",
    "THE DECOY WORKED. THE CONSEQUENCES ARE NOW FASTER.",
  ],
} as const;
