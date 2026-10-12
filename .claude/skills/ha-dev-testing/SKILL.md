---
name: ha-dev-testing
description: Testing HA-Plooum-Cards in the local dev Home Assistant - starting it, the ui_test.py suite runner (assertions, helpers for the editor dialog, pointer drags, the preview card), screenshots, console errors, changing entity states. Load it for any task that checks a card or an editor in the browser.
---

# Testing in the dev Home Assistant

CLAUDE.md's **Testing** section is the reference (start / stop, dashboards, test entities, `dev/api.sh`). This skill adds what it doesn't say, learned the hard way.

## Before anything

- `dev/ha.sh status`; `dev/ha.sh start` if it isn't running (~7 s, also the first time in a worktree).
- `npm run build` after every change under `src/`, then reload the page. No HA restart needed (only after `configuration.yaml` changes).
- **Each checkout has its own HA, which serves that checkout's bundle.** The main checkout is on 8123. In a git worktree (what a sub-agent launched with `isolation: "worktree"` has), run `dev/ha.sh start` **in the worktree**: it picks the first free port from 8124 (`dev/.ha-port`), onboards a fresh instance (own token, `/plooum-edit`, areas), and links the main checkout's `.venv` and `node_modules` so `npm run build` and `dev/.venv/bin/python dev/ui_test.py ...` work unchanged. Never test against another checkout's port (you'd test its code).
- `dev/ha.sh status` prints your URL; `dev/ha.sh list` lists every running instance (port, pid, checkout). `dev/shot.py`, `dev/ui_test.py`, `dev/api.sh`, `dev/bootstrap.py` pick your instance on their own (`--url` / `HA_URL` override). **Run them from your own checkout.** Several instances at once slow each other down (a suite took 28 s alone, 60 s with three at the same time): fine, don't lower timeouts.
- **When you're done, `dev/ha.sh stop` in your worktree** (the pilot removes the worktree after the merge; a running instance left behind keeps ~270 MB).

## The agent board

`tools/agent-board/` is a generic page (default http://127.0.0.1:8120, see its README) where the user follows the agents. `dev/ha.sh start` registers your checkout on it, and (sub-agent worktrees only, not the main checkout), and the suites report their runs and tests to it on their own, resolved from your HA port: nothing to do, in the pane (`runner.html`) and headless (`ui_test.py`). If the board isn't running, nothing happens. Use `&board=<url>` on `runner.html` or `--board <url>` on `ui_test.py` to post to another board.

## Which browser

- The built-in browser pane (`mcp__Claude_Browser__*`) is for the user to watch. With several agents, **each uses its own tab**: `tabs_create` (note the `tabId`), `navigate` to **your** instance's URL (`dev/ha.sh status`), and pass `tabId` on every call. Never act on, navigate or close a tab you didn't create; close yours when done. Login is automatic on any port (`trusted_networks`). A sub-agent that has no `mcp__Claude_Browser__*` tool can't open one: it tests headless and gives the pilot its URL, and only the pilot opens a tab per instance. The pane is often only ~800 px wide: too small for the card editor dialog, and a custom `resize_window` gets reset when the pane's width changes.
- For scripted checks and screenshots, use headless Chrome:
  - `dev/shot.py` for a page or a card (exit code 1 on console errors);
  - `dev/ui_test.py` for everything else: a whole feature's test cases as one **suite**, with assertions (see below).
- Phone layout: `--width 420 --height 900`. HA 2026.10 then **stacks the editor dialog's preview below the editor** (rendered, ~2900 px down, out of sight), it doesn't hide it: "rendered with a non-zero size" doesn't tell a narrow dialog. Check whether the preview is *beside* the editor (no horizontal overlap) instead.

## Run a suite live in the pane (always)

**The user always wants to be able to watch** (2026-10-11): run every suite in your own pane tab through `runner.html` (`pause=0` by default; `pause=300` only when the prompt asks for a demo), and do your hand checks (clicks, the editor, states) in that tab too. Headless (`ui_test.py`, `shot.py`) only for screenshots. No browser tool? Say so in your report.

The built-in pane can't be attached to Playwright, so suites run from a page: in **your own tab** (`tabs_create`, `navigate` with its `tabId`), open `http://127.0.0.1:<your port>/plooum_dev/runner.html?suite=<name>[&only=<substring>][&pause=<ms>]` (`<name>` = `dev/tests/<name>.json`; `pause=300` waits between steps so a human can follow). It runs each test in a fresh same-origin iframe sized to the test's viewport (scaled down to fit the pane; its media queries see the real size), with a live PASS / FAIL list. Read the outcome in one call with `javascript_tool`: `while (!window.uiResult) await new Promise(r => setTimeout(r, 300)); JSON.stringify(window.uiResult)` (`{ passed, failed, errors, summary, tests: [{ name, ok, seconds, failedStep, message, got, errors }] }`), or `get_page_text`. `shot` steps are skipped there; the dev user's language is English (set by `dev/bootstrap.py`, re-run it on an older instance), so a French pane gives the same texts as headless. `ui_test.py` runs the very same `dev/ui_runner.js` headless, so both give the same verdict; `dev/runner.html`, `dev/ui_runner.js`, `dev/ui_helpers.js` and the suites are served by the `plooum_dev` integration (restart HA once after updating a checkout older than this feature). Leave your tab on the finished run.

## Test a feature with a suite, not with one run per check

**Rule: write the feature's test cases as a suite under `dev/tests/<feature>.json` and run it in one command; look at screenshots only for the ones the report needs.** A run that opens the editor costs ~3 s (one browser for the whole suite, no fixed waits), but every tool call is a model round trip: one run per check, or reading screenshots to see a result, is what makes testing slow.

```bash
dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-setup-view.json [--only <name substring>] [--out dev/shots] [--verbose]
```

Output: one `PASS  1.8s  <name>` / `FAIL` line per test, then for each failure the failing step, its message, the value, and the console errors of that test; the total time; exit code 1 on a failed test or a console error. A failing test doesn't stop the suite. The docstring of [dev/ui_test.py](../../../dev/ui_test.py) has the format; [dev/tests/floorplan-setup-view.json](../../../dev/tests/floorplan-setup-view.json) is the example to copy.

- A suite: `path`, `viewport`, `tests[]`; a test: `name`, optional `path` / `viewport`, `steps[]`. Every test starts on a **fresh page load** (same browser), so dialog state never leaks between tests.
- Steps: `{"js": "<async body>"}` (value printed with `"print": true` or `--verbose`), `{"assert": "<expression or async body returning a value>", "msg": "...", "show": "<expression printed on failure>"}`, `{"shot": "x.png", "el": "<expression returning an element>"}`, `{"wait": ms}` (a genuine animation only: prefer `waitFor` / `fp.waitIdle`).
- `"finally": [steps]` on a test: steps that always run after `steps`, even after a failure; put state restores there.
- Steps see the helpers by plain name, plus `T` and `S` (= `T.s`, a scratch object kept for the page's life: **put what the next step needs in `S`**, local variables don't cross steps). `JSON` has no comments, but the runner skips lines starting with `//`.
- Helpers live in [dev/ui_helpers.js](../../../dev/ui_helpers.js) (injected once per page as `window.T`): `deep`, `sleep`, `waitFor(fn, timeout, what)`, `pointerDrag`, `tap`, `openEditor(stackIndex)`, `editor()`, `previewCard(title)`, `dashboardCards()`, `cancelDialog()`, and for the floorplan `fp.selectEntity`, `fp.dropCorner`, `fp.dropCornerInPlace`, `fp.dragPicture`, `fp.orbitDrag`, `fp.waitIdle`, `fp.setupBadge`, `fp.setupState`, `fp.snapshot` / `fp.unchanged`. For any card, `T.card.rendered(tag, count)` (cards rendered, no `hui-error-card`; pass the view's **real** card count: the dashboard builds cards lazily, so with a lower count it returns before the others exist and a later check flakes on a cold instance), `T.card.all`, `T.hass()`, `T.card.call(domain, service, data)`, `T.card.waitState(entity, predicate)` and `T.card.editorRenders(card)` (builds the editor without the dialog; it is appended next to the card, not to `body`, because HA's context, `localize` included, only reaches elements inside the app). [dev/tests/cards-smoke.json](../../../dev/tests/cards-smoke.json) is the example of a suite using them. A card's shadow root may hold a single child (`ha-card`; its styles are adopted, not `<style>` elements): test rendered content with `children.length > 0`. Missing one? Add it there (a card of another kind gets its own namespace), not as copy-pasted JS in each suite.
- Wait for conditions, never for time: `await waitFor(() => <predicate>, 8000, 'what')`. Re-fetch an element (`previewCard(...)`) after anything that can rebuild it: HA recreates the preview's card on `config-changed`.
- Write the assertion that would fail without the feature (e.g. `_orbit === null` before, set after), and one on the cards that must not change.

## The editor dialog (what the helpers rely on, for when you need more)

- Card editors only open on the storage dashboard: `/plooum-edit/<view>?edit=1`. The edit button's label is `Edit` (the dev user's language is English, set by `dev/bootstrap.py`).
- `/plooum-edit/floorplan` is a panel view holding **one vertical stack**: the dialog shows the stack editor with tabs 1..6. Pick a card: `stack = hui-stack-card-editor; stack._selectedCard = i; stack.requestUpdate()` (`openEditor(i)` does it). Card 3 (index 2) is "Home in 3D", card 1 (index 0) "Home" (2D).
- The dialog's preview shows **the whole stack**: the card you edit may be off screen (`scrollIntoView()`).
- In a page where the dialog is open, the dashboard cards behind it also exist, with the same config. `card.preview` doesn't tell them apart (true for both in edit mode): search from `hui-dialog-edit-card`'s shadow root (`previewCard`, `dashboardCards`). The dashboard renders some cards lazily: compare only the ones you snapshotted.
- Shadow DOM: `querySelector` doesn't cross shadow roots, and neither does a descendant selector inside `deep()`. Walk the roots, or go up the composed tree with `node.parentNode || node.host`.
- Drive lit components through their reactive properties, e.g. the floorplan editor: `ed._selection = { kind: 'entity', index }`, `ed._cameraAdvanced = true`, then `await ed.updateComplete`.
- To simulate a user action that emits `config-changed`, call the real handler or dispatch the real DOM event (as `fp.dropCorner` does) rather than setting the config.
- Native `<input type="color">`: set `.value` and dispatch an `input` event.
- Synthetic `PointerEvent`s (done by `pointerDrag`): `setPointerCapture` throws on a made-up `pointerId` (stubbed), `pointerdown` goes to the target, `pointermove` / `pointerup` to the element holding the handlers, with `bubbles`, `composed`, `button: 0`, `isPrimary`. The floorplan editor ignores moves under 4 px (a tap): `fp.dropCornerInPlace` moves out and back. `T.pointerDrag(el, null, to)` starts from the center of `el`: pass an explicit `from` when the pointerdown target is a small hit rect. The floorplan editor's grid extent (`ed._ext`) grows after a draw: recompute client coordinates from the live `_ext` before each drag.
- A `shot` step with `el` set to `hui-dialog-edit-card` fails (zero-size clip, `display: contents`): omit `el` for a full-page shot.
- `hui-dialog-edit-card` stays in the DOM after **Cancel**: its presence doesn't tell the dialog is open (`T.editor()` does). For the floorplan card, `fp.setupState().size` is 0 once every editor dialog is closed.
- `wait_for_function` doesn't await a promise: the runner's readiness check is synchronous (connected, every `hui-card` has built its card, the cards are rendered).

## Checking

- Console errors: `dev/shot.py` / `dev/ui_test.py` exit code. Both report only errors, not `console.info` / `log` lines (e.g. a card's version banner): print those with `dev/shot.py --console <substring>` (repeatable, any console type, case-insensitive). The built-in pane's console buffer keeps old messages (websocket failures from an HA restart): don't trust it for a clean check.
- A card that fails `setConfig` is an invisible `hui-error-card` outside edit mode: look for it in the DOM.
- Actions: check the backing entity or counter with `dev/api.sh GET states/<entity>`.
- `dev/shot.py -e` takes a Playwright selector, so `-e ".view3d >> nth=1"` crops to the second 3D view; `--js` runs after that element is there (set a card's config or `_orbit` in it).
- Give screenshot paths in your report. Keep them in `dev/shots/` (gitignored), never commit them.
