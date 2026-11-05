# Kvarteret Lunden

This is a public, impersonal 3D walkthrough derived from solwation/lunden-3d-apartment. Reply to the user in Swedish. Read README.md and docs/upstream.md before importing source code.

- Preserve buildings, surroundings, fixed fittings, navigation, doors and measurement tools.
- Exclude personal furniture, pictures, drawings, family references, characters, scores, toys and gameplay.
- User-approved exception (#235–238, 2026-11-03): generic ambient ducks, outdoor cats, squirrels and river fish may appear as scenery, alongside the existing ponies. This permits no feeding, petting, catching, targets, scores, sound, personal names or other gameplay. It does not permit other characters.
- No Cloudflare integration, Workers, WebSockets or connections to the original project's shared data or game services.
- Use independent browser storage names. Never read, migrate, clear or modify the original application's stored data.
- Keep a clean history. Import only reviewed source files and assets, not the original repository's complete tree or history.
- Review relevant upstream improvements regularly. Record source commit SHAs and verify dependencies; never blindly merge upstream or automatically publish upstream changes.
- Preserve applicable source attribution and licenses. Verify user-visible changes in a real browser before publishing.
- Do not describe the project as an official Peab service or apartment-specific finishes as verified standard fittings for every dwelling.

## Issues and orchestration

Read [CLAUDE.md](CLAUDE.md) for the mandatory issue lifecycle and [.claude/commands/orkester.md](.claude/commands/orkester.md) for `/orkester`. Changes in this repository require issues too. The user explicitly requested on 2026-10-16 that issues for this project live in `solwation/kvarteret-lunden`. Claim, label, verify and close them here; coordination lives in issue #4. Original-only work stays in the original repository.

## Queue priority

All `solwation/kvarteret-lunden` issues have `priority: low` unless the user gives a later
explicit exception (user, 2026-11-04). Startable original issues always come first;
original priorities order original work normally, while public low-priority work is
oldest first. Already active work may finish. See [CLAUDE.md](CLAUDE.md) and
[the local orchestra policy](.orchestra/project.md) for correction and selection rules.

## Shared orchestra and issue workflow

For issue labels/state, follow [.orchestra/shared/ISSUE-WORKFLOW.md](.orchestra/shared/ISSUE-WORKFLOW.md),
the canonical guide from github-dashboard. Finished handoffs retain their documented
owner with `integration-ready`, without an active slot; see the
[host handoff policy](.orchestra/project.md#integration-handoffs).
For chat change requests, create/reuse the matching issue and start or resume scoped
work under [chat intake](.orchestra/shared/ORCHESTRA.md#turn-chat-requests-into-work),
including after an idle watch ends. Respect explicit deferral and reuse an active conductor.
Read [.orchestra/project.md](.orchestra/project.md) and its shared core/coordination
files. `/orkester` starts a queue session; a scoped chat request does not expand to the
whole backlog or enable timers. Reading these files alone starts no work.
The core is maintained in [dirigenten-och-orkestern](https://github.com/solwation/dirigenten-och-orkestern).
