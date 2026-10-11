# Prompt 06: windows and shutters on a projected facade (floorplan 3D): render experiments

You work on HA-Plooum-Cards (a HACS bundle of Lovelace cards, see CLAUDE.md). Load the `pr-workflow`, `ha-dev-testing` and `floorplan-card` skills first. You are in your own git worktree: start your own HA there (`dev/ha.sh start`, it picks a port from 8124), `npm run build` there, and `dev/ha.sh stop` when done. Run every tool from your worktree. This machine has only 7 GB of RAM: one HA, one headless Chrome at a time.

## Context

In the floorplan card's 3D view, an outdoor camera with `projection: true` casts its picture onto the ground, the outer walls and the roof slopes facing it. The covers on outer walls are drawn as windows by `_window3d` (frame, glass, a striped shutter coming down as the cover closes), on **both sides** of the wall (`for (const side of [0.02, -0.02])` in the "Windows" loop of `_buildScene`), **over** the projection. But the projected picture is the real camera picture: it already shows the real windows and shutters. The 3D window on top of it hides it and doubles it.

## Goal (decided by the user, don't reopen)

**The user wants to see renders before deciding.** This PR is an experiment: implement several ways to draw a window on a projected facade, behind a temporary option, and produce comparison renders. The user then picks one; the PR will be finished afterwards (in a later round, with the pilot) with only the chosen behavior. The user's leaning, to have among the variants and as the default for now: **the shutter is transparent / the projection shows on top of it**.

## Design (fixed)

### What counts as "a window on a projected facade"

Only the **outer side** of the window (the side facing outdoors, `side` along `seg.normal`), and only when an outdoor projector projects onto that wall: the same condition as the wall itself in the outer-walls loop (camera in front of the wall: `(pr.pose.C[k] - seg.at) * seg.normal[k] > 0.05`), **and** the window falls in the camera's picture: its 4 corners (or at least its center) through `toPicture(pose, P, aspect)` land inside the picture. One helper computes this (e.g. `projectedOn(window quad) -> projectors[]`), used by every variant: no copy-paste. Occlusion (another wing hiding the window from the camera) is out of scope: say in the report whether it shows in the renders. The inner side and the windows of non-projected facades are drawn exactly as today.

### The variants (temporary option)

A temporary card option `projected_windows` (validated in `setConfig` like `projection_picture`, an array constant next to `PROJECTION_PICTURES`), values:

| Value | Outer side of a window on a projected facade |
| :--- | :--- |
| `solid` | as today: frame, glass, shutter, opaque, over the projection |
| `faint` | **default for now**: the same window, drawn at ~30 % opacity over the projection |
| `overlay` | the window drawn as today, then the projected picture cast over the window's quad too at ~70 % opacity (the projection on top, the shutter showing through) |
| `outline` | only the window's outline (thin frame lines) and the shutter's bottom edge (a line at its position): you see where the window is and how far the shutter is down, the picture is untouched |
| `hidden` | nothing on the outer side: the projection alone |

Keep the code of the variants in one place (`_window3d` gets a mode parameter, or a small dispatcher), English comments in the file's style. Don't document the option in `docs/floorplan.md` yet (it's temporary), and no `CARD_VERSION` bump.

### Test setup: windows the garden camera sees

`camera.garden_camera` (x 14, y 10, direction 310) sees the **south** (+y) and **east** (+x) facades of the ground floor. No cover sits on them today, and its fake picture (`dev/ha-config/custom_components/plooum_dev/camera.py`, `HOUSE_VIEW`) draws no windows, so nothing would show the problem. Fix both:

1. **Two new test covers** in `dev/ha-config/configuration.yaml`, same pattern as `cover.living_room_cover` (template cover backed by an `input_number.*_cover_position`): `cover.kitchen_cover` and `cover.hallway_cover`. Restart your HA after (`dev/ha.sh restart`). Add them to CLAUDE.md's test entities table (one row).
2. **Place them** on the floorplan view's ground floor (`&home_floors` in `dev/ha-config/dashboards/plooum-test.yaml`, so the 3D cards get them): `cover.kitchen_cover` on the east wall of the Kitchen (x 11, y 1.5), `cover.hallway_cover` on the south wall of the Hallway (x 9, y 5, `length: 2`). Check they stick to their wall in 2D and 3D.
3. **Draw them in the fake picture**: in `camera.py`, a `WINDOWS` list next to `HOUSE_VIEW` (keep it in sync with the YAML, say so in a comment on both sides, as the existing ones do), each window drawn on its facade as the card draws it in 3D (sill at 0.36 × wall height, top at 0.84 ×, the given length): a dark frame, a glass, and a shutter (slats) coming down to **the cover's current position** read from `hass.states`, so the real picture and the 3D shutter agree. The camera picture must stay exact (the projection still falls on the facades: re-check visually).

Run `dev/tests/cards-smoke.json` and `dev/tests/floorplan-setup-view.json`: both must still pass (adjust a count in a test only if the new covers change it, and say so).

### Renders (the point of this PR)

Write a script (in your scratchpad, not committed) that, for each variant, sets the option on the "Home in 3D" card (through `setConfig` with a changed config, in the page) and screenshots the 3D view, then assembles the shots into **one comparison grid per viewpoint** (an HTML page of `<img>` screenshotted by Playwright is fine; or PIL, which the venv has):

- columns: the five variants, labeled;
- rows: the two new covers at position **100** (open), **50**, **0** (closed) — set through `input_number.set_value`, wait for the picture and the card to follow (no fixed waits; the frozen projection picture may need a snapshot refresh: find out and say how);
- viewpoints: **A** facing the south / east facades from slightly above, close enough that a window is ~80 px wide; **B** the card's default framing (the whole home). Set the orbit through `card._orbit` (see the skill's orbit convention).

Restore the covers' positions and the card's config afterwards.

## Delivery

Branch `feature/floorplan-projected-windows`, PR **as a draft** (`gh pr create --draft`), titled "Floorplan: windows on a projected facade (render experiments)". Open the PR, check CI, never merge. Report as `pr-workflow` says, plus: how the "projected facade" test works, what each variant looks like in a sentence, anything surprising (occlusion, a window half in the picture, the inner side seen through a faint window).

Screenshots (the report's two, they are what the user will judge):
1. `dev/shots/projected-windows-grid-A.png`: the comparison grid, viewpoint A (close).
2. `dev/shots/projected-windows-grid-B.png`: the comparison grid, viewpoint B (default framing).

Also keep each single shot in `dev/shots/projected-windows/<variant>-<position>-<A|B>.png` (gitignored) so the pilot can show one full size.
