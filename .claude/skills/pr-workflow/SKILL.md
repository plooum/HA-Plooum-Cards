---
name: pr-workflow
description: HA-Plooum-Cards specifics for a sub-agent delivering work. Load it together with the global `pilot-subagent` skill for any task given by the pilot.
---

# Delivering a change here (sub-agent)

The branch, PR, report format and sandbox pitfalls are in the global `pilot-subagent` skill. Only this repo's specifics are here.

## Branch

- In a worktree, `dev/ha.sh start` gives you your own HA (port 8124+) serving your bundle; `dev/ha.sh stop` when done; `dev/ha.sh setup` links the main checkout's venv and `node_modules` without starting HA (see `ha-dev-testing`).
- Never `tags/` in a branch name: HACS strips it and its validation fails.
- The bundle (`ha-plooum-cards.js`, `.map`) is gitignored: `npm run build` to test, never commit it.
- Don't bump `CARD_VERSION`: separate PR.
- `node`, `npm`, `gh`, `uv` not found: they live in `~/.local/bin` on the laptop (full path).

## Code conventions (CLAUDE.md)

- English everywhere: UI strings, comments, identifiers.
- README.md and README.fr.md change together; behavior or options of a card go in `docs/<card>.md`.
- Out-of-scope issues: mention them in your report; TODO.md is left to the pilot.

## Testing

- **Never the built-in browser pane**: suites with `dev/ui_test.py`, hand checks with `dev/shot.py --js ...`, both headless. They stream to the agent board (http://127.0.0.1:8120).
- Scratch files and screenshots go in `dev/shots/` (gitignored).
- The suite is committed with the PR under `dev/tests/<feature>.json`; the report's **Tested** section is its output pasted in full, with that path.
- CI = Build + Validate.
