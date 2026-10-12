# Prompt 12 (fast path): suites restore entity states even when a test fails

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow` (its **fast path**) and `ha-dev-testing`. Your own worktree: `dev/ha.sh start`, `npm run build`. `~/.local/bin/gh` by full path if `gh` isn't found. **Be very fast**: small change, minimal checks, no screenshots, a 5-line report. Watchable: run the suite in your own pane tab (`runner.html`, `pause=0`). Keep your HA running at the end. A question → stop and report it.

## Problem

In `dev/tests/cards-smoke.json`, each test restores the states it changed (counter, cover position, temperature, ...) with ordinary steps at its end. When an earlier step fails, `dev/ui_runner.js` stops the test (`for (...; i < steps.length && !failure; ...)`) and the restore steps never run: the dev HA is left with changed states.

## Fix (fixed, don't reopen)

- `dev/ui_runner.js`: a test may have a **`"finally"`** array of steps (same step format as `steps`, in practice `js` and `assert`). They run **after `steps`, always** — even after a failing step — as long as the page loaded (`win` is set). A failure inside `finally` counts as the test's failure only if `steps` passed (keep the first failure). Reuse the existing step code: factor the per-step body into one function used for both arrays, no duplicated loop body. Label `finally 1`, `finally 2`, ... in the failure message.
- `dev/ui_test.py`: add `"finally": [ ... ]` to the suite format in its docstring (one line). Nothing else should change there (it drives `ui_runner.js`).
- `dev/tests/cards-smoke.json`: move each test's restore steps (the `js` that sets the value back and its `assert ... restored`) into that test's `finally`. Don't change what the tests check.
- `.claude/skills/ha-dev-testing/SKILL.md`: one line where the suite format / step types are described: "`finally`: steps that always run, put state restores there". Don't touch other sections (another PR edits the `shot.py` lines).

## Checks (strict minimum)

1. In your pane tab: `runner.html?suite=cards-smoke&pause=0` → all PASS.
2. One hand check of the failure path: temporarily change the dpad test's first `assert` to something false, run `&only=dpad`, check it FAILs and that `counter.ptz_presses` is back to its start value (`dev/api.sh GET states/counter.ptz_presses`), then **revert** that edit (it must not be committed).

No new suite, no headless run.

## Delivery

Branch `feature/suite-finally`, PR "Test suites: finally steps that always restore states". Open it, don't wait for CI, never merge. Report (fast path): the cards-smoke summary line, the hand check result, the diff size, friction.
