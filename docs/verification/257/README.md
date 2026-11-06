# #257 — orchestra v0.8.2

Public base `5efe40ccafac075a7da5ef6f7e8573009f93d5d6`.
Official upstream release: `5a67f022cea5ec2a81fcadb99b727d9f3482e26a` (v0.8.2),
previous `264e867d17b4f938b09cdb01794025e7b0113c5d` (v0.8.1).
Corresponding [original #1877](https://github.com/solwation/lunden-3d-apartment/issues/1877).

## Scope and three checks

1. Exact squashsubtree import, merge parents/trailers and full intervening diff;
   compare the complete imported shared tree to the reviewed release tree. Update
   README, host pin and this provenance without changing application files.
2. Ten upstream link-checker regression tests; relative host/shared links and anchors;
   mandatory public `npm test` and `npm run build`.
3. Instruction scenario review: ready handoff retains owner/evidence and frees its
   slot; integration resumes under that owner with `in-progress`; rejection names a
   fixer or releases to backlog; pause/question/reopening clear work/own owner labels;
   acceptance/publication/actual Pages precede closure. Waiting children keep parent
   summary status and cannot be skipped at closure. Existing original-first ordering,
   all-public-low and ancestor ceilings, two-worker cap, 300-second polling, 60-minute
   watch and 25–30-minute heartbeat remain. Reading reuse never substitutes fresh
   queues, claims or recovery. Host evidence gates override generic capture exceptions.

## Results (2026-11-06 UTC)

- Import merge `292aea1fdb77e3fa0208fdb777191952599a52ff` retains base
  `5efe40ccafac075a7da5ef6f7e8573009f93d5d6` and squash
  `2ae46203873188667162a7d37b7e700576ea947e` as parents; squash trailers name the
  exact reviewed release. Imported shared tree `a2690143e374f4fbc0b790035cc96507b0ceabfb`
  equals the official v0.8.2 tree. Full nine-file release diff was reviewed locally.
- `python3 -B -m unittest discover -s .orchestra/shared/scripts -p 'test_*.py'`:
  ten passed. `python3 -B .orchestra/shared/scripts/check-links.py`: 746 relative
  links in 78 tracked Markdown files passed, including the staged host/evidence docs.
  `git diff --check` passed.
- `npm test`: 139 modules, import graph, two floor plans, same-origin network policy,
  app identity and icon declarations passed. `npm run build`: static fingerprint
  `49c26cc4ecb62a00b3da7628`, unchanged from the previous application delivery.
  Reused matching installed dependencies through a temporary local node_modules
  symlink, removed before handoff; manifests were not changed.
- Lifecycle/host scenario review described above passed with no migration or rule
  contradiction. Public boundaries and the root Pages workflow are unchanged.

Worker phases: read/plan/import 07:39–07:40; provenance edit and scoped verification
07:40–07:42; review/handoff about 07:42. One worker, no helper, no browser/server
or repeated expensive check. Raw logs are retained privately with the conductor.

## Boundary and delivery

Documentation and its exact packaged checker/tests only: no meaningful visual result,
app change, player changelog, browser sweep or runtime benchmark applies. No personal
assets, original storage, gameplay, Cloudflare or service integrations are imported.
The nested `.orchestra/shared/.github/workflows/check-links.yml` is packaged upstream
content; it does not add a root GitHub Actions workflow. This repository's root Pages
workflow still runs tests/build/deployment on every main push, including docs.

The conductor owns combined review, ancestry-preserving synchronization, publication,
actual Pages verification and final completion/closure. Local checks are no claim of
deployment. Worker retains its clean checkout and stops all own processes at handoff.
