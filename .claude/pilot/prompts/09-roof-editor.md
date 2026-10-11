# Prompt 09: drawn roofs for the floorplan card, part 2: the editor's roof layer

You work on HA-Plooum-Cards (a HACS bundle of Lovelace cards, see CLAUDE.md). Load the `pr-workflow`, `ha-dev-testing` and `floorplan-card` skills first. You are in your own git worktree: start your own HA there (`dev/ha.sh start`, port from 8124), `npm run build` there. Run every tool from your worktree. This machine has 7 GB of RAM: one HA, one browser at a time. Node, npm, gh and uv are in `~/.local/bin`.

**The user watches you**: run your suites and your hand checks in **your own tab** of the built-in browser pane (`runner.html`, see `ha-dev-testing`); headless only for screenshots and a final re-run. **Don't stop your HA when done**: the pilot reviews on it and keeps you until the user validated the merge. If you need an answer to go on, stop and put the question in your report (Open questions); you will be resumed.

## Context

Part 1 (#24, merged) added the card option `roofs: [{ x, y, w, h, slopes, direction, pitch }]` and its 3D rendering: read the "Drawn roof (`roofs`)" section of `docs/floorplan.md` and the code around `// --- Drawn roof zones` (`checkRoofs`, `zoneFaces`, `zoneFloor`, `roofsFor`) and the automatic roof (`roofRects`, `leanSide`, `roofSlopes`, `floorRoof`). The editor ignores `roofs` today.

## Goal (decided by the user, don't reopen)

The user **draws the roof like a floor**, in the editor: the floors' **outer walls are drawn as guides**, the **zones are pre-filled from the automatic roof**, and for each zone the user chooses its **number of slopes (0–4)**, its **direction** and its **pitch**; the user can **add a zone**. Zones are rectangles. Without `roofs`, the card keeps the automatic roof.

## Design (fixed)

### The roof layer

- A **Roof** chip in the editor's floor tabs, after the floors and before `+ Floor` (`mdi:home-roof` icon + "Roof"). It selects the roof layer (an editor state such as `this._roofLayer`, not a floor index); a floor chip leaves it. While it's on: the entity palette is hidden, `+ Same walls` too, and the hint line explains the layer ("Drag on the grid to add a roof zone. Select a zone to set its slopes, direction and pitch.").
- **Guides**: the outer walls of every floor (`wallSegments(...)` with `normal`, per floor's indoor rooms), drawn on the canvas as thin lines, one style per floor (the ground floor solid, the floors above dashed / lighter), not selectable. Outdoor rooms faintly, for reference.
- **Zones**: rectangles drawn over the guides, semi-transparent roof color, each with a glyph showing its shape: arrows pointing down each slope (1–4 slopes), the ridge line for 2 / 3, nothing for flat (a small "flat" label), and its pitch (`35°`) when not flat.
- **Editing zones reuses the room code**: drawing (drag on the grid), moving, resizing with the corner handles, snapping, undo, all through the same code paths as rooms, generalized with a kind (`room` / `roof`) rather than copied. `this._selection = { kind: 'roof', index }` for a selected zone.
- **Selection panel** for a zone: Slopes (a select: `Flat`, `1 slope (shed)`, `2 slopes (gable)`, `3 slopes`, `4 slopes (hip)`), Direction (`North (top)`, `East (right)`, `South (bottom)`, `West (left)`, hidden for flat and 4 slopes, with a one-line helper text saying what it means for the chosen type: 1 = the side the roof faces, 2 = the slopes face this side and its opposite, 3 = the side without a slope), Pitch (number, 5–60°, hidden for flat), and **Delete zone**. Labels through `.computeLabel` (CLAUDE.md: `ha-form` ignores `label`), or plain controls in the panel's style.
- A button **"+ Roof zone"** in the layer (adds a 3 × 3 zone in the middle of the plan, selected), besides drawing.

### Pre-filled from the automatic roof

- One function `autoRoofZones(floors)` (next to `roofsFor`) turns the automatic roof into zones: for each floor, its `roofRects`; a rectangle with a `leanSide` → `slopes: 3, direction: <the lean side>`, else `slopes: 4`; pitch 35. Requirement: `roofsFor(stack, H, autoRoofZones(...))` gives **the same faces** as `roofsFor(stack, H, null)` for the test house and for "Rooms in several zones" (to 1e-6), so pre-filling changes nothing in 3D. If a case can't match exactly (overlapping rectangles, a lean side refused for height), make `autoRoofZones` produce what reproduces the automatic roof best and say so.
- Opening the layer with no `roofs` in the config shows these zones and a hint "Automatic roof: change any zone and the roof becomes yours". Nothing is written to the config until the user changes something; the **first change writes the whole list** (the pre-filled zones with the change) to `roofs`.
- With `roofs` set, a button **"Automatic roof"** (`mdi:auto-fix`) removes `roofs` from the config (back to the automatic roof, undoable).

### Config and preview

Every change dispatches `config-changed` like the other edits (the preview card shows the new roof in 3D). Empty list: keep `roofs: []` only if the user deleted every zone on purpose (no roof); "Automatic roof" is the way back.

### Suite

`dev/tests/floorplan-roof-editor.json`, on `/plooum-edit/floorplan?edit=1`, few tests, fast (open the editor once per test with the existing helpers), run live in your pane tab and headless:
- `auto zones match the automatic roof`: `autoRoofZones` faces equal the automatic faces for the floorplan view's plans (exposed through a card or editor method, see the `floorplan-card` skill on inspecting from tests).
- `roof layer shows guides and pre-filled zones`: the Roof chip shows the layer, the guides of both floors, as many zones as `autoRoofZones` gives, the palette hidden; no `roofs` in the config yet.
- `first change writes the roofs`: change a zone's slopes in the panel → `config-changed` carries `roofs` with every pre-filled zone, the changed one updated.
- `draw, move, delete a zone`: draw a zone by pointer drag → added; move it → its x / y change; Delete zone → removed; Undo restores it.
- `automatic roof button`: removes `roofs` from the config.

Run the smoke suite and the other floorplan suites too (`floorplan-roofs`, `floorplan-setup-view`, `floorplan-projected-windows`).

### Docs

`docs/floorplan.md`: an editor step for the roof layer (the chip, guides, pre-filled zones, the panel's fields, "Automatic roof"), next to the existing editor steps; the `roofs` section says it can be drawn in the editor. No README change, no `CARD_VERSION` bump.

## Delivery

Branch `feature/floorplan-roof-editor`, PR "Floorplan editor: draw the roof (roof layer)". Open the PR, check CI, never merge. Report as `pr-workflow` says (short): suites' outputs (pane and headless).

Screenshots (headless, `dev/shot.py` or the suite's `shot` steps):
1. `dev/shots/roof-editor-layer.png`: the editor dialog on the roof layer: guides of both floors, the pre-filled zones with their glyphs.
2. `dev/shots/roof-editor-panel.png`: a zone selected, its panel (slopes, direction with its helper text, pitch), the preview showing the changed roof in 3D.
