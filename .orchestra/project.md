# Lunden orchestra policy

Read the repository's AGENTS.md and CLAUDE.md, then [the shared core](shared/ORCHESTRA.md).
For `/orkester` also read [queue coordination](shared/COORDINATION.md). The same files
can be invoked in any file-reading agent; the slash command is only an adapter.
Reading or improving the instructions does not start an unattended orchestra.

## Shared issue workflow

Follow [Issue workflow instructions](shared/ISSUE-WORKFLOW.md) from github-dashboard
for labels, work intervals, priority assessment and closure. Resolve the current guide
once per session; record its SHA, or disclose the reviewed offline fallback. It takes
precedence over older local label/status descriptions. These host rules add scope,
ancestor/port constraints, claims and release requirements. Do not import the dashboard
project's internal deployment gates. This integration uses GitHub, not a GitLab API.

Create/reuse an issue in the repository where work lands; cross-link work affecting
both. New issues include `Lapp: <2–6 everyday Swedish words>`, acceptance and a short
priority rationale. Apply exactly one canonical priority based on impact/urgency.
Existing priority changes need user direction, except automatic lowering for ports
and ancestor ceilings. Missing priority counts as medium for selection.

Before creation, linking/reparenting, and every selection/idle check, enforce the lowest
priority in the full ancestor chain, including closed and cross-repository parents.
Read native parent links and explicit parentage in title/body/comments (`Del av #N`);
ordinary references, discoveries and transfer links alone are not parentage. Fetch
missing parents, never guess. Lower excessive open descendants recursively; preserve
already lower priorities, ownership and dependencies. Never raise a parent or reclassify
a child to avoid the ceiling. Raising a parent does not raise children. Record corrections.
Original-to-public ports and their children always have `priority: low` unless the user
explicitly overrides it; original priority does not transfer. Independent public work
uses ordinary triage. Refresh the queue after label corrections before selecting.

## Scope, queue and ownership

| Setting | Value |
| --- | --- |
| Language | Swedish chat and issue comments; code/docs follow repository conventions |
| Repositories | `solwation/lunden-3d-apartment`, `solwation/kvarteret-lunden` |
| Coordination | Original #420 and public #4; cross-link the same editable session comments |
| Exclusions | PRs, those two coordination issues and exact `orkester` coordination label |
| Ordering | high → medium → low, then `created_at`, full repo name, numeric issue |
| Active ownership | `in-progress` and `orkester: <stable-session-id>` during actual work only |
| Capacity | At most 2 workers including helpers per conductor, at least 1 while startable work exists |
| Model preference | Cost-effective capable worker; stronger reasoning for conductor/review; escalate with a reason |
| Queue poll | Every 300 seconds during active work and idle; also before every new selection |
| Idle watch | 60 minutes after latest resolved implementation issue in either repository, even with narrower scope |
| Heartbeat | Swedish issue comment every 30 minutes, first at 25–30; done/current/remaining estimate |

Default scope is both repositories. Explicit scope limits implementation, never visibility
of the other queue. Fetch all open pages in both before each selection, reservation,
takeover, chain continuation and idle check. Fetch the two repositories concurrently:

```sh
gh api --paginate 'repos/solwation/lunden-3d-apartment/issues?state=open&per_page=100'
gh api --paginate 'repos/solwation/kvarteret-lunden/issues?state=open&per_page=100'
```

Read both coordination histories with all pages, and current selected body/comments.
Keep repository identity and owner labels. Derive status/priority using the resolved
Issueflow guide, including recognized aliases; canonical labels are used for new work. A successful single-repository fetch is not
a complete global check. Record skipped older/higher and outside-scope work. A request
to create an issue during a session does not permanently exclude implementation.

Reserve only the current issue, with a comment identifying session, responsibility and
coordination links; re-read comments/labels immediately afterwards. Earlier valid claim
wins. Create the session label if missing and set both labels together at active start;
reconcile own claims on resume/status updates. Remove recognized work labels and own
owner label when paused, awaiting integration, released, closed or reopened. Reclaim
when actual integration starts; one integration owner publishes. Do not alter another
active session's labels. Same-file work needs distinct block/module ownership; actual
coupled dependencies may require serial work, not bypassing priority for convenience.

Existing future reservations expire after 30 minutes without start. Announce taking
an unstarted reservation when its owner has no capacity; release your own unused ones.
An active issue may be taken over only after 90 minutes without commit/comment/status
and no evidence its agent is running (missing from status, or session status older than
90 minutes). A 3-hour-old session status is abandoned, but never seize visibly active
work. Announce takeover in issue/status. Recover interrupted commits/worktrees first;
resume or release interrupted work within 30 minutes. Missing heartbeat after about
35 minutes triggers investigation, not immediate takeover. At 30 minutes reassess
progress; at 45–60 minutes without concrete progress inspect processes and intervene.

If all work is owned, offer a disjoint useful part of work running over 45 minutes in
both status and affected issue. Owner responds on the next poll; explicit agreement
or no objection for 15 minutes permits a bounded child with inherited priority. Leave
the active parent untouched. Never duplicate its ongoing work. Keep helper effort inside
the two-worker cap; do not create test/docs children when a helper under the same owner
is sufficient. The current owner should offer helpable parts proactively.

## Checkpoint, questions and stop

Save private state outside checkouts and update the same #420/#4 comments on every
poll (also failures), worker start and completion. Include stable ID/label, scope,
issue/repo/priority/creation time, worker/files/worktree, free slots, results and blockers.
Keep UTC `lastResolvedAt`, `lastQueueAttemptAt`, `lastQueueCheckAt`, `watchUntil`, and
last successful fetch per repo. Failed/partial checks update attempt/outcome only;
`lastQueueCheckAt` requires both complete successful queues. If no issue was resolved,
start the hour on first idle entry. Resolution in either repo restarts the full hour.
Preserve intake-hook timestamps too. Use interruptible waits ≤60 seconds and stop on
user pause/stop. No active labels while idle. Final exit requires elapsed watch plus
successful complete queues and required intake, with no startable in-scope work.
Chat updates only for state changes, blockers and completion; no repeated empty polls.

Product questions go on the affected issue with `user-question`, concrete options and
what can continue. Release inactive claims, keep incomplete work open; inspect actual
user replies at each poll before removing the blocker. A chat answer is copied to the
issue. Never ask unattended orchestration choices in chat. Use ordinary judgement for
implementation/coordination choices. Do not bypass a denied action via another agent.

## Workspace and delivery

Use a separate ext4 checkout/worktree per worker, never the shared `/mnt/c` directory.
Use existing local Git objects to avoid repeated full clones; give each worker its own
port/evidence directory. In WSL, explicitly choose the ext4 worktree path rather than
assuming a tool's default isolation path. Use installed Chromium/Playwright and the
repository's local server guide. Cloud egress may require REST `gh api` instead of
GraphQL; do not assume a failed CLI means GitHub is unavailable. Clean only own stopped
processes and completed clean worktrees; preserve uncommitted or unpublished work.

Fetch/rebase before each issue and before publishing. Push directly to `main`, no PRs
or feature branches, no force push. For unpublished subtree merges preserve ancestry
with `git rebase --rebase-merges origin/main` (or reapply the import on the fresh base).
Keep one complete delivery for a small coherent issue. Publish verified useful slices
for larger work with `Refs #N`; use `Fixes #N` only after all evidence-before-close and
release requirements are satisfied. One final issue comment can cover result, checks,
limits and phase timings. Use truthful tool attribution; no forced provider footer.

The 2–3-check risk plan and 10-minute verification review point are in the shared core.
Historical inventories are candidates, not mandatory sweep lists. Hard contracts,
actual reproduced bugs and user acceptance remain gates. For house layout fixes inspect
relevant A/B/C/L equivalents, with representative checks and each variant's dimensions;
independent defects become separate issues. No app changelog for instruction-only work.

## Repository hooks

- Read [public boundaries](../AGENTS.md), [README](../README.md) and
  [upstream review](../docs/upstream.md) before importing. Keep only applicable neutral
  architecture/navigation/rendering improvements. No personal images/data, characters,
  gameplay, original storage or Cloudflare integration. Record exact source SHAs.
- This public project has no report service. For exclusively public scope skip original
  report intake while retaining both queues. If original work is in scope, run its
  intake hook in its own checkout, using that project's current `.orchestra/project.md`
  and `docs/development/report-import.md`; never import the service into this app.
- Follow [verification](../docs/verification.md): `npm test` and `npm run build` remain
  required even for docs. App changes need the relevant real-browser route/view. Docs
  need diff/link/consistency review, no new browser sweep of the unchanged application.
- Every main push triggers Pages. Wait for the actual run, link its result and source
  commit, and check changed live behavior when the scoped plan requires it before
  closing. A green local build alone is not successful publication.

## Shared version and maintenance

Shared release: **v0.1.0**, commit **67507ef71c4979d8340e03e84072719651ada7df**. Imported as a squashed subtree
at `.orchestra/shared`. See [installation/contribution instructions](shared/README.md).
Improve the core in its own clean repository, release it, then explicitly update both
Lunden pins. Keep this local policy outside the subtree; do not export project history.
