# Prompt 08: drawn roofs for the floorplan card, part 1: the `roofs` option and its 3D rendering

You work on HA-Plooum-Cards (a HACS bundle of Lovelace cards, see CLAUDE.md). Load the `pr-workflow`, `ha-dev-testing` and `floorplan-card` skills first. You are in your own git worktree: start your own HA there (`dev/ha.sh start`, port from 8124), `npm run build` there. Run every tool from your worktree. This machine has 7 GB of RAM: one HA, one browser at a time. Node, npm, gh and uv are in `~/.local/bin`.

**The user watches you**: run your suites and your hand checks in **your own tab** of the built-in browser pane (`runner.html`, see `ha-dev-testing`); headless only for screenshots and a final re-run. **Don't stop your HA when done**: the pilot reviews on it and keeps you until the user validated the merge. If you need an answer to go on, stop and put the question in your report (Open questions); you will be resumed.

## Goal (decided by the user, don't reopen)

Today the 3D view generates the roof (`roofRects`, `hipRoof`, `leanSide`, `roofSlopes`, `floorRoof`, ~line 820–960): a hip roof over each part of the home no floor covers, a 3-slope lean-to against a floor above, fixed pitch `ROOF_PITCH` (0.7 = 35°). The user wants to **draw the roof like a floor**: rectangular **roof zones**, each with its **number of slopes (0, 1, 2, 3 or 4)**, its **direction**, and its **pitch**. This PR is **part 1**: the config option and the 3D rendering, in YAML. Part 2 (later, another prompt) is the editor's roof layer (floor outlines drawn as guides, zones pre-filled from the automatic roof, add / move / resize a zone, its settings).

Fixed by the user: zones are **rectangles** (like rooms); slopes **per zone**, 0 (flat) to 4; **pitch per zone**; without `roofs` in the config, **the automatic roof stays exactly as today** (no breaking change).

## Design (fixed)

### Config

A card option `roofs`: a list of zones `{ x, y, w, h, slopes, direction, pitch }` in plan units, like rooms.

- `slopes`: `0` flat, `1` shed, `2` gable, `3` three slopes and one vertical gable end, `4` hip. Default `4`.
- `direction`: `north` (-y, the top of the plan), `east` (+x), `south` (+y), `west` (-x), the convention the card already uses for facades (`'south facade'`, ~line 2254). Meaning per type:
  - `1`: the side the slope **faces** (runs down towards); the high side is opposite, with a vertical wall under it.
  - `2`: the slopes face `direction` and its opposite (the ridge runs across `direction`); `north` ≡ `south`, `east` ≡ `west`. Gable walls on the two other sides.
  - `3`: the side **without** a slope (the vertical gable end). This is exactly today's lean-to (half of a hip roof twice as deep, `roofSlopes(rect, z, lean)`), with `direction` = the side against the wall.
  - `0`, `4`: ignored.
  - Default `south` for 1, 2 and 3.
- `pitch`: degrees, default `35` (today's `ROOF_PITCH`: keep the constant, as the default, `Math.atan(0.7)` ≈ 35°: use the exact same rise per run for 35 so a 4-slope zone renders **identically** to today's hip roof). Range 5–60, ignored for `0`.
- Validation in `setConfig` (like `projection_picture`): a zone without numeric `x, y, w, h` (w, h > 0), `slopes` not in 0–4, an unknown `direction`, `pitch` out of range → throw with a clear message.

### Where a zone sits

A zone stands on **the highest floor whose rooms (indoor) cover its center**; none → on the ground floor. Its eave starts at that floor's wall top (`z0 + H`), as today. It belongs to that floor for every visibility rule of the 3D view (the roof chip, a floor chip showing that floor and the ones below without their roof, the cutaway): keep today's rules, only the source of the slopes changes.

### Geometry

One function computes a zone's faces: its slopes (with the `{ pts, n, plane }` shape of `hipRoof`, so projections and tiles keep working) **and** its vertical walls (gable triangles for `2`/`3`, the high wall and side triangles for `1`; none for `0`/`4`) in the wall color with the wall shading. Reuse `hipRoof` / `roofSlopes` for `4` and `3`; the overhang (`ROOF_OVERHANG`) applies to every type except under a gable / high wall, where the roof stops flush with the wall plus the overhang along its slope edge (look at real gable roofs: the eaves overhang, the gable wall rises from the facade). `0` flat: a thin flat roof at the wall top with the overhang, roof color, no tiles.

One entry point, used by **both** the rendering and the outdoor-projection **occluders** (today both call `floorRoof`): `roofsFor(floors, config)` (or similar) returns per floor the faces, from `config.roofs` when set, else from the automatic roof (today's code, unchanged). No duplicated roof logic. Outdoor projection onto roof slopes keeps working (slopes facing the camera get the picture); onto the new vertical walls too if they face the camera, like outer walls.

### Test setup

On `/plooum-test/floorplan`, add a 3D card **"Home, drawn roof"** after "Home in 3D", same `*home_floors`, `view: 3d`, with `roofs` covering the test house (ground floor 11 × 5, upstairs 8 × 4 at 0,0):

- upstairs `{ x: 0, y: 0, w: 8, h: 4, slopes: 2, direction: south }`;
- the kitchen / hallway wing `{ x: 8, y: 0, w: 3, h: 5, slopes: 1, direction: east, pitch: 20 }`;
- the strip along the terrace `{ x: 0, y: 4, w: 8, h: 1, slopes: 3, direction: north }` (against the upstairs wall, like today's lean-to).

Adjust counts in existing suites only if the new card changes them, and say so.

### Suite

`dev/tests/floorplan-roofs.json`, fast (a few seconds), run live in your pane tab and headless:
- `without roofs: unchanged`: the "Home in 3D" card's roof faces (call the new entry point in the page) equal today's (`floorRoof`) for the test house, same points to 1e-6.
- `each slope count renders`: `setConfig` the drawn-roof card with the upstairs zone at `slopes` 0, 1, 2, 3, 4 in turn: no error, the expected number of slope faces (0 → 1 flat face, 1 → 1, 2 → 2, 3 → 3, 4 → 4) and vertical walls (0, 3, 2, 1, 0).
- `invalid zone throws`: bad `slopes`, bad `direction`, `pitch: 80`, `w: 0`.
- `projection on drawn roof`: with the garden camera projecting, the drawn-roof card has at least one roof face carrying the camera's picture (inspect the built scene).

### Docs

`docs/floorplan.md`: the `roofs` option (a short section with the table of the 5 types and what `direction` means for each, and a YAML example), and update the sentence saying the roof is a best effort generated one: generated unless `roofs` is set. No README change unless the READMEs list floorplan options (they don't). No `CARD_VERSION` bump.

## Renders for the user (5, no more)

The upstairs zone of "Home, drawn roof" switched to `slopes` 0, 1, 2, 3, 4 (direction `south`, pitch 35), the rest unchanged, **one shot each** from the same viewpoint (from the south-east, slightly above, the whole house in the frame): `dev/shots/roofs/slopes-<n>.png`, plus one strip `dev/shots/roofs-5.png` (the 5 side by side, labeled). Headless with `dev/shot.py` is fine for these.

## Delivery

Branch `feature/floorplan-roof-zones`, PR "Floorplan: drawn roof zones (roofs option), 3D rendering". Open the PR, check CI, never merge. Report as `pr-workflow` says (short), with the suite's output (pane and headless) and the smoke suite's.

Screenshots: 1. `dev/shots/roofs-5.png` (the strip); 2. `dev/shots/roofs-drawn-card.png`: the "Home, drawn roof" card as configured (gable upstairs, shed wing, 3-slope strip), with the garden camera's projection.
