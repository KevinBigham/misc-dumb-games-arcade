export type LawId =
  | "bounce" | "slip" | "sticky" | "tiny" | "giant" | "fan"
  | "gravity" | "jelly" | "hole" | "duck" | "calculator" | "teeth"
  | "coffee" | "magnet" | "birthday" | "lunch";

export interface Law {
  id: LawId;
  title: string;
  detail: string;
  helpful: boolean;
}

export const LAWS: Law[] = [
  { id: "bounce", title: "ENTHUSIASTIC WALLS", detail: "Every boundary is feeling supportive.", helpful: false },
  { id: "slip", title: "FRICTION DISCONTINUED", detail: "The desk has been optimised. Brakes have not.", helpful: false },
  { id: "sticky", title: "ADHESIVE DESK", detail: "Somebody used the wrong glue. Again.", helpful: false },
  { id: "tiny", title: "BUDGET CUTS", detail: "You are now 25% less employee.", helpful: false },
  { id: "giant", title: "PROMOTED TO LARGE", detail: "More stamp. Same salary.", helpful: false },
  { id: "fan", title: "CEILING FAN", detail: "Airflow is now a management strategy.", helpful: false },
  { id: "gravity", title: "DOWN IS NOW A DIRECTION", detail: "Please update your internal compass.", helpful: false },
  { id: "jelly", title: "EVERYTHING IS JELLY", detail: "Structural integrity has been deferred.", helpful: false },
  { id: "hole", title: "EFFICIENCY HOLE", detail: "Loose paperwork will be streamlined.", helpful: false },
  { id: "duck", title: "GRAVITY REPORTS TO THE DUCK", detail: "The duck has no comment.", helpful: false },
  { id: "calculator", title: "THE CALCULATOR IS AUDITING YOU", detail: "It knows what you expensed.", helpful: false },
  { id: "teeth", title: "STAPLERS HAVE TEETH", detail: "Their concerns are valid and pointy.", helpful: false },
  { id: "coffee", title: "FREE COFFEE", detail: "Charge faster. Make worse decisions sooner.", helpful: true },
  { id: "magnet", title: "MAGNETIC OUT TRAY", detail: "Filing now has attractive benefits.", helpful: true },
  { id: "birthday", title: "BIRTHDAY!", detail: "Deadlines politely wait for cake.", helpful: true },
  { id: "lunch", title: "LUNCH BREAK", detail: "One incident erased. Cake is incident-resistant.", helpful: true },
];

export const LAW_BY_ID = Object.fromEntries(LAWS.map((law) => [law.id, law])) as Record<LawId, Law>;
