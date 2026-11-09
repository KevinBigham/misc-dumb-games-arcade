# Lanewake

An original arcade swim racer for phones. Your body is the beat: tap each arm as it comes ready and you glide; mash and you sink.

- Play: open `lanewake.html` (one self-contained file, no network).
- Source: `src/shell.html` (markup and CSS), `src/rules.js` (pure, deterministic race rules, seeded RNG), `src/game.js` (render, input, audio, storage, screens).
- Build: `bash tools/build.sh` makes `artifact-body.html` and `lanewake.html`.
- Tests: `node test/run-tests.js` (rules and bots), `node tools/play.mjs <abs path to lanewake.html> <tag>` and `node tools/play-r3.mjs <abs path> <tag>` (headless phone UI; need Playwright and @sparticuz/chromium).
- Design contract and round-by-round critique: `NOTES.md`.
