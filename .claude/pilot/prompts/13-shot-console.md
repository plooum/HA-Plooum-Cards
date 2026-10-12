# Prompt 13 (fast path): `dev/shot.py --console <substring>`

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow` (its **fast path**) and `ha-dev-testing`. Your own worktree: `dev/ha.sh start`, `npm run build`. `~/.local/bin/gh` by full path if `gh` isn't found. **Be very fast**: a few lines, one check, no screenshots, a 5-line report. Keep your HA running at the end. A question → stop and report it.

## Goal

`dev/shot.py` only records `console.error` lines (the `page.on("console", ...)` handler, ~line 69). Sub-agents sometimes need `console.info` / `log` lines, e.g. a card's version banner (`console.info('%c HA-PLOOUM-DPAD-CARD %c 1.0.0 ', ...)` in each card's `connectedCallback`).

## Change (fixed, don't reopen)

- New option `--console SUBSTR`, repeatable (`action="append"`, like `--js`): every console message of **any type** whose text contains one of the substrings (case-insensitive) is printed to stdout as `console.<type>: <text>`, in arrival order, after the `js>` results and before `screenshot: ...`. Errors keep going to stderr and the exit code as today; an error that also matches is printed in both places (fine).
- Update the module docstring: one example line and one sentence.
- `.claude/skills/ha-dev-testing/SKILL.md`, ~line 66: replace the advice "read those with the built-in browser's `read_console_messages`..." by `dev/shot.py --console <substring>`. Touch only the `shot.py` lines (another PR edits the suite-format section).

## Check (strict minimum)

Once: `dev/.venv/bin/python dev/shot.py /plooum-test/dpad --console HA-PLOOUM-DPAD -o dev/shots/console.png` prints at least one `console.info: ... HA-PLOOUM-DPAD-CARD ...` line and exits 0. No suite, no pane tab needed.

## Delivery

Branch `feature/shot-console`, PR "dev/shot.py: --console prints matching console lines". Open it, don't wait for CI, never merge. Report (fast path): the command's output, the diff size, friction.
