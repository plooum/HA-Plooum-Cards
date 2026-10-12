# Prompt 17: roof layer checks (touch, narrow dialog, plan generated from areas)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow`, `ha-dev-testing` and `floorplan-card` (only its roof / editor lines). Your own worktree: `dev/ha.sh start`, `npm run build`. `~/.local/bin/gh` by full path if `gh` isn't found. **Never the built-in browser pane**: suites with `dev/ui_test.py` (the user watches them on the agent board), hand checks with `dev/shot.py --js`. **Be fast**: read `dev/tests/floorplan-roof-editor.json` (your model), `dev/ui_helpers.js` around `pointerDrag` / `openEditor` / `card.editorRenders`, and only the editor code you need (grep `_roofLayer`, `_editRoofs`). A question → stop and report it. Keep your HA running at the end.

## Goal

The floorplan editor's roof layer (PR #26) was tested only with a mouse, in a wide dialog, on a hand-drawn plan. Check the three untested cases with **3 tests, the strict minimum**, added to `dev/tests/floorplan-roof-editor.json`:

1. `roof layer: touch draw` — on "Home in 3D" (`openEditor(2)`), Roof chip, then draw a zone with **touch** pointer events: give `T.pointerDrag` an option `pointerType` (default `'mouse'`, one line in `dev/ui_helpers.js`) and pass `'touch'`; same rectangle and asserts as the "draw, move, delete a zone" test's first draw (a zone is added at x 11.5, y 6, w 1.5, h 1.5, 4 slopes).
2. `roof layer: narrow dialog` — viewport `[420, 900]` (the skill: the preview stacks below the editor), `openEditor(2)`, Roof chip: the canvas is visible and fits the dialog width (no horizontal overflow of the editor), the pre-filled zones are drawn (`.e-roof` count = `_autoRoofZones().length` > 0), and selecting a zone shows its panel (`Delete zone`).
3. `roof layer: plan generated from areas` — the "Generated from areas" card (in a horizontal-stack of `/plooum-edit/floorplan`, so build its editor with `T.card.editorRenders(card)` rather than the dialog): Roof chip → pre-filled zones > 0 and the guides drawn, or, if a generated plan has no roof layer by design, assert what the editor shows instead and say so in the report.

## If a test fails

A card bug: fix it if it's small and local (one function), with the test proving it; otherwise **stop and report** it (what fails, where, your proposed fix). Don't change what the existing tests check.

## Run

`dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-roof-editor.json` once at the end, and `dev/tests/cards-smoke.json` only if you touched `src/`. No screenshots.

## Delivery

Branch `feature/roof-layer-checks`, PR "Floorplan editor: roof layer tests for touch, narrow dialog and generated plans". Open it, don't wait for CI, never merge. Report as `pr-workflow` says (no screenshots), with the suite output and any bug found.
