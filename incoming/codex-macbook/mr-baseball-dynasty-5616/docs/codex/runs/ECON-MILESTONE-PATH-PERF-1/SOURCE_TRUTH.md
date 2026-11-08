# Source Truth — ECON-MILESTONE-PATH-PERF-1

Status: `VERIFICATION STOP-LOSS FROZEN — V1/V2/V3/R37–R40 RETIRED; CANDIDATE PRESERVED`.

## 2026-07-22 live recovery preflight

- Live campaign main is clean at
  `a9343763b35818fd1111ffec3bc3440a8294e6aa`; local `main` and
  `origin/main` resolve to that revision.
- Roadmap items 1–17 and 80 are complete. Item 18 remains the first incomplete
  legal item. Goal 11 and roadmap item 11 are already complete; Item 19 has not
  begun.
- Goal-31 WIP remains at
  `f6f73c7820d0d0e3fb00be9d9a7f6fe77b21c059`, tree
  `cf6f21258aae42522adf23887718643e5a6d2764`, with a clean index and the four
  protected production candidate files plus this run's living plan/docs only.
- Current protected production/test SHA-256 values remain exact: milestones
  `bef65c1e23a3fc8096ae8745528cd577e00f93cbc1f4b3909c95d8c86b09bbd6`,
  ceremony `ee6fe50bdc5bb83107b01822840684d71197abc4bed79e7e6ae8f01eb82f0102`,
  milestones test
  `6834b7b5915ddb135ed1d28467794922e37980b7ca7a9214263390053ec62123`,
  and ceremony test
  `00bfabd45662a837e7c01d4c3c2581287b39ab2f91719b1f4d25e85fbab66811`.
- A fresh current-revision focused run passed both adjacent files, 6/6, with
  retries disabled on 2026-07-22.
- The v1 Gate-M checkout is separate quarantined evidence at
  `/Users/kevin/Downloads/MBD-item18-exact45-preparation-v10-20260718-proof`,
  `codex/item18-exact45-preparation-v10@122ddd09e99886ffa5a8513cd524f2537eafcaf6`,
  tree `e2fe2a725257f9ddaba2abba254179c8f27d43c6`. Its index is clean, it has no
  untracked paths, and exactly runtime/test/config are dirty.
- Their current hashes are runtime
  `3456e020ba9e0894e863217b28f4b325fcbe3fae803a69133490f3aeaaf2f2d2`,
  test `a50ffcd2dfac301fe4109cda2d82f9bdb44943fcd00893d88ba57cc83b0df2f7`,
  config `98f343c0a0627be9860946af75a616088f84164fadbc79901ecd180eb5d9b46d`,
  and unchanged process policy
  `83f651534c33c7ec1fa3704e019e363bb8e56796ad794f68f7d0505db8277049`.
- V1 attempt 8 ran once and failed before compiler execution with
  `ITEM18_PROCESS_UNEXPECTED_RELEVANT`. The exact immutable failure is archived
  by `ATTEMPT8_QUARANTINE.json`; it has zero retry, VM, simulation, profile,
  exact-45, or canonical success output.
- The v1 wrapper threw before returning its captured process inventory. The
  historical offending PID/command is therefore unknowable. Existing host
  evidence makes a retained Vitest/Vite esbuild child the leading hypothesis,
  not a fact about attempt 8.
- A non-authorizing current `/bin/ps` snapshot at
  `/tmp/mbd-item18-process-topology-now.txt` contained zero relevant rows; SHA-256
  `76fd9381a47ef57019322f14a79ba51427526905439d73f43072af5d48f41532`,
  121,754 bytes. It describes only that later instant and is not attempt-8
  evidence.
- Goal 31, rather than Goal 32, owns the proof-recovery lineage. V2 completed
  three bounded source loops and passed its focused 20/20/typecheck/diff gates,
  but final review found four P1 and two P2 findings, including an infeasible
  execution-authority hash cycle. V2 is preserved by
  `GATE_M_V2_QUARANTINE.json`; no v2 dynamic execution, source freeze,
  authority, anchor, or canonical terminal artifact was created.
- `SOL_GATE_M_V3_ARCHITECTURE.md` freezes the fresh v3/attempt-1 route. It is a
  new bounded strategy under the same production scope, not a fourth v2 patch.
  The evidence DAG is acyclic and the same private terminal settlement must
  cover PRE rejection, compiler-only failure, POST rejection, compound failure,
  and verified success.
- The first clean v3 probe established a second authoritative launch context:
  the outer Vitest config process starts an inner Tinypool worker whose argv is
  the Tinypool worker entry and whose execArgv is
  `["--conditions","node","--conditions","development"]`. The original R
  launch tuple is superseded by
  `SOL_GATE_M_V3_ARCHITECTURE_AMENDMENT_1.md`. R2 must bind config-injected
  outer capture, live inner capture, and exact dependency identities. No
  dynamic attempt was armed by this probe.
- The R2 foundation subsequently passed 25/25 focused tests, two identical
  reserved-pair probes with provisional payload SHA-256
  `2abf30cc1fe34ac404a58bbab2836ea897b7a11ae9ef935362f003f1fa0a98b0`,
  web typecheck, and an A→V→H pre-ps seam. That digest is not an authoritative
  Q receipt because its payload/log was transient; final Q1/Q2 must be freshly
  retained after the last source edit.
- R/R2 did not define exact constructible JSON contracts for the full evidence
  and terminal chain. `SOL_GATE_M_V3_SCHEMA_AMENDMENT_2.md` and immutable R3
  now freeze the exact ordered schemas, result tokens, recursive descriptor
  order, terminal totality, success publication, external T, and mutation
  matrix. This is an architecture amendment, not a source correction loop.

## Preflight

- Worktree: `/Users/kevin/.codex/worktrees/5616/MBD-main-main`.
- Branch: `codex/econ-milestone-path-perf-1` from clean
  `main@ace5068f0f49a1195c2937461fe8ad7f04d8d3d8`; `origin/main` resolves to
  the same revision.
- Initial status was clean and detached at that revision. The protected main
  worktree and Goal-30 failed worktree are not this worktree and are untouched.
- Package manager: `pnpm@9.15.4`. Root scripts are recorded in `PLAN.md`.
- `CURRENT_GAME_SNAPSHOT_VERSION` is 35 in
  `packages/contracts/src/schemas/save.ts`; `saveSystem.ts` defines Dexie
  version 6. Neither is in scope.
- Sealed clean-main SHA-256 values match the Sol route: milestones
  `ac7a6fe97118096f81fb650e2ba50d15235a25a7524bc4807d498e6784f7e31b`,
  ceremony `b09aeb2f6566a20d1b4abba11d798fb5936a6dd93a4392d9bcaa49e746a44125`,
  and `newsFeed.ts` `a6f66ec5027a68ac624d9bdea9bdb5d4aaa4a800ff8a8b7af224270eeab4144c`.

## Live seams

- `buildCareerMilestoneEvents` builds the cumulative map, passes the complete
  player array to `checkMilestones`, then performs a second `state.players.find`
  per returned moment.
- `queueCareerMilestoneMoments` repeats that complete-array canonical call and
  a `state.players.find` per returned moment before user-team queueing.
- `checkMilestones` remains the canonical sim-core authority. It is forbidden
  to edit it or to duplicate its policy. Its player array is used only for
  resolved display names, so an empty-player eligibility probe is valid.
- Neither adjacent test file exists on clean main. This goal creates the two
  allowed tests rather than widening a shared integration test seam.

## Retained evidence identity

The Sol route authenticates season-15 raw SHA-256
`260594ec24b4f0846835343f7c96bc835a6b2e68909dcc531759cbd44a63516f` and
season-29 raw SHA-256
`a29f2e5df30284cdb5358ac3aa758b6d6c3bf9615e789214de1183ec67079360`.
Goal-30 comparison/forecast/provenance hashes are respectively
`d735b36a05688ebb1539ee03d93f356bbb373eadc5bbc1570450065134949d86`,
`0789ba18dae53654df95913f4672bcfb8af39f6649bf6bb27f8895707473c617`, and
`c3607cde180590608e89b843f338c77102f7e8edb476c5e6c68e50c73d5b6588`.

## Corrections and stop conditions

- Goal 28 has no standalone file under `docs/codex/goals`; Goal 29 defines it
  as the dependent item-18 soak. This is recorded rather than fabricated.
- The historical Goal-30 source/test files are absent here and must not be
  copied from its dirty worktree.
- Stop on provenance/source mismatch, semantic/RNG/save/history drift, need for
  a third production module, failed negative control, bundle growth, any band
  miss, forecast miss, or a third correction loop.

## 2026-07-27 live stop-loss truth

- Goal-31 worktree:
  `/Users/kevin/.codex/worktrees/5616/MBD-main-main`.
- Branch/HEAD:
  `codex/econ-milestone-path-perf-1@4f4b575b028a0c0e1ab230103e9d33f78f434cbf`.
- Current campaign main and origin/main:
  `a9343763b35818fd1111ffec3bc3440a8294e6aa`.
- Merge-base:
  `ace5068f0f49a1195c2937461fe8ad7f04d8d3d8`.
- Index: empty.
- Non-document candidate state: exactly the two modified production consumers
  and two untracked adjacent tests named below. The concurrent reconciliation
  dirt is docs-only: the Goal-31 goal, roadmap ledger, living plan/source/
  blocker/architecture documents, five historical retirement banners, and the
  new untracked `VERIFICATION_STOP_LOSS.md`.

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `apps/web/src/workers/sim.worker.milestones.ts` | 3,550 | `bef65c1e23a3fc8096ae8745528cd577e00f93cbc1f4b3909c95d8c86b09bbd6` |
| `apps/web/src/workers/sim.worker.ceremony.ts` | 15,748 | `ee6fe50bdc5bb83107b01822840684d71197abc4bed79e7e6ae8f01eb82f0102` |
| `apps/web/src/workers/sim.worker.milestones.test.ts` | 5,002 | `6834b7b5915ddb135ed1d28467794922e37980b7ca7a9214263390053ec62123` |
| `apps/web/src/workers/sim.worker.ceremony.test.ts` | 3,331 | `00bfabd45662a837e7c01d4c3c2581287b39ab2f91719b1f4d25e85fbab66811` |

Current main has no changes to these four paths relative to the branch
merge-base, so no source conflict is presently known. A fresh reconciliation
is still mandatory before source freeze.

The separate checkpoint
`/Users/kevin/Downloads/MBD-item18-gate-m-v3-20260722@0ff41b71fd9c5f437f7d01284dc7afa6738e5fef`
proved the verification stop-loss with repository-owned tests. It is not a
Goal-31 source-freeze or landing commit and is not an ancestor of this branch.
Its retired R40 artifacts bind obsolete source hashes and contradictory SG/F
identities and therefore cannot execute against current source.

Current focused command:

`./node_modules/.bin/vitest run src/workers/sim.worker.milestones.test.ts src/workers/sim.worker.ceremony.test.ts --retry=0`

Result: 2 files passed, 6 tests passed, zero retries. No long simulation,
performance matrix, forecast, Gate M, publication, push, deployment, or Item
19 action occurred.
