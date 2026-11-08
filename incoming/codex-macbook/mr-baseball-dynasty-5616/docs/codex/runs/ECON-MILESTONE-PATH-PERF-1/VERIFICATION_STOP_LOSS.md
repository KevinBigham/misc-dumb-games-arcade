# Goal 31 Verification Stop-Loss

Status: `ARCHITECTURE FROZEN — DIRECT REPOSITORY PROOF; EXECUTION NOT YET AUTHORIZED`.

## Decision

Retire Gate-M v1/v2/v3 and every R37–R40 derivative as historical
non-acceptance evidence. Do not create R41, patch a sealed predecessor, rebuild
an extinct private program, or admit a `.swarm` path into current acceptance.

This decision changes verification ownership only. It does not change the
Goal-31 production algorithm, performance bands, forecast cap, Goal-18
receipt/horizon, save v35, Dexie v6, gameplay, RNG, history, Item 19, or release
authority.

## Compact defect ledger

| Lineage | Defect | Class | Production affected | Execution | Root cause | Durable correction |
| --- | --- | --- | --- | --- | --- | --- |
| R37 | Positive argv resolved to the wrong executable basename and collapsed the nested child cause | Verification-program defect | No | Builder commands only; all seven protected lanes zero | Copied mixed dot/hyphen identity and missing argv-to-descriptor admission | Retire private executable mapping; direct tests call the tracked implementation |
| R38 | Child projection destroyed `null`/`undefined`/string/Buffer distinctions; active roots and numeric identity remained R37 | Verification-program / evidence-recording defect | No | Zero | Copied identity plus lossy projection | Remove the projection boundary from acceptance |
| R39 | Command 1 carried the R38 builder payload and SG commands retained SG38 | Architecture-contract defect | No | Zero | Copy-forward architecture | Stop-loss; no derivative revision |
| R40 | SG39/F39 contract values survived under active SG40/F40; source hashes predated `0ff41b7`; verifier did not prove real producer output shape | Architecture-contract / evidence-recording defect | No | Zero | Same copied identity, path, and projection family | R40 is permanently non-executable; repository tests and live source are authoritative |
| Specialized preparation lane | Default jsdom collection and ignored local evidence made proof checkout-dependent | Verification-program defect | No | No Gate M | Test ownership and ephemeral `/tmp` inputs were implicit | Dedicated Node/plugin test lane; historical-evidence checks opt-in only |

This family repeated more than twice. The lineage stop-loss is therefore
mandatory: no copied successor may be created.

## Active source and ownership

The only active production candidate is:

- `apps/web/src/workers/sim.worker.milestones.ts`;
- `apps/web/src/workers/sim.worker.ceremony.ts`;
- `apps/web/src/workers/sim.worker.milestones.test.ts`;
- `apps/web/src/workers/sim.worker.ceremony.test.ts`.

The two production functions independently use the canonical empty-player
eligibility probe, return before player-ID reads when ineligible, filter
qualifying players in original order while retaining duplicates, and perform
the final canonical call. No shared cache, state, schema, API, UI, RNG,
history, or gameplay policy is introduced.

## Replacement acceptance

1. **Typed child observations:** no child-process projection participates in
   acceptance. If a future disposable runner records child output, one
   repository-owned discriminated reducer must preserve null, undefined,
   string, and Buffer forms without coercion.
2. **Exact executable mapping:** no private executable is admitted. Direct
   Vitest imports invoke the exact tracked worker modules.
3. **Real producer shapes:** tests assert the actual returned event objects and
   actual ceremony state written by the public functions.
4. **Full identity before admission:** any future performance receipt must bind
   the final source-freeze revision/tree and exact four source/test hashes
   before state installation or result admission.
5. **Stale-root rejection:** R37–R40 and `.swarm` roots are forbidden active
   inputs. Historical descriptors may be cited only as non-acceptance evidence.
6. **Negative control:** replacing either narrowed final call with the full
   `state.players` array must fail the `<= 2N + 4` structural bound, then exact
   candidate bytes must be restored.
7. **Independent review:** final production admission still requires a fresh
   Sol review of the current frozen diff with zero actionable P0–P2 findings.

## Current evidence

- Candidate hashes are recorded in `SOURCE_TRUTH.md`.
- Current focused test: 2 files, 6 tests passed, retries disabled.
- Historical full-width mutants failed both structural bounds at 8,385 reads
  versus `<=260` and were restored to the recorded hashes.
- Existing warm-up/C1/C2 timing receipts are historical context only; they
  cannot satisfy the final matrix.
- The retained Goal-30 `/tmp` checkpoint/profile inputs are disposable
  evidence, not tracked fixtures. Missing files may not be fabricated.
- Portable source-resolved CPU attribution and Goal-30 receipt-key contract
  tests exist in the separate `0ff41b7` checkpoint but are absent from this
  Goal-31 branch. Before performance execution, their behavior must be
  recreated or transplanted as repository-owned tests under an explicitly
  reviewed test-only scope; the separate checkpoint's pass counts cannot be
  reused as Goal-31 receipts.

## Next authorized boundary

Planning and the existing adjacent repository-focused verification are open.
New source/test files, production source changes, a fresh performance matrix,
forecast, Goal-18 diagnostic, source freeze, landing, push, deployment,
release, and Item 19 remain closed until an explicit bounded
performance-execution oracle is recorded.

The recommended oracle is:

> Authorize `ECON-MILESTONE-PATH-PERF-1` to resume from the preserved four-file
> candidate on current main using direct repository proof only. Permanently
> retire Gate-M v1/v2/v3 and R37–R40; create no R41 or private recovery
> lineage. Preserve every algorithm, semantic/RNG/save/history digest,
> performance band, the `2,040,000ms` forecast cap, and the `2,400,000ms`
> Goal-18 ceiling. Permit one fresh disposable source-bound warm-up/C1–C3/V8/
> forecast sequence, followed only on green by full gates, final Sol review,
> source freeze, local Goal-31 landing, integration into Goal 18, and one exact
> seed-7111 diagnostic. Stop without retry on any identity, semantic, band,
> forecast, review, or runtime failure. Keep Item 19, push, deployment, tag,
> publication, and release closed.
