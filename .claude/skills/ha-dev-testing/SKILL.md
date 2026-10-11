---
name: ha-dev-testing
description: Testing HA-Plooum-Cards in the local dev Home Assistant - starting it, the ui_test.py suite runner (assertions, helpers for the editor dialog, pointer drags, the preview card), screenshots, console errors, changing entity states. Load it for any task that checks a card or an editor in the browser.
---

# Testing in the dev Home Assistant

CLAUDE.md's **Testing** section is the reference (start / stop, dashboards, test entities, `dev/api.sh`). This skill adds what it doesn't say, learned the hard way.

## Before anything

- `dev/ha.sh status`; `dev/ha.sh start` if it isn't running (~10 s, longer the first time).
- `npm run build` after every change under `src/`, then reload the page. No HA restart needed (only after `configuration.yaml` changes).
- **The dev HA serves the bundle of the main checkout** (`/home/doudou/git/HA-Plooum-Cards/ha-plooum-cards.js`). Work and build there. From a git worktree, your build isn't the one served.
- Only one agent tests at a time: the dev HA and the main checkout are shared.

## Which browser

- The built-in browser pane (`mcp__Claude_Browser__*`) is for the user to watch. It's often only ~800 px wide: too small for the card editor dialog, and a custom `resize_window` gets reset when the pane's width changes.
- For scripted checks and screenshots, use headless Chrome:
  - `dev/shot.py` for a page or a card (exit code 1 on console errors);
  - `dev/ui_test.py` for everything else: a whole feature's test cases as one **suite**, with assertions (see below).
- Phone layout: `--width 420 --height 900`. HA 2026.10 then **stacks the editor dialog's preview below the editor** (rendered, ~2900 px down, out of sight), it doesn't hide it: "rendered with a non-zero size" doesn't tell a narrow dialog. Check whether the preview is *beside* the editor (no horizontal overlap) instead.

## Test a feature with a suite, not with one run per check

**Rule: write the feature's test cases as a suite under `dev/tests/<feature>.json` and run it in one command; look at screenshots only for the ones the report needs.** A run that opens the editor costs ~3 s (one browser for the whole suite, no fixed waits), but every tool call is a model round trip: one run per check, or reading screenshots to see a result, is what makes testing slow. The pilot re-runs the same suite to review.

```bash
dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-setup-view.json [--only <name substring>] [--out dev/shots] [--verbose]
```

Output: one `PASS  1.8s  <name>` / `FAIL` line per test, then for each failure the failing step, its message, the value, and the console errors of that test; the total time; exit code 1 on a failed test or a console error. A failing test doesn't stop the suite. The docstring of [dev/ui_test.py](../../../dev/ui_test.py) has the format; [dev/tests/floorplan-setup-view.json](../../../dev/tests/floorplan-setup-view.json) is the example to copy.

- A suite: `path`, `viewport`, `tests[]`; a test: `name`, optional `path` / `viewport`, `steps[]`. Every test starts on a **fresh page load** (same browser), so dialog state never leaks between tests.
- Steps: `{"js": "<async body>"}` (value printed with `"print": true` or `--verbose`), `{"assert": "<expression or async body returning a value>", "msg": "...", "show": "<expression printed on failure>"}`, `{"shot": "x.png", "el": "<expression returning an element>"}`, `{"wait": ms}` (a genuine animation only: prefer `waitFor` / `fp.waitIdle`).
- Steps see the helpers by plain name, plus `T` and `S` (= `T.s`, a scratch object kept for the page's life: **put what the next step needs in `S`**, local variables don't cross steps). `JSON` has no comments, but the runner skips lines starting with `//`.
- Helpers live in [dev/ui_helpers.js](../../../dev/ui_helpers.js) (injected once per page as `window.T`): `deep`, `sleep`, `waitFor(fn, timeout, what)`, `pointerDrag`, `tap`, `openEditor(stackIndex)`, `editor()`, `previewCard(title)`, `dashboardCards()`, `cancelDialog()`, and for the floorplan `fp.selectEntity`, `fp.dropCorner`, `fp.dropCornerInPlace`, `fp.dragPicture`, `fp.orbitDrag`, `fp.waitIdle`, `fp.setupBadge`, `fp.setupState`, `fp.snapshot` / `fp.unchanged`. Missing one? Add it there (a card of another kind gets its own namespace), not as copy-pasted JS in each suite.
- Wait for conditions, never for time: `await waitFor(() => <predicate>, 8000, 'what')`. Re-fetch an element (`previewCard(...)`) after anything that can rebuild it: HA recreates the preview's card on `config-changed`.
- Write the assertion that would fail without the feature (e.g. `_orbit === null` before, set after), and one on the cards that must not change.

## The editor dialog (what the helpers rely on, for when you need more)

- Card editors only open on the storage dashboard: `/plooum-edit/<view>?edit=1`. The edit button's label is `Edit` with the `en-US` locale of the runner, `Modifier` in the user's French pane.
- `/plooum-edit/floorplan` is a panel view holding **one vertical stack**: the dialog shows the stack editor with tabs 1..6. Pick a card: `stack = hui-stack-card-editor; stack._selectedCard = i; stack.requestUpdate()` (`openEditor(i)` does it). Card 3 (index 2) is "Home in 3D", card 1 (index 0) "Home" (2D).
- The dialog's preview shows **the whole stack**: the card you edit may be off screen (`scrollIntoView()`).
- In a page where the dialog is open, the dashboard cards behind it also exist, with the same config. `card.preview` doesn't tell them apart (true for both in edit mode): search from `hui-dialog-edit-card`'s shadow root (`previewCard`, `dashboardCards`). The dashboard renders some cards lazily: compare only the ones you snapshotted.
- Shadow DOM: `querySelector` doesn't cross shadow roots, and neither does a descendant selector inside `deep()`. Walk the roots, or go up the composed tree with `node.parentNode || node.host`.
- Drive lit components through their reactive properties, e.g. the floorplan editor: `ed._selection = { kind: 'entity', index }`, `ed._cameraAdvanced = true`, then `await ed.updateComplete`.
- To simulate a user action that emits `config-changed`, call the real handler or dispatch the real DOM event (as `fp.dropCorner` does) rather than setting the config.
- Native `<input type="color">`: set `.value` and dispatch an `input` event.
- Synthetic `PointerEvent`s (done by `pointerDrag`): `setPointerCapture` throws on a made-up `pointerId` (stubbed), `pointerdown` goes to the target, `pointermove` / `pointerup` to the element holding the handlers, with `bubbles`, `composed`, `button: 0`, `isPrimary`. The floorplan editor ignores moves under 4 px (a tap): `fp.dropCornerInPlace` moves out and back.
- `hui-dialog-edit-card` stays in the DOM after **Cancel**: its presence doesn't tell the dialog is open (`T.editor()` does). For the floorplan card, `fp.setupState().size` is 0 once every editor dialog is closed.
- `wait_for_function` doesn't await a promise: the runner's readiness check is synchronous (connected, every `hui-card` has built its card, the cards are rendered).

## Checking

- Console errors: `dev/shot.py` / `dev/ui_test.py` exit code. The pane's console buffer keeps old messages (websocket failures from an HA restart): don't trust it for a clean check.
- A card that fails `setConfig` is an invisible `hui-error-card` outside edit mode: look for it in the DOM.
- Actions: check the backing entity or counter with `dev/api.sh GET states/<entity>`.
- Give screenshot paths in your report. Keep them in `dev/shots/` (gitignored), never commit them.
