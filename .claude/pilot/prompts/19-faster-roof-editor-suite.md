# Prompt 19: faster floorplan-roof-editor suite (reuse the page between tests)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow` and `ha-dev-testing`. Your own worktree: `dev/ha.sh start`, `npm run build`. `~/.local/bin/gh` by full path if `gh` isn't found. **Never the built-in browser pane**: suites with `dev/ui_test.py` (the user watches them on the agent board). **Be fast**: read only `dev/ui_runner.js` (the test loop, ~lines 50–223), `dev/ui_test.py` (~lines 86–144), `dev/tests/floorplan-roof-editor.json`, and `ha-dev-testing`'s suite format section. No `src/` change. A question → stop and report it. Keep your HA running at the end.

## Goal

`dev/tests/floorplan-roof-editor.json` is the slowest suite: **36–42 s for 8 tests** (pilot's run on main, 2026-10-12). Every test pays a full page load: `ui_test.py` opens a new `runner.html?index=<i>` page per test, and the runner loads `/plooum-edit/floorplan?edit=1` into a fresh iframe, waits for it to be ready, then the test opens the editor dialog. Target: **≤ 20 s**, same 8 tests, same assertions.

## Design (fixed)

1. **Measure first** (one run, `--verbose` or a temporary print): for 2–3 tests, the split page load + ready / `openEditor` / the rest. If page load is not the main cost, **stop and report** the numbers before coding.
2. **Opt-in page reuse in the runner**: a test with `"same_page": true` runs in the previous test's iframe, without reloading, **only if** the previous test ran in this runner page, has the same path and viewport, and passed. Otherwise it loads the page as today. Console errors are still collected per test (the error hook stays installed on the reused frame). Nothing changes for tests without the flag, so the other suites behave as before.
3. **`ui_test.py`**: run each group of consecutive tests where every test after the first has `same_page: true` (and the same viewport) in **one** runner page, e.g. `index=3-5` (or a comma list: your pick, documented), reading all of `uiResult.tests`. Board reporting and `--only` keep working (`--only` that picks a `same_page` test without its predecessor just loads the page). `shot` steps keep working inside a group.
4. **The suite**: set `same_page` where it helps; every reused test must leave the page clean for the next one, with a `finally` step that closes the dialog if it is open (a small `T.closeDialogIfOpen()` helper in `dev/ui_helpers.js`, next to `cancelDialog`) and restores what it changed. The narrow-dialog test (different viewport) and the generated-plan test can keep their own page. Don't change what any test asserts.
5. Document `same_page` and the grouping in `ha-dev-testing` (suite format), 2–4 lines.

## Run (strict minimum)

At the end, once each: `dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-roof-editor.json` (8/8, paste the per-test times and the total), the same with `--only "draw, move"` (a reused test run alone still passes), and `dev/tests/cards-smoke.json` (9/9, no flag there: proves the default path is unchanged). No screenshots.

## Delivery

Branch `feature/faster-roof-editor-suite`, PR "Test suites: reuse the page between tests (floorplan-roof-editor ~2x faster)". Open it, don't wait for CI, never merge. Report as `pr-workflow` says (no screenshots), with the measured split from step 1, before / after totals, and the three runs' output.
