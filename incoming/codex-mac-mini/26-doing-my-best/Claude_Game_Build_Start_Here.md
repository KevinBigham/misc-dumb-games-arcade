# Claude Game Build - Start Here

**Recommended original project: One More Season**

Prepared for Kevin on November 5, 2026.

Paste this entire file into Claude Code or another coding environment. It contains the implementation instruction and the complete recommended brief. The companion `Free_Games_GitHub_Claude_Report.md` includes 13 researched cases and five additional original briefs. If Kevin chooses a different brief, replace the brief below with that complete brief and keep the shared implementation requirements.

## Implementation instruction

You are the game designer and implementing engineer for one original small game. Use the build brief below and, when attached, the companion research report. Treat its design explanations as hypotheses to test. Its source games are references; do not reproduce their names, characters, music, maps, writing, distinctive artwork, or source code without an explicit reuse decision and a verified compatible license.

Default selection: Brief A, One More Season. If Kevin names another brief, use that one. Build exactly one game. Start in a new project unless Kevin explicitly identifies an existing repository to extend. If an existing repository is specified, inspect its instructions, current architecture, build commands, tests, and uncommitted work before changing it.

Before implementation, write a short design contract: the player fantasy, the repeated decision, the scarce resource, the loss condition, the target session, the two plausible strategies, the first sixty seconds, and the features deliberately outside the initial build. Make routine decisions yourself and state assumptions. Ask only if a missing answer materially changes the scope or authorization.

Implement the smallest complete version. Use the selected brief's concrete counts as scope caps. Prioritize a responsive action, clear feedback, a consequential tradeoff, a complete run, and immediate restart. Add content only after those are working. Preserve a clear route from the title screen to the actual game. Every visible button must perform its stated action or clearly explain an unavailable action.

Prefer TypeScript and a static browser build for these briefs, adapting to an existing repository when appropriate. Separate simulation, presentation, content definitions, randomness, persistence, and explanations. Use a seed and versioned state. A turn-based game should have a testable command boundary. A rhythm or action game must use the correct time source and explicit pause/focus behavior.

Create original content. Use simple original placeholder graphics and audio where needed; keep an asset manifest recording creator, source, license, and modifications. Do not infer that a repository's code license covers its music or artwork. Do not add a runtime LLM service, account system, purchases, online multiplayer, or deployment unless the task specifically calls for it.

Implement recovery before expanding content. Reload must preserve the current decision boundary without awarding anything twice. Validate saves and retain a recovery path. Provide clear export/import or backup behavior where appropriate. Never silently destroy a player's only save.

Verify the rules with meaningful tests: determinism where applicable, resource or score invariants, legal transitions, content validation, save restoration, and every intended terminal outcome. Challenge games must include a full winning and losing run; narrative and teaching games must cover their intended endings or comparisons. Verify the actual interface on the devices you claim to support. Report which checks you ran, their results, and any remaining limitations. Do not claim that passing tests proves the game is fun.

Provide a short playtest script and a visible debug mode that helps inspect decisions without changing normal play. Recaps must use recorded events. Any counterfactual or predicted benefit must be labeled and evaluated honestly. In the sports brief, do not invent realistic accuracy for the simulation.

Finish with the runnable project, exact local run/build commands, the production build, a concise design explanation, an asset/license manifest, a verification summary, and the single most useful next experiment. Do not stop after scaffolding or a planning document if a coding environment is available. If you cannot execute code in the current environment, say so and provide a complete bounded implementation handoff without pretending the game has been built or tested.

## Brief A: One More Season

**Priority:** Best fit for Kevin. **Primary reference:** Unciv's competing investments. **Supporting lessons:** Shattered Pixel Dungeon's run identity and Lichess's useful review. **Complexity:** Moderate, with simulation balance as the main risk.

**Premise.** Run a fictional five-a-side, football-inspired club through a six-fixture season. Each fixture asks you to balance lineup quality, fatigue, training, and one opponent tendency. The desired feeling is that you recognize your team, make a difficult call, watch it matter, and immediately want another season. These are simplified original rules rather than a simulation of a real league's rulebook.

**The loop.** Read a short scouting report; choose five starters from a fixed eight-player roster; spend up to two preparation points; choose one of three tactical plans; resolve eight alternating possessions per team; review three decisive events; make one bounded development choice. Repeat for six fixtures and receive a season outcome.

**Meaningful tradeoff.** A tired star may still produce the best immediate offense, but using a weaker reserve lets the star recover for the next fixture. Training raises an attribute at a fatigue cost; rest improves current readiness. Aggressive tactics trade possession reliability for upside. Opponent tendencies are visible enough to support planning; they do not turn the match into a certain answer.

**First playable scope.** One fictional league containing the player team and six distinct scheduled opponents; eight fixed players on the player's roster; four attributes per player; three tactical plans; two preparation points before each match; twelve authored recap templates; six fixtures. The templates describe actual logged events and do not introduce additional random events or progression systems. A run succeeds with at least four wins and always reaches a season recap. Four wins is an initial tuning hypothesis, not an evidence-based difficulty promise.

**Initial rules contract.** Each team receives eight possessions, alternating between teams, and each possession scores 0, 3, or 7 points. The higher total wins; a tied match counts as a draw and contributes zero wins toward the season target. There are no on-field positions, substitutions during a match, overtime, or extra-point decisions in this first version.

Player attributes are Attack, Defense, Control, and Stamina, each an integer from 1 to 10. Fatigue ranges from 0 to 100. For match calculations, multiply Attack, Defense, and Control by `1 - fatigue / 200`; Stamina reduces fatigue gained from playing rather than acting as another offensive bonus. Each fixture grants two preparation points that do not carry over. One point either rests one player, reducing fatigue by 24, or trains one attribute by 1 up to 10 while adding 8 fatigue. Each player receives at most one preparation action per fixture. After the match, starters gain `24 - Stamina` fatigue and reserves lose 18; clamp fatigue to its valid range. After fixtures one through five, choose one player and increase one attribute by 1, at no fatigue cost, exactly once. There is no separate XP, recruitment, or equipment system.

At equal effective strength before matchup adjustments, use these starting probability distributions for scores of 0, 3, and 7: Patient = 25%, 55%, 20%; Balanced = 35%, 35%, 30%; Aggressive = 50%, 10%, 40%. Team attributes and a visible opponent tendency may shift up to 15 percentage points between the 0-point and 7-point outcomes. Keep the total at 100%, document the exact modifier formula, and record it with each possession. These numbers are transparent starting values to tune through the seeded comparison, not claims about real football.

**First two minutes.** Give the player a prebuilt roster and a visible problem: the strongest attacker is tired, while the first opponent is vulnerable to a patient style. Allow a lineup change and one training-versus-rest choice, then resolve the first possession promptly. Explain attributes in context.

**Model and presentation.** A pure match simulator emits possession events containing the chosen plan, fatigue influence, matchup terms, random roll, and outcome. Show a compact field or possession timeline rather than requiring a full action football engine. Teams, players, tactics, and recap templates live in validated data files. At commitment, resolve the match once and persist its complete result, event log, and random state before presenting playback. Reload resumes that stored result. Record separate completion flags for fatigue updates and the post-match development choice so neither can be applied twice.

**Acceptance criteria.** Each of two contrasting strategies reaches the four-win success target on documented seeds; compare them on the same small fixed seed set and report their different tradeoffs without claiming broad balance from a few runs. Fatigue must change an actual decision; every reported decisive event must point to recorded data; reload must preserve the current phase; rerunning the same seed and decisions must reproduce the result. Verify both a successful season with at least four wins and an unsuccessful season with three or fewer, each reaching its recap. Observe whether players can identify one decision they would change after a loss.

**Scope cap.** No real teams, likenesses, recruiting database, transfer market, online league, fully simulated 22-player field, or multi-decade career. Later expansion should add one meaningful system after the six-fixture run is enjoyable.

**Claude instruction.** Implement Brief A as a separate, complete game. Start with one fixture and two contrasting viable plans, then expand to six fixtures. Preserve the ability to inspect the match math. Deliver a playable build, a short rules explanation, a seeded balance harness, save/recovery checks, and a sample recap produced from real simulated events.

## Research references

The complete report explains the source-based design lessons and their limits. The main references for this brief are [Unciv](https://github.com/yairm210/Unciv), [Shattered Pixel Dungeon](https://github.com/00-Evan/shattered-pixel-dungeon), and [Lichess](https://github.com/lichess-org/lila). They are architecture and decision references, not asset or code packages to copy. [Vite documentation](https://vite.dev/guide/) covers the proposed browser build setup.
