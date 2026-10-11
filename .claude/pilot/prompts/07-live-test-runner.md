# Prompt 07: run the UI test suites live in the built-in browser pane

You work on HA-Plooum-Cards (a HACS bundle of Lovelace cards, see CLAUDE.md). Load the `pr-workflow` and `ha-dev-testing` skills first. You are in your own git worktree: start your own HA there (`dev/ha.sh start`, port from 8124), `npm run build` there. Run every tool from your worktree. This machine has 7 GB of RAM: one HA, one browser at a time. Node, npm, gh and uv are in `~/.local/bin`. **Don't stop your HA when done**: the pilot reviews on it and keeps you until the user validated the merge. If you need an answer to go on, stop and put the question in your report (Open questions); you will be resumed.

## Goal (decided by the user, don't reopen)

The user wants to **watch the sub-agents' UI tests in real time in Claude Code's built-in browser pane**. Today `dev/ui_test.py` runs the suites (`dev/tests/*.json`) in a headless Chrome nobody sees, and the pane can't be attached to Playwright (no CDP). So the suites must be runnable **from a page** the pane opens.

## Design (fixed)

1. **A runner page** served by the dev integration: `http://127.0.0.1:<port>/plooum_dev/runner.html?suite=<name>[&only=<substring>][&pause=<ms>]`.
   - `dev/ha-config/custom_components/plooum_dev/__init__.py` already serves the bundle at `/plooum_dev/` (no-store). Extend it to serve, read-only and no-store: `runner.html` and `ui_runner.js` (new files in `dev/`), `ui_helpers.js` (`dev/ui_helpers.js`), and the suites `tests/<name>.json` (`dev/tests/`). Only those paths (no directory listing, no `..`). A restart is needed once after this change (`dev/ha.sh restart`).
   - The page runs each test of the suite in a **same-origin iframe** of the test's `path`, sized to its `viewport` (the suite's or the test's; scaled down with CSS `transform` to fit the pane if larger, the iframe's own size, hence its media queries, unchanged). A new iframe per test = the fresh page load `ui_test.py` does today. It waits for the same readiness as `ui_test.py` (HA connected, cards rendered), injects `ui_helpers.js` into the iframe's window, then runs the steps with **the same semantics** as `ui_test.py`: `js` / `assert` (expression or async body, the helpers as plain names, `S` scratch, `msg`, `show`), `wait`, and `shot` (not possible in a page: log "shot skipped" and go on). It collects the iframe's console errors (patch `console.error`, `error` / `unhandledrejection` events) with the same ignore list.
   - Next to the iframe, a live list: each test's name, a running / PASS / FAIL mark, its time, the failing step and message, the console errors. At the end, a summary line `N/M passed, F failed, E console error(s), total Xs` and `window.uiResult = { passed, failed, errors, tests: [...] }`, so an agent reads the outcome in one call (`get_page_text` or `javascript_tool`).
   - `pause=<ms>`: wait between steps so a human can follow (default 0).
2. **One implementation of the step semantics.** The step runner lives in `dev/ui_runner.js`. `dev/ui_test.py` must use it too, so the two runners can't drift: either `ui_test.py` loads `runner.html` headless and reads `window.uiResult` (preferred: keep its CLI, its output format, its exit codes, `--only`, and its screenshots for `shot` steps if you can keep them, e.g. by having the page expose the step and Python take the shot; if `shot` can't be kept that way, say so and keep it in Python), or both import the same JS. No copy-pasted step logic in Python and JS.
3. **Every existing suite passes in both**: `cards-smoke.json`, `floorplan-setup-view.json`, `floorplan-projected-windows.json`, headless through `ui_test.py` (times comparable to today: smoke ~8 s, setup view ~52 s; report both) and in the pane through `runner.html`. If an iframe breaks something (auth, `setPointerCapture`, a viewport-dependent layout), fix it in the runner, not in the suites; if a suite really needs a change, keep it minimal and say why.
4. **Docs**: CLAUDE.md (**UI test suites** paragraph and **Browser** paragraph: how to run a suite live in the pane) and the `ha-dev-testing` skill (the URL, `pause`, reading `window.uiResult`, "when the user watches, run the suites in the pane"). Short.

## Live demo (required)

Use **your own tab** of the built-in browser pane (`tabs_create`, then `navigate` with its `tabId`; never touch other tabs) to run `cards-smoke` live with `pause=300`, then read the result from the page. Leave that tab open at the end on the finished smoke run.

## Delivery

Branch `feature/live-test-runner`, PR "Run the UI test suites live in the browser pane (runner.html)". Open the PR, check CI, never merge. Report as `pr-workflow` says, with the three suites' outputs (headless, and from `window.uiResult` in the pane) and their times.

Screenshots:
1. `dev/shots/runner-smoke.png`: `runner.html?suite=cards-smoke` finished (all PASS, summary line), taken with `dev/shot.py`.
2. `dev/shots/runner-setup-view-narrow.png`: `runner.html?suite=floorplan-setup-view` during or after a narrow-layout test (the iframe at its narrow viewport).
