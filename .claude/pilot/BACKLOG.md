# Backlog

What is left to do, kept by the pilot (user's request, 2026-10-11). Committed straight to `main` with the handoff, no PR. The handoff's **State** tracks work in progress; this file lists what hasn't started. When an item starts, move it to the handoff's State; when it's merged, delete it here.

[TODO.md](../../TODO.md) stays the repo's list of out-of-scope issues noticed while working (changed through PRs); its items are mirrored here so this file is the one complete inventory.

_Last update: 2026-10-11, pilot session 3 (roofs and projected-facade shutters added)._

## Waiting on the user

Nothing.

## Next

- [ ] **Bug (user, 2026-10-11): `projected_windows: hidden` — the windows / shutters of a projected facade show again when the 3D view's angle changes** (user's screenshots: same facade, projected, windows hidden from one angle, solid striped shutters from another). Pilot's hypothesis, to check first: the **inner side** of each window (`side = -0.02` in the "Windows" loop of `_buildScene`, always `solid`) shows through the wall 2 cm in front of it (depth precision from far / grazing views); fix by drawing each side only when the eye is on that side of the wall (like the wall projections' `eye` test), plus a test that rotates the orbit. Other suspects: `projectedOn` (camera-only test, no eye), a scene rebuild path that skips it.

- [ ] **Roof layer checks**: touch input, narrow edit dialog, a plan generated from areas (not tested by prompt 09).

- [ ] **Suites restore entity states even when a test fails** (prompt 07 friction): a failing smoke test leaves e.g. `input_number.living_room_temperature` changed; a `finally`-style restore step in `ui_runner.js` / the suites. Small dev-tool PR.

- [ ] **`dev/shot.py --console <substr>`**: print matching `console.info` / `log` lines (prompt 04 friction; the skill points to the pane meanwhile). Small dev-tool PR, when convenient.

## Dropped (user, 2026-10-11)

- Android test of the floorplan setup view: not needed.
- Fisheye lenses / any more complex camera handling: never.
- `feature/dpad-keyboard`: deleted.
