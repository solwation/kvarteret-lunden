# Development workflow — Kvarteret Lunden

Read [AGENTS.md](AGENTS.md) for public-content, storage and service boundaries. Reply in Swedish.

## Issues are required

- Every implementation task for this project has an issue in **solwation/kvarteret-lunden**, as explicitly requested by the user on 2026-10-16. This replaces the previous central original-repository queue. Name affected files and acceptance criteria. Original-only work belongs in the original repository. Search before creating to avoid duplicates.
- Add `Lapp: <2–6 everyday Swedish words>` and exactly one priority label: `priority: high`, `priority: medium` (default) or `priority: low`. Do not change priorities without the user's direction.
- Read the current issue, all comments and labels before claiming it. Never take another agent's `in-progress` issue or active reservation.
- Set `in-progress` **in this repository** when work actually starts. Keep it only while actively working. Remove it when finished, paused, released or reopened.
- Verify the implementation, commit and publish. Link the commit and validation in this repository's issue, close it when the requested result is complete, and remove `in-progress`. Use `Fixes #N` only for this repository's issues; cross-repository work needs explicit links and verification in each affected issue.
- New issues discovered outside the task get their own issue; do not expand the task silently.

## Working and publishing

- No branches or PRs: commit and push to `main`. Before each task fetch/rebase the current `origin/main`, inspect status and preserve other people's work. Use an isolated ext4 checkout/worktree if the directory is shared.
- Verify user-visible changes in a real browser before pushing, with checks appropriate to the change. Run `npm test` and `npm run build`. Keep README and affected documentation current.
- Every push to this repository's `main` triggers `.github/workflows/pages.yml`: tests, build, then GitHub Pages deployment. Verify the run and live result before reporting publication complete.
- Original improvements are reviewed imports, never an automatic merge. Follow [docs/upstream.md](docs/upstream.md). A downstream-only change does not require an unrelated change in the original app's changelog.

## /orkester

Use [.claude/commands/orkester.md](.claude/commands/orkester.md). Issues, active labels, code and Pages checks stay in this repository. Shared coordination is [#4](https://github.com/solwation/kvarteret-lunden/issues/4). This static project has no report service, authentication or Cloudflare integration.

An active `/orkester` keeps polling the complete queue every minute for 60 minutes after the last resolved implementation issue. New in-scope work is handled without restarting; resolving it resets the full hour. Keep UTC checkpoint/status timestamps and stop promptly on the user’s pause/stop. See the command for scope, labels, failures and final-check rules.
