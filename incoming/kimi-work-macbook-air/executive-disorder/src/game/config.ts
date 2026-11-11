export const WORLD = { halfW: 13.5, halfH: 8.5, playerBaseY: 0.34, maxForms: 38, maxParticles: 350, fixedStep: 1 / 60 } as const;
export const GAME = {
  moveSpeed: 5.2, groundFriction: 9, gravity: 19, minLaunch: 8, launchRange: 12,
  chargeTime: 0.9, overchargeAt: 1.12, baseSlamRadius: 1.35, comboWindow: 2.4,
  memoEvery: 24, firstMemo: 18, noLoseTime: 12, maxLaws: 2,
  saveKey: "stamp-duty.executive.v1",
} as const;
export const COLORS = {
  background: 0x111827, desk: 0xe8d9b8, deskEdge: 0xb8966d, ink: 0x172033,
  paper: 0xfffdf4, coral: 0xf25f5c, coralDark: 0xb73e48, mint: 0x70e1bd,
  yellow: 0xffcf56, blue: 0x66b7e8, purple: 0xa78bfa, white: 0xfffdf4, red: 0xef476f,
} as const;
export const INPUT_CONFIG = { MOUSE_SENS_X: 0.0026, MOUSE_SENS_Y: 0.0022, INVERT_X: false, INVERT_Y: false } as const;
