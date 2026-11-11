# 26 — Doing My Best: validation

Verified during the November 7, 2026 build, using Node 22.23.1 and isolated
Playwright-controlled Chrome 156.0.8078.80. These are local working-tree results,
not a claim about remote CI or a GitHub release.

## Automated checks

| Check | Observed result |
| --- | --- |
| `npm test` | 280 tests passed; zero failed or skipped |
| Focused `tests/quarterlife.test.js` | 18 tests passed |
| `npm run check` | 115 JavaScript files checked; seeded randomness/time guard passed |
| `npm run build` | Passed; source and standalone editions included |
| Targeted `git diff --check` | No whitespace errors in the edited shared files |
| Root vs. release portable HTML | Identical SHA-256 |

Portable HTML SHA-256 at validation:

```text
d2404e8585215abbe66978309dd9c52ff8a3c9a157b8abad6267c0d8a2ae6c13
```

The default Homebrew Node installation failed because a required `simdjson`
dynamic library was missing. Validation used the already-installed Node 22.
The initial sandboxed server test could not bind a local socket; the complete
suite subsequently passed in the permitted test runtime. No game dependency
was installed to address either issue.

## Actual browser acceptance

`tests/browser-quarterlife.mjs` drove ordinary clicks and keyboard input. It read
the autosave to assert results; it did not inject simulation actions or fabricate
an ending. The full suite ran against both the served source entry point and the
standalone HTML loaded directly from disk.

Both full runs covered:

- Starting, help, Escape behavior, sound toggle, and the M shortcut.
- One-per-day cat reward and saved resource changes.
- Cooking, stocked-food consumption, and the cook → host combo payout.
- Reloading during a pending surprise and restoring the exact pending state.
- Mandatory event resolution and its effect on progression.
- Rethinking plans once per day, its cost, and its replacement hand.
- The keyboard rest action and midmonth save restoration.
- All 28 evening actions, eight distinct surprises, and three upgrade decisions.
- Weekly summaries, the ending, personality recap, and actual PNG download.
- Reloading a completed run and refusing further play actions.
- No horizontal overflow at 360, 390, 768, or 1440 CSS pixels, including results.
- Same-seed replay, canceling a restart, and confirming a new month.
- Zero page errors and zero requests to external hosts.

Observed full-run outcomes:

| Edition | Score | Cash after rent | Goals | Memories | Combos |
| --- | ---: | ---: | ---: | ---: | ---: |
| Source | 2,876 | $249 | 3/4 | 3 | 8 |
| Portable | 3,150 | $440 | 4/4 | 5 | 6 |

These used different starting seeds. They demonstrate complete playable runs and
a reachable four-goal ending; they are not a formal estimate of difficulty.

Additional browser checks on the built release:

- Out-of-range month code rejected without starting a new run.
- Month code `26` starts seed 26 correctly.
- Keyboard `1` chooses plans and `2` resolves an event.
- Reduced-motion mode disables decorative animation.
- A second tab fails closed when a first tab has saved newer progress.
- Reloading the stale tab successfully loads the newer save.
- An unknown schema version remains byte-for-byte intact during temporary play.
- An intentionally poor-finance run completed all 28 evenings at **−$263**,
  displayed the rent-short ending, and remained replayable.

## Evidence and practical limits

Clean screenshots are `docs/twenty-six-desktop.png` and
`docs/twenty-six-mobile.png`. Detailed screenshots, test logs, actual downloaded
recaps, and JSON summaries are in the ignored `output/playwright/quarterlife-*`
directories. The acceptance test itself remains in `tests/` for repeatability.

Only Chromium was browser-tested. Mobile checks used browser viewport emulation,
not physical phones. Sound controls and error-free audio initialization were
tested; audio was not judged by a human listener. File-based autosave behavior can
vary between browsers and privacy settings; the game reports storage failures and
remains playable for the current session.

The repository had extensive existing and concurrent changes. The work retained
those changes and kept SIDELINE as the default entry point.
