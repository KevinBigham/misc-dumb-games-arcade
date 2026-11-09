import type { FormKind, LawDef, UpgradeDef } from "./types";
export const DEPARTMENTS = [
  { name: "GENERAL INBOX", code: "DEPT. 01", quota: 5, subtitle: "Orientation has been outsourced to you.", forms: ["standard", "standard", "urgent"] as FormKind[] },
  { name: "PAYROLL & PASTRY", code: "DEPT. 02", quota: 7, subtitle: "The carbon copies have unionized.", forms: ["standard", "urgent", "carbon", "standard"] as FormKind[] },
  { name: "COMPLIANCE", code: "DEPT. 03", quota: 9, subtitle: "Red tape is now a physical hazard.", forms: ["urgent", "carbon", "classified", "standard"] as FormKind[] },
  { name: "EXECUTIVE FLOOR", code: "DEPT. 04", quota: 10, subtitle: "Please audit responsibly.", forms: ["urgent", "carbon", "classified", "golden", "standard"] as FormKind[] },
] as const;
export const LAWS: LawDef[] = [
  { id: "walls", title: "ENTHUSIASTIC WALLS", detail: "Desk edges return 110% of your enthusiasm.", duration: 18 },
  { id: "friction", title: "FRICTION DISCONTINUED", detail: "The floor has been optimized. Brakes have not.", duration: 16 },
  { id: "adhesive", title: "ADHESIVE DESK", detail: "Movement is sticky. Slam radius is generous.", duration: 18 },
  { id: "fan", title: "CEILING FAN, FLOOR EDITION", detail: "A crosswind now has managerial approval.", duration: 18 },
  { id: "duck", title: "GRAVITY REPORTS TO THE DUCK", detail: "Loose paperwork answers to a higher power.", duration: 18 },
  { id: "jelly", title: "EVERYTHING IS JELLY", detail: "Forms bounce farther. Impacts feel wobblier.", duration: 18 },
  { id: "duplicate", title: "DUPLICATE EVERYTHING", detail: "New forms arrive with unsolicited siblings.", duration: 16 },
  { id: "tray", title: "OUT TRAY ON TOUR", detail: "Your destination no longer believes in sitting still.", duration: 20 },
  { id: "hole", title: "EFFICIENCY HOLE", detail: "It is very efficient. Nobody knows at what.", duration: 18 },
  { id: "lunch", title: "MANDATORY LUNCH BREATH", detail: "Deadlines pause briefly. Breathe. Stamp. Repeat.", duration: 10, helpful: true },
  { id: "coffee", title: "FREE COFFEE", detail: "Movement speed increased. Judgment unchanged.", duration: 12, helpful: true },
  { id: "birthday", title: "IT IS SOMEBODY'S BIRTHDAY", detail: "Golden forms arrive with cake-based deadlines.", duration: 14, helpful: true },
];
export const UPGRADES: UpgradeDef[] = [
  { id: "sole", icon: "◎", name: "SOLE PROVIDER", description: "+22% slam radius. Make a bigger impression.", flavor: "Technically, the footprint is a signature.", max: 3 },
  { id: "redink", icon: "◆", name: "RED INK AUTHORITY", description: "Classified forms need no heavy slam. +25% bank value.", flavor: "You have been promoted to a color.", max: 2 },
  { id: "ergonomic", icon: "↟", name: "ERGO-NOM-NOM", description: "+15% movement and less stack slowdown.", flavor: "The chair is jealous.", max: 3 },
  { id: "capacity", icon: "▤", name: "MIDDLE MANAGEMENT", description: "+3 stack capacity. Bigger stacks, bigger banks.", flavor: "More responsibility. Same desk.", max: 2 },
  { id: "extension", icon: "⌛", name: "EXTENSION CORD", description: "Banking adds 4 seconds to every active deadline.", flavor: "Time has been plugged into a power strip.", max: 3 },
  { id: "insurance", icon: "⬡", name: "INK INSURANCE", description: "Ignore the first shredding in each department.", flavor: "Covers acts of administrative god.", max: 1 },
  { id: "ricochet", icon: "↗", name: "RICOCHET RECEIPT", description: "Slam a desk prop to rebound automatically.", flavor: "Every accident is now a connecting flight.", max: 1 },
  { id: "magnet", icon: "▣", name: "MAGNETIC FILING", description: "+45% OUT tray range and +10% bank value.", flavor: "Attractive paperwork. Literally.", max: 2 },
  { id: "overcommit", icon: "!", name: "CONTROLLED OVERCOMMITMENT", description: "+35% charge time and full-power slam damage.", flavor: "Now with 12% less sneezing.", max: 2 },
];
