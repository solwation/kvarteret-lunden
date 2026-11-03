# Reviewed public campus asset budget (#242)

The one-off reviewed cap is **46,222**; the actual public low-memory World remains **45,885** triangles
in portrait and landscape. Headroom is **337**, exactly the remaining headroom of the last accepted
#203 checkpoint (41,363 / 41,700). This is the full east-backdrop asset regression guard established
by #136, including access/lawn, signage and nested count-weighted clock instances, not a physical
phone/frame-time/FPS budget. Canonical `campus-budget-counter.mjs` is unchanged.

Public base: `ed59f08c2b60c10391444f8aa5adad19d7864b5f` (published #240 architecture).
[Full-SHA/material/building ledger](../../references/campus-budget/2026-11-03.json).
The conductor reviewed the traced-growth proposal before the product edit, conditional on actual
World confirming 45,885. Both pre-revision profiles confirmed that condition before the cap changed.

## Traced cause

| Step | Delta | Total | Material / accepted feature |
| --- | ---: | ---: | --- |
| #205, 60c6c50 | baseline | 38,795 | exactly reproduces its reported total |
| #204, 03bd49e | +1,819 | 40,614 | restored precise schoolyard/access polygons |
| #203, 8c4ccf0 | +749 | 41,363 | playground/access; reviewed cap 41,700 |
| #209, b303a6a | −8 | 41,355 | courtyard glass opening |
| #210, a1ed3b5 | −2,218 | 39,137 | temporarily replaces school with gym |
| #212, c7a7ff8 | +2,730 | 41,867 | restores school while retaining gym; earliest breach |
| #213, ded7afc | +272 | 42,139 | enlarged/repositioned gym glass |
| #216, b2ef36f | +254 | 42,393 | turned gym and Grenhuset |
| #218, 34bd3a1 | +560 | 42,953 | river/terrain-correct access refinement |
| #221, 799c4cb | +1,043 | 43,996 | schoolyard/access surfaces |
| #222, 3f726db | +72 | 44,068 | parking hedge/access |
| #233, 1e6fc4c | 0 | 44,068 | moves 1,229 from access to lawn; no omitted triangles |
| #240, ed59f08 | +1,817 | 45,885 | reviewed facade/glass/hall/parking/sign |

Every intervening measured step is recorded, including zero deltas. The net after #203 is +4,522;
**41,700 + 4,522 = 46,222 = 45,885 + 337**. The old 2,324-triangle margin is not silently restored and
the cap is not set equal to the current sum. Future growth requires another explicit audit. No
content-preserving reduction was assumed without proof, and no unrelated geometry/precision was cut.

Research used the canonical history fixture: 24 fresh historical snapshots in one bounded 8-minute
run through e4b858e. The final source-bound 9e767cd/ed59f08 measurements are reused from #240's preserved
lowmem ledger; the actual current World endpoint is independently confirmed below in both formats.
[Fresh raw history](history.txt), [24 measured snapshots](history/history.json). The bounded run ended
before the last two requested versions; those entries are explicitly labelled reused in the full ledger.

## Product and fixture changes

Only `CAMPUS_LOD.maxTris` changes in product configuration (41,700→46,222), with audit comments.
`curve:3`, `roofGrid:2` and every other exported configuration value/function are identical. There is
no geometry, terrain precision, window, opening, material, light, texture or quality change.
[Configuration preservation check](source-identity.txt).

The old World fixture omitted the Nordic template from its per-building ledger, lawn after #233's
batch split and the separate two-triangle sign. Instrumentation now records these; all 21 building
ledgers plus access/lawn/sign and nested clock instances must exactly sum to the unchanged canonical
counter. No budget scope is removed or weakened. The #240 diagnostic now reads the separately reviewed
cap from the new audit JSON rather than pinning the obsolete 41,700 value. The normal guard remains strict.

## Verification

- Canonical counter test passed: complete subtree, indexed/nonindexed meshes, nested clock instances,
  zero instance counts and invalid count rejection; the implementation/test remain unchanged.
- Full actual Android-UA/lowMemory World, 390×844 and 844×390, before/after: **45,885** in every run,
  all 21 building ledgers reconciled; after 46,222 cap passes with 337 headroom. All geometry hashes,
  building ledgers, material/texture/buffer resource ledgers and four near/far PNG hashes are identical.
  Render metrics also match. [Identity results](identity.json), [arithmetic/metrics](ledger-check.txt),
  [raw World output](world.txt), [before portrait](before-portrait.json), [before landscape](before-landscape.json),
  [after portrait](after-portrait.json), [after landscape](after-landscape.json).
- `npm test`: 124 modules audited, import/content/storage/network boundaries, plans and app identity pass.
  [Raw output](npm-test.txt).
- `npm run build`: `5d750faea564f9f8eaaae122`. [Raw output](build.txt).
- Syntax checks and `git diff --check` pass. [Source hashes](source-sha256.txt).

The before profiles were saved once. A test-only TTY pause was stopped by SIGTTIN under timeout's
process group; the stopped fixture was terminated and only the two remaining after profiles ran in
a new browser, reusing the saved before JSON/PNG hashes. No before scene or broad app test was repeated.
This was fixture recovery, not a product change or a single-browser before/after claim.

Nonvisual exception: this is cap/test/documentation-only, with exact unchanged-pixel proof. The
canonical fixture generated comparison images solely for identity; no new product screenshot series
is required or published. #240's inspected architecture images remain valid, and its budget blocker
is now satisfied. Publication/issue lifecycle is handled by the conductor.

Reproduce from the repository root with the ordinary local server and Chromium:

```sh
BUDGET_COMPARE_REF=ed59f08 CHROME_PATH=/path/to/chrome node tools/campus-budget-check.mjs http://127.0.0.1:8910 artifacts/242-world
npm test
npm run build
```

`BUDGET_PHASES=after` resumes from saved before reports when recovering a fixture; the default
comparison runs all four profiles. The regular fixture without a comparison ref still enforces the
current cap. These are Chromium/SwiftShader asset/identity checks, not physical Android performance.
