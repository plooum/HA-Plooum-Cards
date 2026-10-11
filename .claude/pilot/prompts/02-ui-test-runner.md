# Task: a fast UI test runner for the dev Home Assistant, and the floorplan setup view as its first suite

You are a sub-agent of the pilot. Load the skills `pr-workflow` and `ha-dev-testing` (and `floorplan-card` for the suite) before you start, and read `CLAUDE.md`. Work in the main checkout `/home/doudou/git/HA-Plooum-Cards` (not a worktree). The dev HA is running (`dev/ha.sh status`). In editor dialogs, never click Save. `gh` is `~/.local/bin/gh`. Leave the local branch `feature/dpad-keyboard` alone.

Branch: `feature/ui-test-runner`, off an up-to-date `main`. One PR, never merged by you. End with the `pr-workflow` report.

## Why

The user finds the sub-agents' testing too slow. Measured by the pilot:

- One `.claude/skills/ha-dev-testing/editor_shot.py` run that only opens the editor takes **8 s**, of which **~7 s are fixed waits** (3 s after page load, 2.5 s + 1.5 s in `openEditor`).
- Worse, the sub-agent of PR #7 needed **~50 tool calls**: one run per check, a new JS snippet each time (pointer events re-derived by hand, `setPointerCapture` failing, helpers lost between steps), then reading screenshots to see the result. Each tool call is a model round trip: that's where most of the time goes.

So the goal is **fewer, faster runs**: a whole feature's test cases in **one command**, with **assertions** that print PASS / FAIL, so nobody has to look at screenshots or JSON dumps to know whether it works, and the pilot re-runs the very same suite to check a PR.

## Requirements

### `dev/ui_test.py`: the runner (replaces `editor_shot.py`)

1. `dev/.venv/bin/python dev/ui_test.py <suite.json> [--only <test name substring>] [--out dev/shots] [--verbose]`. Headless system Chrome through Playwright, logged in with `dev/.ha-token` like `dev/shot.py`.
2. Suite format (JSON):
   ```json
   {
     "path": "/plooum-edit/floorplan?edit=1",
     "viewport": [1700, 1050],
     "tests": [
       {
         "name": "wide: corner drop faces the south facade",
         "viewport": [1700, 1050],   // optional, overrides the suite's
         "path": "...",              // optional
         "steps": [
           { "js": "<async JS body>" },                       // run; its return value printed only with --verbose or "print": true
           { "assert": "<JS expression>", "msg": "..." },    // must be truthy; on failure print msg and the expression's value
           { "shot": "name.png", "el": "<JS expression>" }   // "el" optional (crop to that element)
         ]
       }
     ]
   }
   ```
   `assert` may also be an async JS body returning a value (support both: try as expression first).
3. **One browser for the whole suite.** Each test starts on a **fresh page load** of its path and viewport (dialog state must not leak between tests), in the same browser context. No Chrome relaunch per test.
4. **No fixed waits.** Wait for conditions: the page is ready when `home-assistant`'s `hass.connected` is true and the dashboard's cards are defined and rendered; helpers wait with `waitFor(predicate, timeout)` (poll every 50 ms, timeout 8 s by default, error message naming what was awaited). A step may still pass `"wait": ms` for a genuine animation (e.g. the 3D orbit easing), but the helpers should make that rare (e.g. a `waitIdle(card)` that waits until the 3D view stops animating, if you can detect it cheaply).
5. **Helpers injected once per page with `add_init_script`**, all on `window.T`, so every step sees them (fixes the "separate evaluate" friction):
   - generic: `deep(root, selector)`, `sleep(ms)`, `waitFor(fn, timeout, what)`, `pointerDrag(el, from, to, { target, steps, pointerId })` (stubs `setPointerCapture` / `releasePointerCapture`, dispatches `pointerdown` on `target || el`, `pointermove`s and `pointerup` on `el`, `bubbles` and `composed`, `button: 0`, `isPrimary`), `tap(el)`;
   - editor dialog: `openEditor(stackIndex)` (clicks the first card's Edit / Modifier button, waits for the dialog and, for a stack, selects the card; returns the card's editor), `editor()`, `previewCard(title)`, `dashboardCards()` (the cards *not* in the dialog), `cancelDialog()`;
   - floorplan: `T.fp.selectEntity(entityId, { advanced: true })` (selects an entity of the current floor in the editor, opens the Advanced panel, waits for the camera view if it's a camera), `T.fp.dropCorner(index, dx = 10, dy = 6)` (drags a camera-view corner and drops it), `T.fp.dropCornerInPlace(index)` (moves ≥ 4 px and back), `T.fp.orbitDrag(card, dx = 80, dy = 20)` (turns a card's 3D view), `T.fp.setupBadge(card)` (the badge's text or null), `T.fp.setupState()` (`customElements.get('ha-plooum-floorplan-card').setupDialogs`).
   Keep the helpers in their own file, `dev/ui_helpers.js`, read by the runner: easy to read and extend.
6. Output: one line per test, `PASS  1.8s  <name>` / `FAIL  2.4s  <name>`, then for each failure the failing step, its message and value, and the console errors logged during that test. Total time at the end. Exit code 1 if any test failed or logged a console error (same ignore list as `dev/shot.py`).
7. A test failing doesn't stop the suite. `--only` runs the matching tests.
8. Remove `.claude/skills/ha-dev-testing/editor_shot.py`; `dev/shot.py` stays as it is (single page screenshot).

### `dev/tests/floorplan-setup-view.json`: the first suite

The 10 test cases of the floorplan setup view (PR #7, see `.claude/pilot/prompts/01-floorplan-setup-view.md`, "Test cases"), as assertions:

1. wide, card 3 "Home in 3D", garden camera, Advanced open: preview orbit still `null`, no badge; after `dropCorner`: orbit `az ≈ 0`, `tilt 72`, target `[5.5, 5, ~1.25]`, badge `Setup · Garden Camera — south facade`, preview card in view.
2. after the preview's `setConfig` (the drop's `config-changed`): still in the setup view.
3. `orbitDrag` → badge starts with `Free view`, orbit unchanged after the easing; click **Setup view** → setup badge back; `orbitDrag` then `dropCorner` → setup badge back.
4. living room camera: `_level3d === 0`, tilt 50, target ≈ `[3.5, 2.5, …]`, badge ends with `Living Room`.
5. card 1 "Home" (2D): after a drop on a projecting camera `_view === '3d'`; fold Advanced → `_view === '2d'`, orbit null.
6. driveway camera (no projection): after a picture drag, preview orbit still `null`, no badge.
7. in every test that changes something, the dashboard cards keep `_view` / `_orbit` / `_level3d` (snapshot them at the start of the test, compare at the end).
8. narrow (420×900): toggle present; **3D preview** → embedded card with no `.header`, setup badge, `_level3d === 0` for the living room camera; free view and **Setup view** work.
9. `cancelDialog()` → `T.fp.setupState().size === 0`.
10. no console errors (the runner's exit code).

Plus the 2 screenshots of prompt 01 (`setup-wide.png`, `setup-narrow.png`) taken by the suite.

The pilot's verification scripts that worked, to start from (they're in the old `editor_shot.py` format):

```js
// wide: drop a corner on the garden camera, then read the preview and the dashboard cards
await openEditor(2); const ed = window.__ed;
const i = ed._config.floors[0].entities.findIndex(e => e.entity === 'camera.garden_camera');
ed._selection = { kind: 'entity', index: i }; ed._cameraAdvanced = true; await sleep(2500);
const cv = deep(ed.shadowRoot, '.cv')[0]; const c = deep(ed.shadowRoot, '.cv-corner')[1];
cv.setPointerCapture = () => {}; cv.releasePointerCapture = () => {};
const r = c.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2;
const o = { bubbles: true, composed: true, pointerId: 7, button: 0, isPrimary: true };
c.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: x, clientY: y }));
cv.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: x + 10, clientY: y + 6 }));
cv.dispatchEvent(new PointerEvent('pointerup', { ...o, clientX: x + 10, clientY: y + 6 }));
// free view: same pattern on deep(previewCard('Home in 3D').shadowRoot, '.view3d')[0]
// narrow: deep(ed.shadowRoot, '.cv-toggle button')[1].click(); then ed._embedEl
```

### Targets (measure and report them)

- A test that only opens the editor and selects a camera: **≤ 3 s**.
- The whole `floorplan-setup-view.json` suite: **≤ 60 s**, in one command.
- All its tests PASS on `main` as it is (the feature is merged: if a test fails, either the test or the code is wrong; say which in the report, don't change the card's code in this PR).

### Docs

- `.claude/skills/ha-dev-testing/SKILL.md`: replace the `editor_shot.py` parts with `ui_test.py`: how to write a suite, the helpers, and the rule **"write the feature's test cases as a suite under `dev/tests/` and run it in one command; look at screenshots only for the 2 the report needs"**. Keep the pitfalls that still apply (most move into the helpers: say so).
- `.claude/skills/pr-workflow/SKILL.md`: the report's **Tested** section is the suite's output (the PASS / FAIL lines and the total time), plus what the suite doesn't cover.
- `.claude/skills/pilot/SKILL.md`: the prompt gives the test cases as a suite to write (file name, test names, what each asserts); the pilot reviews by re-running the suite.
- `CLAUDE.md`, **Testing** section: one short paragraph on `dev/ui_test.py` and `dev/tests/`.

## The 2 screenshots of your report

1. `dev/shots/setup-wide.png`, taken by the suite (as in prompt 01).
2. `dev/shots/setup-narrow.png`, taken by the suite.

And paste the suite's full output (the PASS / FAIL lines and the total time) in **Tested**.
