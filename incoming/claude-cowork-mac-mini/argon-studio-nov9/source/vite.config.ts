import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        paradox: resolve(__dirname, 'paradox.html'),
        voidbreaker: resolve(__dirname, 'voidbreaker.html'),
        game01: resolve(__dirname, 'games/01-one-more-season/index.html'),
        game02: resolve(__dirname, 'games/02-blackout-dispatch/index.html'),
        game03: resolve(__dirname, 'games/03-the-last-signal/index.html'),
        game04: resolve(__dirname, 'games/04-junkyard-courier/index.html'),
        game05: resolve(__dirname, 'games/05-beatline-salvage/index.html'),
        game06: resolve(__dirname, 'games/06-roommate-republic/index.html'),
        game07: resolve(__dirname, 'games/07-merge-kitchen/index.html'),
        game08: resolve(__dirname, 'games/08-orbit-stack/index.html'),
        game09: resolve(__dirname, 'games/09-belt-and-bolt/index.html'),
        game10: resolve(__dirname, 'games/10-ten-floors-down/index.html'),
        gameParadoxProtocol: resolve(__dirname, 'games/11-paradox-protocol/index.html'),
        game11: resolve(__dirname, 'games/11-keystone-forge/index.html'),
        metaphysicalDeli: resolve(__dirname, 'metaphysical-deli.html'),
        gameMetaphysicalDeli: resolve(__dirname, 'games/11-metaphysical-deli/index.html'),
        hypernova: resolve(__dirname, 'hypernova.html'),
        game12: resolve(__dirname, 'games/12-hypernova-chronovalkyrie/index.html'),
        chronoSyndicate: resolve(__dirname, 'chrono-syndicate.html'),
        gameChronoSyndicate: resolve(__dirname, 'games/12-chrono-syndicate/index.html'),
        chronoVortex: resolve(__dirname, 'chrono-vortex.html'),
        gameChronoVortex: resolve(__dirname, 'games/12-chrono-vortex/index.html'),
        eventHorizon: resolve(__dirname, 'event-horizon.html'),
        gameEventHorizon: resolve(__dirname, 'games/12-event-horizon/index.html'),
        oroboros: resolve(__dirname, 'oroboros.html'),
        gameAstralPinball: resolve(__dirname, 'games/12-astral-pinball/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/omega-suite.test.ts', 'tests/argon-10-games-suite.test.ts', 'games/**/*.test.ts'],
  },
});
