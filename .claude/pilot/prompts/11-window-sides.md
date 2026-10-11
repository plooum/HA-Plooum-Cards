# Prompt 11 (fast path): projected windows reappear when the 3D view turns

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow` (its **fast path**) and `ha-dev-testing`; the `floorplan-card` skill only if you need it. Your own worktree: `dev/ha.sh start`, `npm run build`. `~/.local/bin/gh` by full path. **Be very fast**: one function, one test, no screenshots, a 5-line report. Watchable: run the suites in your own pane tab (`runner.html`, `pause=0`). Keep your HA running at the end. A question → stop and report it.

## Bug (user)

With `projected_windows: hidden` (or `outline`, `overlay`), the windows / shutters of a facade a camera projects onto are hidden from one angle, and show again as **solid striped shutters** when the 3D view turns.

## Cause (pilot's analysis) and fix (fixed)

`src/cards/floorplan/ha-plooum-floorplan-card.js`, in `_buildScene`, the loop after `// Windows: covers on an outer wall, on both sides of it.` (~line 4040): each window is drawn twice, `for (const side of [0.02, -0.02])`; the outer side follows `style`, the **inner side is always `'solid'`**, 2 cm behind the wall, and it shows through the wall from far / grazing views (depth precision).

Fix: draw a side **only when the eye is on that side of the wall**: `(eye[k] - seg.at) * seg.normal[k] * side > 0` with `k = seg.o === 'h' ? 1 : 0` (`eye` is defined at the top of `_buildScene`, ~line 3590; the outer walls' projection already uses this test). One line in that loop; a short comment. Nothing else changes.

## Test

Add one test to `dev/tests/floorplan-projected-windows.json`: `inner side never shows outside` — on "Home in 3D" with `projected_windows: hidden`, wrap `card._window3d` to record `(style, o)` of each call, set `card._orbit` to 4 views around the house (az 0, 90, 180, 270; tilt 70; target the house center; see the skill's orbit convention: `dist` in px), rebuild after each, and assert: no `'solid'` call for a window of the projected facades (`cover.kitchen_cover`, `cover.hallway_cover`) whose side faces away from the eye, and from outside (eye beyond those facades) no call at all for them. Restore the config and `_window3d`.

Run in your pane tab: `floorplan-projected-windows` and `cards-smoke`. Headless: the same two, once.

## Delivery

Branch `feature/floorplan-window-sides`, PR "Floorplan: draw each side of a window only from its side of the wall". Open it, check CI, never merge. Report: the two suite lines, the diff size.
