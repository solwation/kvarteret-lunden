# Lunden orchestra policy

Read the repository's AGENTS.md and CLAUDE.md, then [the shared core](shared/ORCHESTRA.md).
For `/orkester` also read [queue coordination](shared/COORDINATION.md). The same files
can be invoked in any file-reading agent; the slash command is only an adapter.
Reading the instructions alone starts no work. A chat request for changes, including
a request to improve these instructions, creates/reuses issues and starts/resumes
scoped work under [chat intake](shared/ORCHESTRA.md#turn-chat-requests-into-work), even
after an idle watch ends or before the first run. Respect explicit deferral and reuse
an active conductor; a scoped request does not expand to the backlog or enable timers.

## Shared issue workflow

Follow [Issue workflow instructions](shared/ISSUE-WORKFLOW.md) from github-dashboard
for labels, work intervals, priority assessment and closure. Resolve the current guide
once per session; record the guide file's change commit (or "identical to snapshot"),
or disclose the reviewed offline fallback. It takes
precedence over older local label/status descriptions. These host rules add scope,
ancestor/public-priority constraints, claims and release requirements. Do not import the dashboard
project's internal deployment gates. This integration uses GitHub, not a GitLab API.

Create/reuse an issue in the repository where work lands; cross-link work affecting
both. New issues include `Lapp: <2–6 everyday Swedish words>`, acceptance and a short
priority rationale. Assess original priorities by impact/urgency; assign exactly one canonical
priority. Every public issue has `priority: low` under the explicit host rule below.
Existing priority changes need user direction, except automatic public-priority corrections
and ancestor ceilings. Missing original priority counts as medium; correct missing public
priority to low before selection.

Before creation, linking/reparenting, and every selection/idle check, enforce the lowest
priority in the full ancestor chain, including closed and cross-repository parents.
Read native parent links and explicit parentage in title/body/comments (`Del av #N`);
ordinary references, discoveries and transfer links alone are not parentage. Fetch
missing parents, never guess. Lower excessive open descendants recursively; preserve
already lower priorities, ownership and dependencies. Never raise a parent or reclassify
a child to avoid the ceiling. Raising a parent does not raise children. Record corrections.
All `solwation/kvarteret-lunden` issues have exactly `priority: low` (user, 2026-11-04),
unless the user gives a later explicit exception. This includes ports and independent work,
bugs, maintenance, parents, children, tests, support and coordination issues. Original
priority never transfers. At creation and before every selection or idle check, lower
higher public priorities and fill missing priority with low; preserve ownership, active
labels and dependencies, then enforce ancestor ceilings. Refresh the queue after corrections.

Repository rank overrides priority labels (user, 2026-11-02; clarified 2026-11-04):
select any startable original issue before any public issue, including a public issue
with a later explicit higher-priority exception. Within the original use high → medium →
low, then creation time and issue number. All public issues normally have low priority
and use oldest first; a later explicit exception affects only ordering within the public
queue. Active work may finish without interruption; the rule applies at the next selection.
The original instruction counterpart is
[original #1860](https://github.com/solwation/lunden-3d-apartment/issues/1860),
source `0931b84de82b48e1e435843676e4c7908aa551c6`; this public adaptation is #252.

## Scope, queue and ownership

| Setting | Value |
| --- | --- |
| Language | Swedish chat and issue comments; code/docs follow repository conventions |
| Repositories | `solwation/lunden-3d-apartment`, `solwation/kvarteret-lunden` |
| Coordination | Original #420 and public #4; cross-link the same editable session comments |
| Exclusions | PRs, those two coordination issues and exact `orkester` coordination label |
| Ordering | Startable original issues first; original high → medium → low, then `created_at`, numeric issue. Public issues all low and oldest first, unless a later explicit exception changes internal public order (user, 2026-11-04). Active work may finish |
| Active ownership | `in-progress` and `orkester: <stable-session-id>` during actual work; finished handoff uses `integration-ready` with the same documented owner |
| Capacity | At most 2 workers including helpers per conductor, at least 1 while startable work exists |
| Phase hooks | [Project phase hooks](#project-phase-hooks); report intake under [queue intake hooks](#queue-intake-hooks) |
| Resource policy | [Smallest sufficient capability/effort](shared/ORCHESTRA.md#spend-resources-deliberately); explicit supported selection, compact context, justified escalation |
| Queue poll | Every 300 seconds during active work and idle; also before every new selection |
| Wait mechanism | Interactive Claude Code: a background timer (Bash `run_in_background` with `sleep`, at most 60 s per wait) or Monitor; a finishing worker or user message also wakes the conductor. A runtime that cannot wait (`claude -p`, one-shot cloud runs) runs a bounded pass and says that no poll or idle watch ran |
| Delivery mode | Direct to `main`, no PRs or feature branches ([workspace and delivery](#workspace-and-delivery)) |
| Idle watch | 60 minutes after latest resolved implementation issue by this session in either repository, else from first idle entry |
| Heartbeat | Swedish issue comment every 30 minutes, first at 25–30; done/current/remaining estimate |

`/orkester` in this project, with or without an argument, starts an explicit queue
session with the polling, idle watch and heartbeat above; the core's bounded pass
(no polling or watch) applies only when the user explicitly asks for a single pass.
An ordinary chat change request starts/resumes a scoped task without queue polling or
an idle watch unless those were requested. An already active queue session retains
its conductor, scope/selection rules and idle-deadline rules; a new request alone does
not reset the deadline. Both modes stay unattended: user-only questions go on the issue
(`user-question`), never chat.

Default scope is both repositories. Explicit scope limits implementation, never visibility
of the other queue. Fetch all open pages in both before each selection, claim,
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
owner label when paused back to backlog, released, closed or reopened. Finished handoffs
retain their owner with `integration-ready`; active integration switches to `in-progress`
under that ownership. One integration owner publishes. Do not alter another session's
active labels or documented handoff ownership. Parents follow the guide's sub-issue rules: the worker or
conductor starting a parent's first active sub-issue adds `in-progress` (not the owner
label) to the parent; keep that summary `in-progress` while any child is active or
`integration-ready`, unless the parent's own implementation is handed off. The conductor
removes it only when neither condition nor parent work remains. Close the parent only
after its acceptance and all children are closed or deliberately split out; a ready child
must be integrated and closed, or its work labels removed, before parent closure. A parent's label takes
no capacity slot. Same-file work needs distinct block/module ownership; actual
coupled dependencies may require serial work, not bypassing priority for convenience.

Documented `integration-ready` handoffs do not expire under active/future-claim timers.
Investigate an unavailable owner and announce an explicit handover preserving checkout,
commits and evidence; missing ownership metadata or heartbeat never permits duplicate implementation.
Existing future claims expire after 30 minutes without start. Announce taking
an unstarted claim when its owner has no capacity; release your own unused ones.
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

## Integration handoffs

Follow [the shared handoff procedure](shared/ORCHESTRA.md#handoff-for-integration).
Only complete implementation with passing scoped checks can replace `in-progress` with
`integration-ready`. Record issue, integration owner/session, branch/checkout, exact
revision, evidence, remaining acceptance and next action in the issue and checkpoint.
Stop worker processes and release locks; preserve the checkout until integrated or
otherwise preserved. Helpers report their part without marking a still-active issue ready.

Before dispatch, drain and each idle poll, reconcile owned handoffs from the complete
queues. Track this integration queue separately (owner, checkout/branch, revision,
evidence, next action) and order it by original-first, priority/creation order and
ancestor ceilings, just like dispatch. Resume ready review/integration under the same
ownership when a slot is available; independent work may use other free slots. Waiting
and parent summary labels use no active slot; waiting uses no active working time.
Repair missing ownership metadata from evidence instead of assigning new implementation.
Corrections remove ready and name an active fixer (`in-progress`), or remove both work
labels and release the claim for backlog; rejected/unfinished work is never ready.
Ordinary pause, user question, closure and reopening clear work labels and the own claim;
genuine waiting retains its documented owner even on session stop. Publication, acceptance,
public boundaries and verification gates below remain unchanged. No automatic issue migration:
reconcile real handoffs from evidence, never bulk-mark old paused issues ready.

## Checkpoint, questions and stop

Save private state outside checkouts and update the same #420/#4 comments on every
poll (also failures), worker start and completion. Include stable ID/label, scope,
issue/repo/priority/creation time, worker/files/worktree, active workers/capacity and why a
free slot is unused, results and blockers. Update the separate integration queue
on handoff and resume too.
Keep UTC `lastResolvedAt`, `lastQueueAttemptAt`, `lastQueueCheckAt`, `watchUntil`, and
last successful fetch per repo. Failed/partial checks update attempt/outcome only;
`lastQueueCheckAt` requires both complete successful queues. If no issue was resolved
by this session, start the hour on first idle entry. Resolution by this session in either repo restarts the full hour.
Preserve intake-hook timestamps too. Use interruptible waits ≤60 seconds and stop on
user pause/stop. Idle implementation carries no active-work label; valid waiting
handoffs and parent summaries keep their guide-defined labels. Reconcile handoffs
before idle; integrable owned work ends idle. Final exit requires elapsed watch plus
successful complete queues and required intake, with no startable in-scope work or
owned handoff that can be integrated now. Report blocked handoffs and next action.
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
GraphQL; do not assume a failed CLI means GitHub is unavailable. Stop only own processes;
preserve uncommitted or unpublished work.

Worktree root and cleanup: session checkouts live in the host's ext4 worktree root
(for example `~/wt/<repo-short>-<issue>`), never under `/mnt/c`. The integration owner
removes an issue's checkout and work branch after closure; the session review and the
next startup prune the whole root with
[`scripts/prune-worktrees.sh`](shared/scripts/prune-worktrees.sh) under the core
[cleanup rules](shared/ORCHESTRA.md#clean-up-checkouts) (dry run first, then `--apply`).
Whoever creates a writing checkout (a worker, or the conductor for a worker or for itself)
first writes `issue=owner/repo#N` and `session=<session id>` to `orchestra-claim` in its git
directory (`git rev-parse --git-dir`, outside the working tree), so the prune script counts it
as active before its first commit (core v0.11.0); the marker leaves with the checkout.
The root also holds checkouts of the original repository; the script classifies each by
its own remote and never removes one whose issue is open. Archive unproven work with
`--archive` to a private directory outside every checkout (next to the private session
state), never into a repository. Protect the shared `/mnt/c` clone and any ext4 mirror
with `--protect` when they lie under a scanned root.

Fetch/rebase before each issue and before publishing. Push directly to `main`, no PRs
or feature branches, no force push. For unpublished subtree merges preserve ancestry
with `git rebase --rebase-merges origin/main` (or reapply the import on the fresh base).
Keep one complete delivery for a small coherent issue. Publish verified useful slices
for larger work with `Refs #N`; use `Fixes #N` only after all evidence-before-close and
release requirements are satisfied. One final issue comment can cover result, checks,
limits and phase timings. Use truthful tool attribution; no forced provider footer.

The 2–3-check risk plan and 10-minute verification review point are in the shared core.
Historical inventories are candidates, not mandatory sweep lists. Hard contracts,
actual reproduced bugs and user acceptance remain gates. Project-specific activities
per phase are the [phase hooks](#project-phase-hooks) below.

## Project phase hooks

Apply [the shared hook contract](shared/ORCHESTRA.md#apply-project-hooks-at-each-phase).
The conductor owns every hook unless the short plan names a worker for a scoped
activity; the conductor still checks outcomes at each phase boundary. All hooks are
required when triggered. A false trigger is noted briefly where it changes the expected
evidence. Listed order is execution order.

| Hook | Phase and trigger/timing | Procedure | Requirement and completion evidence |
| --- | --- | --- | --- |
| Read boundaries | `planning`: every change, entry | [Public boundaries](../AGENTS.md), [CLAUDE.md](../CLAUDE.md) and the affected docs; plan the 2–3 risk-based checks and follow-up destination | Plan names the checks and evidence destination |
| Upstream review | `planning`: imports from the original, before implementation | [README](../README.md) and [upstream review](../docs/upstream.md); keep only applicable neutral architecture/navigation/rendering improvements | Exact source SHAs and the selected/rejected parts recorded in the issue |
| House equivalents | `planning`: house layout/geometry fixes, before implementation | Identify the relevant A/B/C/L equivalents and data variants; independent defects become separate issues | Houses checked listed; each variant keeps its own dimensions, openings and budget |
| Public boundary | `implementation`: every change, exit | Inspect the patch for unrelated edits and preserve concurrent work; no personal images/data, characters, gameplay, original storage or Cloudflare integration | Patch contains only scoped, public content |
| Fast checks | `verification`: every change, including docs | `npm test` and `npm run build` per [verification](../docs/verification.md) | Both pass on the verified revision |
| Behaviour checks | `verification`: app changes, after fast checks | The relevant real-browser route/view from the verification guide; screenshots stay under `artifacts/` and are reviewed; docs need diff/link/consistency review instead | Revision-bound result; no browser sweep of an unchanged app; untested behaviour never claimed |
| Inspect results | `review`: every change, before delivery | Read the combined diff and evidence against acceptance and the public boundary | Defects corrected and affected checks repeated |
| Publish and Pages | `delivery`: every completed change | Fetch/rebase (`--rebase-merges` for subtree imports), push `main` without force; wait for the actual Pages run; check changed live behaviour when the plan requires it | Delivered commit on `origin/main` and a linked green Pages run; a local build alone is not publication |
| Complete issue | `follow-up`: every tracked change, before closure | Completion comment with outcome, commit, Pages run, checks and limits; cross-link the original issue for ports; remove all recognized work labels (including `integration-ready`) and own owner labels | Closed only when acceptance is met; unmet acceptance stays open with next action and owner |

## Queue intake hooks

These follow [COORDINATION.md](shared/COORDINATION.md), not the phase hooks.

- This public project has no report service. For exclusively public scope skip original
  report intake while retaining both queues. If original work is in scope, run its
  intake hook in its own checkout, using that project's current `.orchestra/project.md`
  and `docs/development/report-import.md`; never import the service into this app.

## Shared version and maintenance

Shared release: **v0.12.0**, commit **9e7c6e388df0ebdd25c0ba76d3debc73de3c41fa**. Imported directly from the official release
with `git subtree pull --prefix=.orchestra/shared https://github.com/solwation/dirigenten-och-orkestern.git 9e7c6e388df0ebdd25c0ba76d3debc73de3c41fa --squash`
in [#265](https://github.com/solwation/kvarteret-lunden/issues/265), matching
[original #1904](https://github.com/solwation/lunden-3d-apartment/issues/1904). The complete
[v0.11.2..v0.12.0 diff](https://github.com/solwation/dirigenten-och-orkestern/compare/6151b2e887ce4587285271708affc07af09fddb6...9e7c6e388df0ebdd25c0ba76d3debc73de3c41fa)
includes v0.11.3's generic image-hosting examples, v0.11.4's HTTPS/Markdown standalone
image paragraphs for dashboard compatibility, and v0.12.0's optional expert-panel review
hook. These examples do not authorize asset branches, external storage or a change to this
host's existing evidence/retention rules; direct publication to main and the required
completion/publication gates still apply. The expert panel remains optional and is not
enabled as a required hook here; the existing session review and two-worker cap remain.
No application code, personal content, gameplay, original storage or services are imported.
Existing gates and anchors, fresh queue/claim checks and every host override remain; no
lifecycle, priority, timer, permission or publication migration applies.
The previous v0.11.2 import (`6151b2e887ce4587285271708affc07af09fddb6`) is recorded in
public #264 and original #1893; it added directly visible result images, continued active
orchestration after interjections and the shared landing page.
The previous v0.11.1 import (`e1842f5b41cc92272eb870bca1070e46f511505c`) is recorded in
public #263 and original #1891; v0.11.0 in public #263 and original #1891; the previous v0.10.0 import (`358c01f2d3a187c17e1b1c180bff7ecb06cb51a8`) is recorded in
public #262 and original #1890; the earlier v0.9.0 import (`070ebf43e25c2bc7885e387712edd18a2e97da1c`) in
public #259 and original #1880; v0.8.2 in public #257 and original #1877; v0.8.1 in
public #255 and original #1874; v0.8.0 in
public #251 and original #1861. Preserve merge ancestry and subtree trailers.
The canonical Issueflow snapshot is byte-identical to revision `0e712c346c7689dd3e00db04fbe00d86090d5908`.
The earlier v0.7.1 import remains recorded in #229 and original #1816. The earlier v0.7.0 import from v0.6.1 remains recorded
in #208 and original #1740. No original application code, assets or history are imported.

v0.8.0 adds integration-ready ownership/queue lifecycle and moves the packaged icon to `shared/icon.svg`.
The earlier v0.7.1 visual follow-up remains applicable. Required host/user evidence and publication-before-closure gates remain authoritative;
a generic unsupported-capture note does not waive a required host gate. Public content, storage and network boundaries,
repository rank, priority ceilings, ownership and queue/heartbeat/idle timers are unchanged.
See [installation](shared/INSTALL.md) and [contribution](shared/CONTRIBUTING.md) instructions.
Improve the core in its own clean repository, release it, then explicitly update both
Lunden pins. Keep this local policy outside the subtree; do not export project history.


### Upstream update discovery

At conductor startup/resume, check stable releases **and version tags** in
`solwation/dirigenten-och-orkestern` against the installed release/commit above.
Reuse a successful check for the same upstream/pin for up to 24 hours; an explicit
update request or suspected orchestra bug requires a fresh check. The conductor owns
this check; workers and queue polls do not repeat it. Read candidate changelogs and
the full intervening instruction diff at exact resolved commits; ignore drafts and
prereleases by default. Compare version numbers, not dates/API order.

Always create/update a proposal in the affected repository's issues for relevant
bug/regression fixes, naming installed/target versions and SHAs, source links,
applicability, compatibility/host-rule effects, checks and next action. Other upgrades
are optional when clearly useful. Reuse existing proposals or recorded deferrals;
respect explicit declines and ordinary priority/ownership rules. Mixed releases must
disclose other changes and migrations. Unreleased main changes are pending, not
stable targets.

**Always update automatically (user, 2026-10-28).** When a newer stable release exists,
import it without asking the user: never add `user-question` or wait for approval for
an orchestra update. Track the import as an ordinary `priority: low` maintenance issue,
read the full intervening diff, import the exact reviewed release per the installation
procedure, update pin/provenance and review links and contradictions against host rules.
Do not interrupt current work; start the import at the next queue selection. Apply the
same release to both lunden-3d-apartment and kvarteret-lunden with cross-linked issues.
Only a genuine conflict with an explicit host rule becomes a `user-question`.

Record UTC check time, upstream/pin, examined targets and outcome in private state
or existing maintenance status. If the read fails or is incomplete, retain the pin, disclose
the limitation once, retry on next session/resume and continue independent work;
never cache failure as success. This check installs no background scheduler.
This applies the core [update-discovery procedure](shared/INSTALL.md#check-for-upstream-updates).
The import follows the existing update procedure, without a user decision.
