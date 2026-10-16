# Development workflow — Kvarteret Lunden

Read [AGENTS.md](AGENTS.md) for public-content, storage and service boundaries. Reply in Swedish.

## Issues are required

- Every implementation task, including changes only to this repository, has an issue in **solwation/lunden-3d-apartment**. Keep tracking there so the user can see all Lunden work together. Name this repository and its affected files in downstream issues. Search before creating to avoid duplicates.
- Add `Lapp: <2–6 everyday Swedish words>` and exactly one priority label: `priority: high`, `priority: medium` (default) or `priority: low`. Do not change priorities without the user's direction.
- Read the current issue, all comments and labels before claiming it. Never take another agent's `in-progress` issue or active reservation.
- Set `in-progress` **in the original repository** when work actually starts. Keep it only while actively working. Remove it when finished, paused, released or reopened.
- Verify the implementation, commit and publish. Link the downstream commit and validation in the original issue, close it when the requested result is complete, and remove `in-progress`. A downstream `Fixes #N` would refer to this repository; use an explicit original issue link and close the correct original issue.
- New issues discovered outside the task get their own issue; do not expand the task silently.

## Working and publishing

- No branches or PRs: commit and push to `main`. Before each task fetch/rebase the current `origin/main`, inspect status and preserve other people's work. Use an isolated ext4 checkout/worktree if the directory is shared.
- Verify user-visible changes in a real browser before pushing, with checks appropriate to the change. Run `npm test` and `npm run build`. Keep README and affected documentation current.
- Every push to this repository's `main` triggers `.github/workflows/pages.yml`: tests, build, then GitHub Pages deployment. Verify the run and live result before reporting publication complete.
- Original improvements are reviewed imports, never an automatic merge. Follow [docs/upstream.md](docs/upstream.md). A downstream-only change does not require an unrelated change in the original app's changelog.

## /orkester

Use [.claude/commands/orkester.md](.claude/commands/orkester.md). Issues, active labels and shared coordination stay in the original repository; code and Pages checks for this project stay here. This static project has no report service, authentication or Cloudflare integration.
