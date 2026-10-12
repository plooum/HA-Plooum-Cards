# Prompt 15: agent board, part 2 (Claude Code hook: agents' commands and file edits)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow`. No HA needed, no browser. `~/.local/bin/gh` by full path if `gh` isn't found. **Be fast**: read `tools/agent-board/README.md` and the parts of `tools/agent-board/board.py` you need (CLI `post`, `--url`), nothing else. A question → stop and report it.

## Goal (user's decisions, fixed)

The agent board (`tools/agent-board/`, merged in #39) shows each sub-agent's timeline. The user wants each sub-agent's **commands and file edits** there (not file reads, not searches), and **not the pilot's** (the pilot works in the main checkout; sub-agents work in git worktrees under `.claude/worktrees/agent-<id>`). The tool stays **generic** (the user will move it out of this repo one day): the generic part in `tools/agent-board/`, the project wiring in `.claude/settings.json`.

## Design (fixed, don't reopen)

- `tools/agent-board/hook.py` (Python stdlib only): a Claude Code **`PostToolUse`** hook. Reads the hook JSON on stdin (`cwd`, `tool_name`, `tool_input`, ...). Turns it into one line:
  - `Bash` → `tool_input.description` if present, else the command's first line, cut to 120 chars;
  - `Edit` / `Write` / `NotebookEdit` → `Edit <path>` / `Write <path>` / `Edit <path>`, path relative to the checkout root;
  - any other tool → nothing posted.
  - Agent id = the basename of the checkout root: the nearest parent of `cwd` (or the edited file) holding a `.git` entry (file or dir).
  - Option `--only-under <substring>`: post only when that root path contains it (the project passes `/.claude/worktrees/`, so the main checkout — the pilot — is never posted).
  - POSTs `{agent, kind: "action", text}` to `/api/events` (`--url`, env `AGENT_BOARD_URL`, default `http://127.0.0.1:8120`), **timeout 0.5 s, every error swallowed, always exit 0, print nothing** (a hook must never slow, break or talk into an agent's session).
- `.claude/settings.json` (new, committed): 
  ```json
  { "hooks": { "PostToolUse": [ { "matcher": "Bash|Edit|Write|NotebookEdit",
      "hooks": [ { "type": "command", "command": "python3 \"$CLAUDE_PROJECT_DIR/tools/agent-board/hook.py\" --only-under /.claude/worktrees/" } ] } ] } }
  ```
- `tools/agent-board/README.md`: replace the "Plug in a Claude Code hook (to come)" section with the real one (generic: the settings snippet, what is posted, `--only-under`).

## Checks (strict minimum)

Hooks are loaded when a Claude Code session starts, so a live check isn't possible in this session: test the script by piping JSON into it.
1. A board of your own: `python3 tools/agent-board/board.py serve --port 8121 --data dev/shots/board` in the background (never 8120, the pilot's; stop it by pid at the end, `pkill -f` kills your own shell).
2. With `AGENT_BOARD_URL=http://127.0.0.1:8121`, pipe 4 JSON samples into `hook.py --only-under /.claude/worktrees/`: a `Bash` with a description and an `Edit`, both with `cwd` = your worktree → 2 actions on agent `<your worktree basename>` (`GET /api/agents/<id>/events`); a `Bash` with `cwd` = the main checkout `/home/doudou/git/HA-Plooum-Cards` and a `Read` → nothing posted.
3. With the board stopped: `hook.py` exits 0 at once, prints nothing.

## Delivery

Branch `feature/board-hook`, PR "Agent board: a Claude Code hook posting the agents' commands and file edits". Open it, don't wait for CI, never merge. Short report (`pr-workflow` format, no screenshots): the check outputs, diff size, friction.
