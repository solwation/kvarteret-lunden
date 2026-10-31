# Development workflow — Kvarteret Lunden

Read [AGENTS.md](AGENTS.md) for public-content, storage and service boundaries. Reply in Swedish.

## Issues are required

- **Ports have the lowest priority (user, 2026-10-20).** Work that transfers improvements from
  `lunden-3d-apartment` to `kvarteret-lunden` always has `priority: low`, unless the user explicitly
  specifies otherwise. This includes bug-fix ports and their implementation, test and support children;
  the original issue's priority does not raise the port's priority. Apply this rule when creating work
  and before every queue selection: lower existing higher-priority ports unless an explicit user exception
  applies, then enforce the full ancestor ceiling. Preserve ownership, dependencies and the original
  issue's own priority. Continue to review both queues and transfer applicable improvements; independent
  public-project work that is not a port keeps its ordinary triage.
- Every implementation task for this project has an issue in **solwation/kvarteret-lunden**, as explicitly requested by the user on 2026-10-16. This replaces the previous central original-repository queue. Name affected files and acceptance criteria. Original-only work belongs in the original repository. Search before creating to avoid duplicates.
- Follow [Issueflow](.orchestra/shared/ISSUE-WORKFLOW.md), the public Issue workflow
  instructions from github-dashboard, for issue labels, status and closure (user, 2026-10-23).
  Add `Lapp: <2–6 everyday Swedish words>`, exactly one canonical priority assessed by
  impact/urgency, and a short rationale. Bugs are not automatically high priority.
  Preserve explicit/existing priorities except automatic child/port lowering below.
  Remove all recognized work labels on pause, integration wait, closure or reopening;
  reclaim only when actual work resumes. Owner labels are separate metadata.
- **Child priorities never exceed their parents (user, 2026-10-20).** New child stories default to the parent's
  priority; a lower priority is allowed and must be preserved. This applies to every child, including bugs,
  regressions, test/support stories and further subdivisions, and also constrains the impact-based priority of bugs.
  Use the lowest priority in the complete ancestor chain as the ceiling, including closed parents and explicit
  cross-repository parentage; a missing priority counts as medium. Read GitHub parent/sub-issue links and explicit
  parentage in titles, bodies and comments (`Del av #N`); an ordinary reference, dependency, transfer link or a bug
  discovered while working on another issue does not by itself establish parentage. Do not reclassify a genuine
  child as independent to bypass the ceiling, or raise a parent to preserve a child's higher priority.
  At creation, when linking/reparenting, after a parent's priority changes and before each queue selection/idle check,
  automatically lower any child label that exceeds the ceiling, recursively through all open descendants. No further
  user approval is required for these corrections; keep exactly one priority label, record the parent and reason,
  and preserve ownership, active labels, dependencies and already lower priorities. Raising a parent does not
  automatically raise existing children. Fetch missing parents before deciding; do not guess at unresolved links.
- Questions for the user go on the issue as a comment with the `user-question` label, never in chat; the issue is blocked until answered (user, 2026-10-17).
- Read the current issue, all comments and labels before claiming it. Never take another agent's `in-progress` issue or active reservation.
- Set `in-progress` **in this repository** when work actually starts. Keep it only while actively working. Remove it when finished, paused, released or reopened.
- Verify the implementation, commit and publish. Link the commit and validation in this repository's issue, close it when the requested result is complete, and remove `in-progress`. Use `Fixes #N` only for this repository's issues; cross-repository work needs explicit links and verification in each affected issue.
- New issues discovered outside the task get their own issue; do not expand the task silently.

## Working and publishing

- No branches or PRs: commit and push to `main`. Before each task fetch/rebase the current `origin/main`, inspect status and preserve other people's work. Use an isolated ext4 checkout/worktree if the directory is shared.
- **Risk-based verification (user, 2026-10-21):** choose 2–3 sufficient checks and stop when they pass. Docs-only
  changes need diff/link/contradiction review, no browser or triangle counts. Local app changes need the affected
  component and real route/view; wider profiles need concrete global risk. Reuse source/input/quality-bound green
  evidence across unrelated rebases; the conductor reviews rather than automatically reruns it. Reassess verification
  cost near 10 minutes. Follow the [orchestra policy](.orchestra/shared/ORCHESTRA.md#verification)
  and [verification guide](docs/verification.md#verifieringspolicy). Run the existing fast `npm test` and `npm run build`;
  keep README and affected documentation current. User requirements, hard contracts and public isolation remain in force.
- Every push to this repository's `main` triggers `.github/workflows/pages.yml`: tests, build, then GitHub Pages deployment. Verify the run; check changed app behaviour live when the scoped plan requires it. Docs-only changes do not require a new browser check of the unchanged app.
- Original improvements are reviewed imports, never an automatic merge. Follow [docs/upstream.md](docs/upstream.md). A downstream-only change does not require an unrelated change in the original app's changelog.

## /orkester

Read [.orchestra/project.md](.orchestra/project.md) and its versioned, model-independent
core/coordination files. [.claude/commands/orkester.md](.claude/commands/orkester.md) is a
thin adapter; other agent tools read the same files directly. The policy retains both
queues, global ordering, ownership, two-worker capacity, 300-second polling, 60-minute
idle watch, heartbeats, original-only intake and public-content boundaries. Use a short
scope/risk plan, useful parallelism, one delivery for small issues and existing focused
verification. Keep local policy outside the imported subtree; improve shared behavior
in its own repository and explicitly adopt a reviewed release here. Preserve subtree
merge ancestry with `git rebase --rebase-merges` for unpublished subtree imports.
