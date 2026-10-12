# Prompt 21: use the agent board from its own repo (remove tools/agent-board)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow` and `ha-dev-testing`. Your own worktree: `dev/ha.sh start`, `npm run build` for the last check only. `~/.local/bin/gh` by full path if `gh` isn't found. **Never the built-in browser pane.** **Be fast**: the lines to touch are listed below; read only them. A question → stop and report it. Keep your HA running at the end.

## Goal (user, 2026-10-12)

The agent board left this repo: it is now **https://github.com/plooum/agent-board** (public, history kept), installed once per machine as a clone in **`~/.local/opt/agent-board`** (already there on this machine: `board.py`, `board_stream.py`, `hook.py`, `index.html`, `README.md`). Its Claude Code hook will be declared **once in `~/.claude/settings.json`** for all projects (the pilot does it after the merge, not you). This repo must use the installed copy and **work without it** (the board is optional: no board installed = no board, nothing fails, nothing slower; CI doesn't have it).

## Changes (fixed)

1. **Remove `tools/agent-board/`** (`git rm -r`). The `tools/` dir goes if empty.
2. **One location rule**: `AGENT_BOARD_HOME` env var, default `~/.local/opt/agent-board`.
   - `dev/ui_test.py` (~lines 39–40) and `dev/shot.py` (~26–27): add that dir to `sys.path` and import `board_stream` / `project_of` **inside a `try`**; on `ImportError`, `board_stream = None`, `PROJECT = None`, and the board calls (`ui_test.py` ~101, ~134; `shot.py` ~77) are skipped (`board and board_stream and ...`). `--board` help texts: say "the agent board (plooum/agent-board)".
   - `dev/ha.sh` (~142–143): call `"$AGENT_BOARD_HOME/board.py"` (same default) only if the file exists.
   - `dev/ui_runner.js` line ~82: the comment names `plooum/agent-board`.
3. **`.claude/settings.json`**: remove the agent-board hook (it becomes global). If nothing is left in the file, delete it.
4. **Skills**: `.claude/skills/pilot/SKILL.md` lines ~14 and ~34: the commands become `python3 ~/.local/opt/agent-board/board.py ...` (start: `(setsid nohup python3 ~/.local/opt/agent-board/board.py serve > /dev/null 2>&1 &)`), plus one line: install on a new machine = `git clone https://github.com/plooum/agent-board ~/.local/opt/agent-board`, the hook in `~/.claude/settings.json` (see its README), update = `git -C ~/.local/opt/agent-board pull` then restart the board. `.claude/skills/ha-dev-testing/SKILL.md` line ~20: the board is `plooum/agent-board` installed in `~/.local/opt/agent-board` (`AGENT_BOARD_HOME`), optional.
5. No other file mentions `tools/agent-board` afterwards, except `.claude/pilot/` (the pilot's history: don't touch it). Check with `grep -rn "tools/agent-board" --exclude-dir=node_modules --exclude-dir=.venv . | grep -v "^./.claude/pilot/"`.

## Checks (strict minimum)

1. `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json` (9/9): the run shows on the board (`curl -s 127.0.0.1:8120/api/runs | head -c 300`, the newest run is yours).
2. The same with `AGENT_BOARD_HOME=/nonexistent` (9/9, no traceback, no board call).
3. `dev/.venv/bin/python dev/shot.py /plooum-test/all -o dev/shots/x.png` with `AGENT_BOARD_HOME=/nonexistent`: exit 0.
4. The grep of step 5: empty.

No screenshots.

## Delivery

Branch `feature/board-external`, PR "Use the agent board from plooum/agent-board (remove tools/agent-board)". Open it, don't wait for CI, never merge. Report as `pr-workflow` says, with the checks' output.
