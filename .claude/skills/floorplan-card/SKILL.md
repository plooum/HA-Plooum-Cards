---
name: floorplan-card
description: Working on the floorplan card (src/cards/floorplan/ha-plooum-floorplan-card.js, ~7,200 lines) - map of the file, plan / 3D / camera conventions, the editor's camera alignment, the 3D view's orbit, and pitfalls. Load it before changing the floorplan card or its editor.
---

# Floorplan card

One file, [src/cards/floorplan/ha-plooum-floorplan-card.js](../../../src/cards/floorplan/ha-plooum-floorplan-card.js). Its user docs: [docs/floorplan.md](../../../docs/floorplan.md). Don't read the file top to bottom: grep for the section, then read around it. Line numbers below are approximate (they drift).

## Map

| Lines | What |
| :--- | :--- |
| 1–130 | constants: `CARD_VERSION`, `CARD_DEFAULTS`, ranges, `U3` (px per plan unit in 3D), `ORBIT_DEFAULT`, `TILT_MIN/MAX` |
| ~130–620 | plan helpers: rooms, `roomAt`, `resolveFloor(hass, floor)` (items with state, camera settings, `plan.indoor`, `plan.rooms`, `plan.bounds`) |
| `// --- Cameras` ~627 | camera config normalization (direction, tilt, fov, height, distortion, pins…) |
| `// --- 3D geometry` ~740 | `wallSegments`, walls, roofs |
| `// --- Camera model` ~978 | `cameraHeight`, `cameraPose(cam, C, z0)`, `toPicture(pose, P, aspect)`, lens model |
| `// --- WebGL renderer` ~1181 | `Mesh`, `GlScene`, `viewMatrix` |
| ~1800–2040 | camera solving and editor geometry: `solveCamera`, `planCorners`, `facadeCorners`, `planOccluders`, `segmentToPicture` |
| `class HaPlooumFloorplanCard` ~2188 | the card. `// --- 3D view` ~3068 (`_homeView`, `_renderScene3d`, `_shownOrbit`, `_buildScene`), interactions ~3986–4115 (`_down3d`, `_move3d`, `_up3d`, `_wheel3d`, `_zoom3d`, `_resetView`, `_screenTap`) |
| `class HaPlooumFloorplanCardEditor` ~5178 | the editor. `_editFloor`, `_applyDrag`, the selection panel and camera "Advanced: 3D and projection" panel (~5650), `_renderCameraView` (~5747), `_cvDown/_cvMove/_cvUp`, `_pinnedSettings`, `_selectionChanged`, `_cameraDefaults` |
| ~7225 | registration |

## Conventions

- Plan coordinates: x to the right, y **down**, in plan units (≈ metres). Floor k stands at `z0 = k * (wallHeight + SLAB)`.
- Camera `direction`: degrees in the plan, `tilt`: down from horizontal, `fov`: horizontal.
- **3D orbit** (`this._orbit`, null = framed by `_homeView`): `{ az, tilt, dist, target: [x, y, z] }`. The eye is `target + d·(sin t·sin a, sin t·cos a, cos t)` with `d = dist / U3`: `tilt` 0 = straight down, 90 = horizontal; the eye's horizontal direction from the target is `(sin az, cos az)`, so `az = atan2(nx, ny)` puts the eye along the plan vector `(nx, ny)`. `_shownOrbit` animates towards a new `_orbit`. `_screenTap` is a worked example of a computed orbit (behind a camera, framing its screen). `dist` is in px (`U3` = 100 px per plan unit): `dist: 1000` is 10 units from the target. In a test or a render script, set `card._orbit` (and `card.setConfig({...card.config, ...})`) in the page: no reload needed.
- **Camera pictures refresh on `card._tick`** (the `t=` query of every snapshot URL). After changing what a dev camera films (a cover's position), bump `card._tick++` and wait for the new picture; a camera without `reference_picture` projects its latest snapshot.
- 3D view state: `_view` ('2d' / '3d'), `_level3d` (shown floors, null = all + roof), `_focus`. `_scene3dState` holds `vp` (`{ w, h, p }`: viewport and perspective distance), `home`, `screens`, `cameras`.
- `facadeCorners(plan.indoor, wallHeight, pose, aspect, hidden)` returns the 4 corners of the facade an outdoor camera sees best: the one the editor offers for pinning. An indoor camera uses its own room: `plan.indoor[roomAt(plan.indoor, x, y)]`.

## Editor pitfalls

- During a corner or picture drag, the new camera settings only live in `this._camDrag.settings` (applied to the rendered floor by `_applyDrag`). **`config-changed` is only dispatched on pointer up** (`_cvUp`): the HA preview card updates on drop, not during the drag.
- HA may give the preview card a new config through `setConfig` or recreate it (stacks rebuild their cards): state that must survive an update can't live only on the card instance.
- The card has no direct link to its editor: they're separate elements, both somewhere under `hui-dialog-edit-card`'s shadow root. Both are defined in this file, so module-level state is shared between them.
- In edit mode `card.preview` is true for the dashboard cards too, not only for the dialog's preview (see `ha-dev-testing`).

## Setup view (editor ↔ preview)

While a projecting camera is lined up (Advanced panel open), the dialog's preview card, or the editor's embedded card in a narrow dialog, shows the projection from a checking viewpoint. Design, to reuse for anything else the editor must show in the preview:

- `setupView(hass, floors, req, vp, wallHeight)`: the one function computing the viewpoint (outdoor: facing `facadeCorners`' facade; indoor: above the camera, its floor only; else behind the camera).
- `setupDialogs`: module-level `Map` keyed by the `hui-dialog-edit-card` element (found with `dialogOf()`, walking `parentNode || host`): the editor, its config, the request `{ camera, floor, aspect, seq }`, the registered cards, free-view state, the view to restore (`before`). Cards register in `connectedCallback` and read it right away, which is how a card rebuilt by HA keeps the setup. Readable in tests as `customElements.get('ha-plooum-floorplan-card').setupDialogs`.
- `setupTarget(state)`: the preview's card, matched by config (`configKey()` caches the JSON strings per config object: it runs on every card update).
- Editor: `_setupBump()` after each alignment change (`seq++`), `_checkLayout()` (rAF-coalesced, never during a drag) decides wide vs narrow, `_embeddedCard()` is a real card with `_embedded = true` (no header).
- Card: `_syncSetup()` (from connect, `setConfig`, `updated`), `_userMoved()` in every 3D gesture → free view, `_renderSetupBadge()`.

## Test plan

`/plooum-test/floorplan` and `/plooum-edit/floorplan?edit=1` (stack card 1 "Home" in 2D, card 3 "Home in 3D", card 4 "floating screens"). Cameras: `camera.garden_camera` (outdoor, wide angle, `distortion: -0.25`, projected), `camera.living_room_camera` (indoor, projected), `camera.garage_camera` (can become unavailable), `camera.does_not_exist` (missing). Their pictures are rendered from their real pose, so a right setting makes the projection fall exactly on the walls and floor.
