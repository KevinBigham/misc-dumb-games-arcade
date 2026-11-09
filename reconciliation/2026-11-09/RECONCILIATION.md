# Incoming collection reconciliation — November 9, 2026

## Decision

Keep the current 95 arcade entries. **No additional game card is justified by the incoming pull requests reviewed here.** The count represents 94 game/version entries and one Argon launcher, not 95 independent game designs or 95 fully accepted games.

Prepare a documentation and navigation correction only. Keep every incoming PR open and unchanged. Do not merge, replace a live game build, delete a source snapshot, or deploy this proposal without Kevin's approval.

The meaningful follow-up candidate is the Mac mini **Gridiron Overdrive** ZIP release in #6. It differs from the live MacBook copy in code and mobile behavior; it is not merely a repackaging. Preserve it for a separate replacement review in its own project. It does not need a second arcade card.

## Evidence boundary

- Main reviewed: [`5d332606c0f5f9d776f610a1fb60345a7334c976`](https://github.com/KevinBigham/misc-dumb-games-arcade/commit/5d332606c0f5f9d776f610a1fb60345a7334c976).
- Review date: November 9, 2026, America/Chicago.
- Read the current catalog, all nine open incoming PR heads, their manifests and recursive Git trees, and the intervening integration/fix PRs #5, #8–11, #13–14, #16–19, #21–23.
- Compared Git blob/tree identities and inspected selected source/build differences. Exact content matches are recorded in [identity-evidence.json](identity-evidence.json). A matching title is insufficient; a different build hash alone is also insufficient to establish a new game.
- Downloaded all 19 sampled public entry files and both PR #22 repaired assets: all 21 matched the reviewed main bytes. See [deployment-evidence.json](deployment-evidence.json).
- Independently interacted with **19 existing GitHub Pages entries**. The observations below distinguish real state changes, launch checks and unresolved controls. Collector checks are historical evidence, not our own gameplay results.
- A local headless Chromium launch failed because the execution sandbox denied its process-singleton socket. The cloud browser could not use the local preview. Therefore incoming-only releases were inspected as source, not independently played. No claim is made that the unpublished Gridiron Overdrive candidate or archived deliveries passed fresh gameplay acceptance.
- Public deployment observations and repository source comparisons are separate evidence. These checks do not establish phone support, offline acceptance, long-run stability, full campaigns or all 95 entries' gameplay quality.

## What changed after the supplied 80-entry snapshot

| Integration | Result already on main |
|---|---|
| [#16](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/16) | Added Oroboros, Chrono-Syndicate, Chrono-Vortex, Event Horizon and Hypernova from #15: 80 → 85. |
| [#17](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/17) | Added Executive Disorder, Stamp Duty: Overqualified and Piñata Panic from #7: 85 → 88. |
| [#18](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/18) | Replaced Lane Four with a later build; count unchanged. |
| [#19](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/19) | Added Emberward: 88 → 89. |
| [#21](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/21) | Added Volt-Lash, Ricochet Vault, SLINGCORE, SNAP-LANCE and SNAPBACK from #20: 89 → 94. |
| [#22](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/22) | Fixed SNAP-LANCE chain-kill and SNAPBACK blade-kill loops. Preserve the main versions. |
| [#23](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/23) | Added renamed Aegis-Zero from #4: 94 → 95. |

These integrations already exist. This proposal does not repeat them or treat their earlier approval history as permission to publish a new change.

## Current incoming PR disposition

| PR and pinned head | Actual retained collection | Recommendation |
|---|---|---|
| [#1 / 086deca4](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/086deca4034afda9995cf3b856986da3e168a7b2) | Original 22-game arcade. Two primary index files match current main; twenty differ. | Archive the first delivery. Main's later cloud copies already cover its titles. No new entries and no blanket rollback. |
| [#2 / ffe4b696](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/ffe4b696b82e05726f5ba5ba90a4227343ebdbd8/incoming/cloud) | 50 folders: manifest's 46 games, an older Stormglass, kit demo and two toys. | All 46 game identities are represented: 44 have exact canonical file contents, Hardwood became Baseline Empire, and Negative Split was superseded by Lane Four. Retain the older version, demo, toys and editable sources as archives. |
| [#3 / 423d57fe](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/423d57feb03e2f8186e2e8090da80e93fcc7dab5/incoming/codex-macbook) | Seven current folders covering HARDCOURT, Hardwood, Gridiron Overdrive, HUSH, PRISM, Soupermarket and the mixed prototype. Manifest still describes twelve folders before Dynasty removals. | Existing game entries cover all six playable identities. Keep native packages, source, historical Gridiron copies and prototype. MFD/MBD were already removed from this PR's current head; do not recreate them. |
| [#4 / 45d697fd](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/45d697fd7ef8fb2448253460699e9acf99a335cf/incoming/antigravity-mac-mini) | 28 folders including hub, older/newer Voidbreaker versions, 11 Wave 12/13 games, and the franchise predecessor. | All game/version identities have an arcade representation, including Aegis-Zero through #23. Keep sources and original labels here. Do not overwrite main's renamed or repaired derivatives. |
| [#6 / 5615486e](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/5615486e3999623fcbc8fdc3f959e893ddea8d4b/incoming/codex-mac-mini) | 28 retained folders; 23 game identities already represented, two older deliveries, one source prototype, Last Bell, and a party-client fragment. | Archive sources and deliveries. Evaluate the distinct Gridiron Overdrive ZIP as an update candidate. Keep Last Bell held and the client fragment out of the arcade. |
| [#7 / 55f77acd](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/55f77acd03cc4badab0fa15c4d706436e7c92f93/incoming/kimi-work-macbook-air) | Three current game folders: Executive Disorder, Piñata Panic, Overqualified. Earlier HUSH/PRISM/Soupermarket/app copies survive in history. | All three integrated by #17. Executive Disorder and Overqualified match the full canonical file contents. Piñata's JS differs because the live upgrade was renamed. Keep the live derivative. |
| [#12 / 47021958](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/47021958d71c0e48eb0d6fa7e1ad708ccec23071/incoming/antigravity-macbook-air) | Accordion Courtroom and HonkCourt. | Both complete canonical files match exactly. Already integrated. Keep the snapshots; add no entries. |
| [#15 / ab8bd518](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/ab8bd518fff392219d319b1243b27586a7fe9061/incoming/claude-cowork-mac-mini) | **Current collection contains INDEX.md and argon-studio-nov9 only.** The latter has 18 per-game launch pages, additional aliases, Voidbreaker and shared chunks/source. | Five genuinely new identities relative to the old 80-entry catalog were already integrated by #16. The other 14 identities were already present. Keep the bundle as a source/build snapshot. Its ten-row manifest is stale; do not use it as a current file inventory. |
| [#20 / a310111a](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/a310111afaa8b6df42d3ac153e3075c381efdb5d/incoming/claude-cowork-mac-mini-2) | Five game folders, plus source. | All integrated by #21. Volt-Lash, Ricochet Vault and SLINGCORE have exact canonical file contents; SNAP-LANCE and SNAPBACK contain older JS than the fixes on main. Archive them; do not overwrite the fixes. |

## PR #15: manifest versus files

The seven shared Game-workspace titles, Gridiron Blitz, Gridiron Overdrive and MFD appear in #15's **manifest**, but their advertised `game-lab/`, `gridiron-blitz-00/`, `gridiron-overdrive/` and `mr-football-dynasty/` directories are absent from its current tree. This is a documentation conflict, not evidence of ten current payload entries.

The actual five new identities and launch paths were:

| Title | Incoming path, relative to `incoming/claude-cowork-mac-mini/argon-studio-nov9/` | Current arcade path |
|---|---|---|
| Oroboros: The Pinball Singularity | `games/12-astral-pinball/index.html` (also `oroboros.html`) | `games/oroboros/index.html` |
| Chrono-Syndicate: The 15-Second Heist | `games/12-chrono-syndicate/index.html` (also `chrono-syndicate.html`) | `games/chrono-syndicate/index.html` |
| Chrono-Vortex: The God-Forge Arena | `games/12-chrono-vortex/index.html` (also `chrono-vortex.html`) | `games/chrono-vortex/index.html` |
| Event Horizon: Singularity Slingshot | `games/12-event-horizon/index.html` (also `event-horizon.html`) | `games/event-horizon/index.html` |
| Hypernova: Chrono-Valkyrie | `games/12-hypernova-chronovalkyrie/index.html` (also `hypernova.html`) | `games/hypernova/index.html` |

Shared JS chunks must remain beside these built pages in their original bundle layout. The top-level aliases and nested launchers are alternate entry points, not extra games. The raw `.ts` pages under `source/` require a build and are not equivalent static launch paths.

The remaining bundle identities are One More Season (Ironvale), Blackout Dispatch, The Last Signal, Junkyard Courier, Beatline Salvage, Roommate Republic, Merge Kitchen, Orbit Stack, Belt & Bolt, Ten Floors Down, Keystone Forge, Metaphysical Deli, Paradox Protocol and Voidbreaker Omega. All already have canonical cards. Do not create another collection card merely to make the bundle visible.

## PR #6: actual launch files and identity

Paths below are relative to `incoming/codex-mac-mini/`. Module pages need their copied workspace, not just the HTML file.

| Title | Preserved launch path | Arcade relationship |
|---|---|---|
| SIDELINE | `sideline/index.html` | Main keeps this game and changes seven team nicknames. Its other ten canonical files match #6 exactly before this proposal. |
| ECHO REQUIEM | `echo-requiem/echo.html` | All seventeen canonical file contents are found in #6, with the entry renamed to index.html. Keep current version. |
| THE LAST LIGHT | `the-last-light/dist/last-light-standalone.html` | Byte-identical to the live primary HTML. |
| CROSSBLOCK | `crossblock/crossblock-play.html` | Byte-identical to the live primary HTML. `crossblock.html` is the source/module entry. |
| Please Feed the Moon | `please-feed-the-moon/moon-play.html` | Byte-identical to the live primary HTML before navigation repairs. `moon.html` is the module entry. |
| 26: Doing My Best | `26-doing-my-best/twenty-six.html` | Byte-identical to the live primary HTML. |
| HONK IF YOU'RE EMPLOYED | `honk-if-youre-employed/src/honk/Honk_If_Youre_Employed.html` | Byte-identical to the live primary HTML before its home-link repair. |
| Gridiron Blitz '00 | `gridiron-blitz-00/index.html` | Predecessor of Turf Riot, integrated by #10 and retitled further by #11. Keep original here; no second card. |
| Gridiron Overdrive | `gridiron-overdrive/dist-artifact/gridiron-overdrive.html` | Distinct source/release candidate, **not identical** to the live MacBook artifact. See below. |
| SIDELINE v0.1 delivery | `sideline-v01-release/index.html` | Preserve release wrapper, source and launch scripts as a historical delivery. Its echo.html is another launch path, not another new game. |
| ECHO Windows delivery | `echo-requiem-windows-snapshot/index.html` | Preserve the older cross-platform delivery; do not replace current Echo with it. |
| Last Bell | `last-bell/Last_Bell.html` | Separate classroom product with teacher/student PDFs. Keep held for Kevin's decision; no new arcade entry. |
| Cheap Local TV Chaos player fragment | `cheap-local-tv-chaos-player/player.html` | Not standalone. Requires absent `/js/shared/` scripts, a host and WebSocket service. Preserve for the party-game project. |
| Early football franchise source | `madden-franchise-05-prototype/src/main.ts` | No preserved standalone HTML launcher for this old entry. Preserve source; the finished fictionalized lineage is Fourth & Forever. |

The seven Game-workspace folders have the **same Git tree** `9677f2977230b44afebf10f4b709ae626d87016f`. Each contains all seven games, dependencies and alternate releases. The thirteen Argon copies, Voidbreaker Omega and early franchise-source wrapper share a second workspace tree (`f9ada3fabe64…`). This is intentional archival duplication of entire workspaces, not independent versions. Keep the original paths; storage deduplication is already handled by Git blobs.

### Gridiron Overdrive deserves a separate version review

| Build | SHA-256 of preserved HTML |
|---|---|
| Current main / MacBook #3 artifact | `02a28bda6b5fb254d0cfbe8bf0e694b93a85204e558533f76cb216943b96b3f9` |
| Mac mini #6 ZIP release | `226214d62e32f1cb9eb63b6bd4a904dc7b218c88e611e54aa53d095cdb9b8502` |

Main's HTML exactly matches #3's `gridiron-overdrive/index.html`. The #6 release adds `viewport-fit=cover`, home-screen metadata, a data-URI manifest, different mobile instructions, and changed game code (including a JUKE cost entry absent from the current bundled constants). There are substantial bundled-code differences; date and size do not establish that it is the best version.

Preserve #3's four `versions/` artifacts and #6's complete source/ZIP-derived release. Track a replacement candidate in [mfd-playable-3d-standalone](https://github.com/KevinBigham/mfd-playable-3d-standalone), then independently test desktop Quick Play through a completed drive, touch controls and safe-area layout, pause/resume, save compatibility, and performance before replacing the existing arcade mirror. This task does not perform that replacement or create another repository.

## Distinct versions and misleadingly similar titles

| Relationship | Decision |
|---|---|
| One More Season (cloud) vs One More Season: Ironvale Rovers FC | Two different game implementations. Keep both cards. |
| Voidbreaker Overdrive vs Omega | Older and later versions with their own existing cards. Preserve both. |
| Executive Disorder vs Stamp Duty: Overqualified | Different 3D arena and 2D launch games sharing Stamp Duty branding. Keep both. |
| Arcade Lane Four vs cloud PR #2 Lane Four | Swim racer versus water toy. Keep the racer card and archive the toy. Negative Split stays historical. |
| Gridiron Blitz vs Turf Riot | Same lineage; the live derivative also changes the title, menu and code material. Archive the original; no new card. |
| Hardwood Franchise vs Baseline Empire; Madden Franchise vs Fourth & Forever | Original sources and fictionalized live derivatives. Preserve both histories, with one canonical card per live lineage. |
| Mixed HUSH/PRISM prototype in #3 vs Kimi app prototype in early #7 | **Exact same source tree**, `382c6a8d2dbec71744dabe8c992c356a0669a310`. One source-only catalog item with two provenance references, not two distinct prototypes. |
| HUSH, PRISM and Soupermarket older MacBook copies vs integrated later Kimi builds | Keep old sources and current canonical builds. Do not reinstall the older build merely because its PR remains open. |
| Argon hub vs individual entries | Existing launcher duplicates access to already cataloged games. Keep the launcher but exclude it from claims of independent game count. |

The mixed prototype remains in [current #3](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/423d57feb03e2f8186e2e8090da80e93fcc7dab5/incoming/codex-macbook/hush-pulse-prism-prototype) and [#7's earlier commit](https://github.com/KevinBigham/misc-dumb-games-arcade/tree/53337914002b4860e09af5caad5201a38fa6cbc1/incoming/kimi-work-macbook-air/app). The latest #7 manifest lists it as skipped, not as a present folder.

## Projects that stay in their own repositories

| Project | Disposition |
|---|---|
| [Mr. Football Dynasty](https://github.com/KevinBigham/MFD) | Maintain in its existing repo; no arcade import. Current #3 and #6 no longer contain their old Dynasty copies, and current #15's manifest-only MFD path does not exist. Preserve the earlier collection history. |
| [Mr. Baseball Dynasty](https://github.com/KevinBigham/MBD) | Maintain in its existing repo; no arcade import. Earlier MacBook source snapshots remain in #3's history. |
| [Gridiron Overdrive](https://github.com/KevinBigham/mfd-playable-3d-standalone) | Existing repo owns future development; keep its already playable arcade mirror. Review the #6 candidate there before replacing that mirror. |
| Cheap Local TV Chaos | Client belongs with its complete party-game host/relay project. An accessible repository was not verified in this review; do not invent a destination or treat the client alone as playable. |
| Last Bell | Keep the current hold. Its classroom materials and intended audience warrant Kevin's placement decision. |

Collection labels identify the app/machine that copied a folder. They do not establish sole authorship. In particular, #6 credits the Game1 suite to Gemini/Argon and identifies Gridiron Blitz as a locally found Claude artifact. Preserve those notes and all source attributions; this proposal strips none of them.

## Independent browser observations

All observations here are from the **existing public site**, not a new deployment. See [gameplay-observations.json](gameplay-observations.json) for explicit actions and limits.

| Game | Independently observed result | Evidence level |
|---|---|---|
| Sideline | Simulated Week 1, displayed PIT 38–CHI 23, returned to Week 2 with a 0–1 record. | Meaningful progression |
| 26 | Actually cook advanced day 01 → 02; cash $650 → $626 and other meters changed. | Meaningful progression |
| Crossblock | Placed an Elbow at row 1/column 1; score 20 and shapes placed 01. | Meaningful mechanic |
| Echo Requiem | Entered combat; timer advanced. Movement/fire/fork inputs were attempted, but a successful fork or kill was not established. | Launch plus running HUD |
| Please Feed the Moon | Clock In entered Shift 01 with the rent/teeth HUD and 5 hearts. | Launch into gameplay |
| The Last Light | Chose Memory promise, started Night 1, navigated away, restored Night 1 checkpoint. A pulse click did not establish memory consumption during the observed intro. | Start and checkpoint restore |
| Honk | Clock In started a workday; timer advanced; Pause opened Mandatory break. Score gain from attempted honking was not established. | Start/pause flow |
| Oroboros | Launched volley: volleys 5 → 4, chips 30; Magnet Pulse changed flux 60 → 35. | Meaningful resource/action change |
| Chrono-Syndicate | Deployed decoy and committed loop; Loop #2 with 1 Echo, score 9, 42-frame recording in log. | Meaningful core mechanic |
| Chrono-Vortex | Canvas click produced combat progress: 2/10 shattered, score 360, hull 98/130. Keyboard focus operation failed. | Meaningful combat change; keyboard unverified |
| Event Horizon | AI trickshot and Supernova produced score 372 and matching telemetry messages. | Meaningful combat/action change |
| Hypernova | Launch Sortie removed the title overlay and exposed the combat HUD. | Launch into gameplay |
| Turf Riot | Rendered team/options menu. Click/Return attempts did not establish kickoff. | Menu only; gameplay unresolved |
| Ricochet Vault | Drag launch moved orb; Bank control entered recall. Positive bank score not established. | Input/recall partial check |
| SNAP-LANCE | Charged and released toward enemy; score 400, timer 28. | Meaningful scoring |
| SNAPBACK | Arena rendered; hold/release attempted, score remained 0. | Partial input check; scoring unresolved |
| SLINGCORE | Hold/release produced visible +100 and chain feedback. DOM score remained 0 in observed snapshots. | Visible hit feedback; HUD discrepancy unresolved |
| Volt-Lash | Canvas input produced score 100, 1 combo and 8% surge. | Meaningful scoring/resource change |
| Aegis-Zero | Renamed chassis labels visible; Phase Shatter consumed charge, score 1,380, hull 86/100. | Meaningful combat/resource change |

These are bounded checks. They do not qualify every game's balance, win/lose loops, later upgrades, accessibility or mobile performance. #22's particular late-upgrade regression cases were not replayed here; source differences show why its repaired main builds must not be overwritten by #20's older assets.

## Proposed changes in this draft

| File/scope | Change | Reason |
|---|---|---|
| CATALOG.md introduction/counts | Date review, retain 95 entries, explain launcher count; source-only 4 → 3; archives/extras 7 → 8. | Collapse exact duplicate prototype, add Gridiron update-candidate archival row. No game card removed. |
| CATALOG.md sources/history | Record current #15 contents, own-repo destinations and version distinctions; link this report. | Stale manifests and identical titles otherwise encourage duplicate imports. |
| `games/sideline/src/franchise-view.js` | `./last-light.html` → `../the-last-light/`; `/echo.html` → `../echo-requiem/`. | Both original workspace targets are absent from the arcade. |
| `games/please-feed-the-moon/index.html` | Footer Sideline `./` → `../sideline/`; Echo `./echo.html` → `../echo-requiem/`. | The first returns to Moon itself; the second target is absent. |
| `games/honk-if-youre-employed/index.html` | Home `./Honk_If_Youre_Employed.html` → `./`. | The source filename was renamed to index.html during integration. |
| `reconciliation/2026-11-09/` | Add report, identity comparison and bounded gameplay observations. | Reviewable, pinned evidence without modifying historical source snapshots. |

The five URL edits change navigation only. No title, credits, simulation, save key, asset, game build, landing-page card or incoming PR is changed. Original copies remain at their pinned source commits.

## Verification of the proposed patch

- Verified 95 unique catalog play paths, 95 landing-page cards, and an existing index.html at every canonical path.
- Verified source-only, archived-version and extra row counts (3, 5 and 3).
- Compared all three edited game files against reviewed main: exactly five URL replacements and no other changes. Inline game scripts in Moon and Honk are byte-for-byte unchanged.
- Verified all five replacement destinations exist; Sideline view JavaScript passes `node --check`; evidence JSON parses; `git diff --check` passes.
- The proposed link changes were verified statically against their real destination files. They were not deployed for an end-to-end click test.

## Approval boundary and next action

Kevin can approve the focused correction PR after reviewing these changes. Merging and deployment remain separate actions requiring explicit approval. Do not merge an old incoming PR wholesale: it may carry older game files and stale catalog/landing-page state as well as valuable source snapshots.

After that decision, the highest-value separate work is: validate the Gridiron Overdrive candidate in its existing repo; resolve the SLINGCORE HUD discrepancy and remaining canvas input checks; and decide where Last Bell belongs. None of those decisions is silently bundled into this proposal.
