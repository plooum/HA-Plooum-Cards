# Prompt 10: drawn roofs, the gable end of a 3-slope zone only partly against a floor above

You work on HA-Plooum-Cards (a HACS bundle of Lovelace cards, see CLAUDE.md). Load the `pr-workflow`, `ha-dev-testing` and `floorplan-card` skills first. You are in your own git worktree: start your own HA there (`dev/ha.sh start`, port from 8124), `npm run build` there. Run every tool from your worktree. This machine has 7 GB of RAM: one HA, one browser at a time. Node, npm, gh and uv are in `~/.local/bin` (call `~/.local/bin/gh` by its full path).

**The user watches you**: run your suites and your hand checks in **your own tab** of the built-in browser pane (`runner.html`, see `ha-dev-testing`); headless only for screenshots and a final re-run. **Don't stop your HA when done**: the pilot reviews on it and keeps you until the user validated the merge. If you need an answer to go on, stop and put the question in your report (Open questions); you will be resumed.

## Context

The `roofs` option (`docs/floorplan.md`, "Drawn roof"; code around `// --- Drawn roof zones`: `zoneFaces(zone, z, above)`, `roofsFor`) draws a **3-slope** zone as half of a hip roof twice as deep, with a vertical **gable end** on its `direction` side. Since #26, when that side lies along a floor above (any sample just beyond it falls in a room above), the gable end is **skipped entirely**, to avoid a wall coplanar with the floor above. So a side only **partly** against a floor above is left **open** where nothing covers it.

## Goal

Close the uncovered part: the gable end is drawn **only where no room of a floor above stands just beyond that side**, and omitted where one does. Full coverage → no gable end (as now, so pre-filled zones still match the automatic roof exactly); free side → the whole gable end (as now).

## Design (fixed)

- Along the `direction` side, compute the **covered intervals** (the union of the rooms above, intersected with the side, from their exact edges, not sampling), then the **uncovered intervals**.
- The gable end is the vertical polygon under the roof's cut profile along that side (today's `ends` polygon). Clip it to each uncovered interval (it's a polygon in a vertical plane: clip by the two vertical lines at the interval's ends) and emit one `roofWall` per non-empty piece, same normal, same shading. Ignore pieces shorter than 1 cm.
- Keep the code in `zoneFaces` (or one small helper next to it); no duplication with the existing coverage test: replace the sampling with the intervals.

## Suite

Add to `dev/tests/floorplan-roofs.json` (one test, fast): `3-slope gable end only where the side is free`, on the drawn-roof card, with a zone `{ x: 0, y: 4, w: 11, h: 1, slopes: 3, direction: north }` (its north side, y = 4, is against the upstairs from x 0 to 8, free from 8 to 11):
- wall faces of that zone: every point has x ≥ 8 − 1e-6 (nothing over 0–8), and they cover x up to 11;
- the existing cases still pass: full coverage (the strip `x 0, w 8`) → no gable end; free side → one gable end.

Run `floorplan-roofs`, `floorplan-roof-editor` (the pre-filled zones must still match the automatic roof exactly) live in your pane tab, and `cards-smoke` headless.

No docs change unless `docs/floorplan.md` describes the skipped gable end (then say "omitted where it stands against a floor above"). No `CARD_VERSION` bump.

## Delivery

Branch `feature/floorplan-partial-gable`, PR "Floorplan: gable end only where a 3-slope roof isn't against a floor above". Open the PR, check CI, never merge. Report as `pr-workflow` says (short).

Screenshots (headless): 1. `dev/shots/partial-gable-3d.png`: the drawn-roof card with the test zone above, seen from the north-east so the gable end piece over 8–11 shows, closed; 2. `dev/shots/partial-gable-before-after.png` is not needed: instead `dev/shots/partial-gable-top.png`, the same from above (tilt ~20°), showing no wall over 0–8.
