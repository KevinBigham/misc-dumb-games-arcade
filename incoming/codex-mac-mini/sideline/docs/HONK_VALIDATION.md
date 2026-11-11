# HONK validation — 2026-11-08

## Deliverable

`src/honk/Honk_If_Youre_Employed.html` — 108,560 bytes, complete offline game.

SHA-256:

```text
6860ee3033b6e96189b6eca865a76b928f1dbd3c044d5f8c64039a22a605e04c
```

The release copy at `dist/src/honk/Honk_If_Youre_Employed.html` matches byte-for-byte. No third-party runtime dependencies or network assets were added. The portable file is generated from the source modules, not separately maintained.

## Automated results

| Check | Actual result |
|---|---|
| HONK tests | 52 passed, including input, audio, storage, rendering, simulation, and endurance |
| Full repository `npm test` | 215 passed; 1 failed because the sandbox denied the existing static-server test permission to listen on `127.0.0.1` (`EPERM`) |
| `npm run check` | Passed: 95 JavaScript files; simulation randomness/time guard passed |
| `npm run build` | Passed; portable game regenerated and included in release output |
| `git diff --check` | Passed |
| Playwright acceptance runner | Blocked at Chromium/Chrome launch; no browser assertions ran |

Validation used Node 22. The default Homebrew Node executable on this machine had a missing dynamic-library dependency, so commands used the already-installed Node 22 binary. The project requires Node 22 or newer.

The full repository is a shared workspace with several other game projects. These totals describe the observed local run, not a clean Git checkout or remote CI result. No commit, push, remote equality check, or deployment was performed.

## What the HONK tests establish

- Honks, Reply All, cooldowns, damage immunity, dashes, healing, expiry, scoring, combo breaks, optional KPIs, upgrades, valid promotion choices, and both terminal states.
- Chair launches, multiple-target strikes, per-launch hit protection, collision/bounce boundaries, perk damage/friction, and boss-kill precedence over incoming damage.
- Scheduled pizza, telegraphed meeting zones, Reply All clearing meeting hazards, email-storm projectile limits, security windup/interruption/furniture crashes, and HR's phase transitions.
- Boss-slot reservation, explicit overtime entry, full-health/full-charge resets, cumulative scores, and preserved upgrades.
- Twenty seeded full careers across both difficulties, each followed by a successful first overtime round, using normal simulation actions. Entity limits, positions, charge, and integer score remain valid throughout.
- A keyboard-direction policy completes a career and two overtime bosses. A separate check of the browser pilot's six-tick input sampling also completed a career and overtime.
- Renderer calls leave simulation state and RNG unchanged, including rolling chairs, active and warning meeting zones, security, late-phase HR, pizza, and reduced motion.
- Sound cannot initialize before interaction; mute does not initialize it; delayed audio resume cannot undo pause; voice/burst caps and cleanup work.
- Quick pointer, touch-button, and Space taps survive until sampling; repeat keydown does not retrigger dash or Reply All; clearing input removes held and queued actions.
- Schema-v1 fixture round-trip, reload persistence, independent copies, separate difficulty records, latest-record merging, quota/denial fallback, protected unknown or malformed saves, locked cosmetic validation, and overtime not repeatedly incrementing career/win counts.

Bot success demonstrates reachability and regression protection. It does not establish that every human player will win or that difficulty has been broadly playtested.

## Actual Chrome acceptance

Native Chrome interaction was available even though Playwright could not launch a separate browser. Testing used ordinary keyboard, mouse, and emulated-touch input on the portable file. No game-state injection or force-win path was used.

Observed:

- Start, movement, honking, chair motion, breaking equipment, score/charge updates, Reply All, both promotions, and the HR encounter.
- Complete Casual Friday career: score **11,255**, 41 canceled meetings, CEO award.
- Continue into unpaid overtime: full health/charge restored, powers retained, another boss defeated, cumulative score **14,830**, 56 canceled meetings.
- Reload preserved the 14,830 best score and the three earned awards. The personnel record showed **1 win / 1 career**, correctly excluding overtime as a separate career.
- Auto-honk and reduced-motion settings survived reload. An invalid office code was rejected. `G-7321-F` loaded Casual Friday. Locked ties stayed unavailable; the earned gold tie could be equipped and appeared in play.
- Today's Grievance opened a Career game. Pause, nested personnel settings, returning to the existing pause, and Clock Out Early worked.
- A second full career with different choices reached the CEO ending at **12,670** and awarded Disruptive Thought Leader. The improved full-window review showed the entire review, overtime offer, replay controls, and office code without the former cramped panel.
- Final input build was reloaded. Chrome responsive emulation at **390 × 779** showed the title, scrollable personnel file, touch buttons, and a readable loss review. With auto-honk off, holding Move Up and briefly tapping HONK broke equipment and produced **145 points**, confirming the quick-tap fix in the browser.
- The same-office retry and early clock-out worked after the touch check. Chrome's visible console showed no messages during this final smoke test.
- Device emulation and DevTools were closed after testing. The desktop title screen was restored.

The last full career was completed immediately before the small input-sampling change. That change was separately verified in Node and in the final loaded browser build. Real iOS/Android hardware, Safari, Firefox, and gamepads were not tested. Desktop keyboard play remains the primary experience.

## Playwright limitation and reproducible runner

The user requested Playwright. It was actually attempted via the installed CLI and the standalone `tests/browser-honk.mjs` runner. The CLI could not write its daemon cache in this sandbox; a direct Playwright browser launch then exited immediately. The runner wrote a **blocked** report to `output/playwright/honk/report.json`. No Playwright pass is claimed.

The script is syntax-checked and ready to run where browser subprocesses are permitted. It creates an isolated browser context, uses real input and copied state observations, and attempts desktop controls, preferences, complete career, overtime, awards, persistence, daily play, narrow screens, and touch input. It writes screenshots and a JSON report. It remains an uncompleted browser acceptance run until a future report says `passed`.

```sh
HONK_BROWSER_CHANNEL=chrome node tests/browser-honk.mjs
```

Use `HONK_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs` if Playwright is installed outside the repository. No global installation or application security setting was changed to bypass the environment limitation.
