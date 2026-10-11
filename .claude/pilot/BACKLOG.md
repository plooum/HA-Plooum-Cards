# Backlog

What is left to do, kept by the pilot (user's request, 2026-10-11). Committed straight to `main` with the handoff, no PR. The handoff's **State** tracks work in progress; this file lists what hasn't started. When an item starts, move it to the handoff's State; when it's merged, delete it here.

[TODO.md](../../TODO.md) stays the repo's list of out-of-scope issues noticed while working (changed through PRs); its items are mirrored here so this file is the one complete inventory.

_Last update: 2026-10-11, pilot session 3 (roofs and projected-facade shutters added)._

## Waiting on the user

Nothing.

## Next

- [ ] `.claude/worktrees/` shows as untracked in the main checkout (sub-agent worktrees): add it to `.gitignore` (tiny PR).


- [ ] **Roof layer checks**: touch input, narrow edit dialog, a plan generated from areas (not tested by prompt 09).

- [ ] **Suites restore entity states even when a test fails** (prompt 07 friction): a failing smoke test leaves e.g. `input_number.living_room_temperature` changed; a `finally`-style restore step in `ui_runner.js` / the suites. Small dev-tool PR.

- [ ] **`dev/shot.py --console <substr>`**: print matching `console.info` / `log` lines (prompt 04 friction; the skill points to the pane meanwhile). Small dev-tool PR, when convenient.

## Dropped (user, 2026-10-11)

- Android test of the floorplan setup view: not needed.
- Fisheye lenses / any more complex camera handling: never.
- `feature/dpad-keyboard`: deleted.
