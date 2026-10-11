# Backlog

What is left to do, kept by the pilot (user's request, 2026-10-11). Committed straight to `main` with the handoff, no PR. The handoff's **State** tracks work in progress; this file lists what hasn't started. When an item starts, move it to the handoff's State; when it's merged, delete it here.

[TODO.md](../../TODO.md) stays the repo's list of out-of-scope issues noticed while working (changed through PRs); its items are mirrored here so this file is the one complete inventory.

_Last update: 2026-10-11, pilot session 2._

## Waiting on the user

- [ ] **Try the floorplan setup view (#7, V1.1.0) in the HA Android app.** The desktop pane doesn't prove mobile rendering (narrow layout: Setup / 3D preview toggle).
- [ ] **Next features.** No feature request is queued: the user says what to build next.
- [ ] **`feature/dpad-keyboard`**: local branch from 2026-10-10, no commit beyond `main`, never pushed. Keyboard control for the D-Pad is a wanted feature, or delete the branch?
- [ ] **`CARD_VERSION` for every card?** Only floorplan (1.8.0), multistatus (1.3.0) and vivarium (1.0.0) declare one and log it with `console.info`; button-badge, cover, dpad, gridicons, tabbed and temp-humidity don't. Add it to all six (one PR), or leave it?

## Ready to launch (pilot's call, no user decision needed)

- [ ] **Test views for the five cards that lack one.** CLAUDE.md wants a view per card in `dev/ha-config/dashboards/plooum-test.yaml`; dpad, cover, gridicons, tabbed and button-badge only appear once in the `all` view. Add a view each, wired to the test entities, with the on / off / unavailable / missing-entity cases. Disjoint from everything else: can run in parallel.
- [ ] **UI test suites per card.** `dev/tests/` only has `floorplan-setup-view.json`. A smoke suite per card (renders, no `hui-error-card`, an action reaches its counter / entity, the editor opens and emits `config-changed`) would catch regressions. Depends on the test views above for the five cards.

## Housekeeping

- [ ] **Stale remote branches.** `origin/feature/{floorplan-setup-view, floorplan-version-1.8.0, parallel-instances, pilot-workflow, skills-setup-view-friction, ui-test-runner}` are merged (#6–#11) but still on GitHub: `gh pr merge --delete-branch` didn't delete them. Delete them (`git push origin --delete ...`) and find out why the flag didn't work (likely run from a worktree), then note it in the `pilot` skill.

## Conditional (only if needed)

- [ ] **Floorplan: fisheye lenses** (from TODO.md). The `distortion` division model fits up to ~150°; a true fisheye (equidistant, past 180°) needs another model. Only if a real camera needs it.
- [ ] **More card skills** (`vivarium-card`, ...): write one when a sub-agent loses time on a card, not before.
