# #251 — orchestra v0.8.0

Public adoption corresponding to [original #1861](https://github.com/solwation/lunden-3d-apartment/issues/1861)
(delivered instruction `6378fa67`, closure `c98270bb`). Base:
`1113a136386c48b6835f02da03f64333f5fb9bc5`.

## Three scoped checks

1. **Exact import:** real squashsubtree pull of v0.8.0,
   `6ee6dd23ed85e5a91641d1939d553e4f789027d4`. Merge
   `1ef0423c676a88fe884738347df372fbe84ae5ba` preserves the base and squash
   `e034f06ad1c0621cccd1e5d5b4a967a1bb4d2b6f` parents and subtree trailers.
   Shared tree `9919a836f18935462d08ff837f1cf8f8964538da` equals the reviewed
   release tree. Canonical snapshot byte comparison passed against Issueflow revision
   `0e712c346c7689dd3e00db04fbe00d86090d5908`; source investigation from #1861 reused.
2. **Host consistency:** diff, relative links and new handoff anchors reviewed.
   Adapter stays a link to host policy. Retained original-first/all-public-low ordering,
   ancestor ceilings, 300-second polling, one-hour watch, two-worker/helper cap,
   intake isolation, direct main, actual Pages and acceptance-before-closure gates.
   Public content exclusions, independent storage and network/service restrictions
   remain intact. Only instructions/docs and the exact shared release changed;
   its icon rename is packaged upstream content, not an application change.
   Public's mandatory local checks passed: `npm test` (138 audited modules and
   app identity checks), `npm run build` (`d8c721a362655d988db2c9ec`). The fresh
   clone initially lacked dependencies; reused existing matching local dependencies
   through a temporary local link and reran successfully; removed that link before handoff. No dependency manifests changed.
3. **Lifecycle walkthrough (instruction review):** checked implementation switches
   exclusively from `in-progress` to `integration-ready`, retaining owner, checkout,
   revision, checks and next action. Its worker frees the slot; only the owner/integrator
   resumes active review/integration with `in-progress`. Acceptance, publication and
   actual Pages precede closure and removal of every work/own owner label. Correction
   names an active fixer or releases to backlog; rejected work is not ready. Ordinary
   pause/user question/reopen clears work labels/claim; genuine waiting retains owner
   on session stop. Waiting children preserve the parent's summary status without a
   slot and cannot be skipped at parent closure. Missing metadata/heartbeat requires
   evidence-based recovery and explicit handover, never duplicate implementation.
   Reconcile the separate integration queue before dispatch/drain/idle, with the same
   priority rules; waiting consumes no active time/capacity. Helpers cannot mark an
   issue ready while implementation remains active. No bulk issue migration runs.

## Delivery boundary and timing

Docs-only: no visual result, result screenshots, browser, runtime benchmark or app
changelog is applicable. Runtime/app assets remain unchanged. Local checks do not
claim deployment: the conductor owns final review, ancestry-preserving integration,
push, actual Pages verification and closure. Worker only records this individual ready
handoff, keeps ownership and preserves the checkout; no new queue/watch runs.

2026-11-04 UTC: clone/source review and exact import about 12:40; public host
reconciliation and provenance about 12:42; local mandatory checks and handoff about
12:43. No broader verification was needed.
