# Prompt 23: agent-board, AGENTS.md + install.sh (a new pilot sets it up from the repo URL)

You work in **`/home/doudou/git/agent-board`**, a clone of the public repo **https://github.com/plooum/agent-board** (`cd` there first, `git checkout main && git pull --ff-only`, then your branch). Not HA-Plooum-Cards: its CLAUDE.md and skills don't apply, except: English everywhere, commits ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, PR body ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. `~/.local/bin/gh` by full path if `gh` isn't found. No browser. **Be fast**: read `README.md` (Install and hook sections), `skill/SKILL.md`, and `board.py`'s argparse only. A question → stop and report it.

## Goal (user, 2026-10-12)

The user wants to tell a **new pilot of a future project**: "You are the pilot of this new project; use this board to follow your sub-agents: https://github.com/plooum/agent-board, the instructions are in its repo." A fresh agent, with only that URL, must be able to install, run and use the board, and wire the new project's tests to it, by reading the repo.

## Changes (fixed)

1. **`install.sh`** (bash, `set -euo pipefail`, stdlib `python3` for JSON), **idempotent** (a second run changes nothing and says so):
   - Target `AGENT_BOARD_HOME` (default `~/.local/opt/agent-board`): clone `https://github.com/plooum/agent-board` there if missing, else `git -C ... pull --ff-only`. If the script itself runs from a clone elsewhere, it still installs into the target.
   - **Hook** in `~/.claude/settings.json` (`CLAUDE_SETTINGS`, default that path): create the file if missing; otherwise merge: add the `PostToolUse` entry (matcher `Bash|Edit|Write|NotebookEdit`, command `python3 <home>/hook.py --only-under /.claude/worktrees/`, `<home>` expanded to the absolute path) **only if no hook command already contains `agent-board/hook.py`**; never drop or reorder other keys or hooks; write a `settings.json.bak` before changing an existing file. Invalid JSON → stop with a message, change nothing.
   - **Skill**: `~/.claude/skills/agent-board` → symlink to `<home>/skill`; if something else is already there, leave it and warn.
   - **Start**: if `curl -s 127.0.0.1:8120/api/state` (or `AGENT_BOARD_URL`) doesn't answer, start `board.py serve` in the background (`setsid nohup ... &`); `--no-start` skips this.
   - Prints one line per step (`clone|pull`, `hook added|already there`, `skill linked|already there|left alone`, `board started|already running|skipped`) and the URL to open.
2. **`AGENTS.md`** at the root: instructions **for an AI agent told to use this board** for a project. Short, imperative, ordered:
   1. Is it installed and running (`curl -s 127.0.0.1:8120/api/state`)? If not: `git clone https://github.com/plooum/agent-board ~/.local/opt/agent-board && ~/.local/opt/agent-board/install.sh`. **Tell the user before it changes an existing `~/.claude/settings.json`** (it is their global config). A new Claude Code session may be needed for the hook to apply.
   2. While piloting: load the `agent-board` skill; launch sub-agents with worktree isolation (the hook only follows agents in `.claude/worktrees/`); register / archive / status as the skill says.
   3. Wire the project's tests: test runners post events (README "Plug in a test runner"), Playwright runners stream with `board_stream.py` (README "Plug in a browser screencast"); keep it optional (the project must work without the board: import in a `try`, `AGENT_BOARD_HOME`).
   4. Write in the new project's `CLAUDE.md` (or its pilot notes) one line: sub-agents are followed on the agent board (plooum/agent-board), load the `agent-board` skill before launching them.
   5. The user follows it at http://127.0.0.1:8120 in their own browser (the project filter in the header).
3. **README.md**: first line after the title: "AI agent asked to use this board: read [AGENTS.md](AGENTS.md)." The Install section uses `install.sh` (one command), the manual steps stay below as "Manual install".
4. **`skill/SKILL.md`**: "Is it up?" says to run `<home>/install.sh` when the board isn't installed. Nothing else.

## Checks (strict minimum), in `/home/doudou/git/agent-board/.scratch/` (gitignored, add `.scratch/` to `.gitignore`), with a **fake HOME** so the user's real config is never touched: `HOME=<scratch>/home AGENT_BOARD_HOME=<scratch>/home/.local/opt/agent-board ./install.sh --no-start`

1. Fresh fake HOME: clone, settings created with the hook, skill linked. Paste the output and the settings file.
2. Second run: everything "already there", settings unchanged (`cmp` with the first).
3. A fake HOME whose `settings.json` already has another `PostToolUse` hook and a `"model"` key: both kept, ours added, `.bak` written. Paste the merged file.
4. Invalid JSON in `settings.json`: exits non-zero, file unchanged.
5. `bash -n install.sh`, and the real `~/.claude/settings.json` untouched (`git`-free: `md5sum` before / after).

## Delivery

Branch `feature/agents-md`, PR "AGENTS.md and install.sh: set the board up from the repo URL" on plooum/agent-board. Open it, never merge. Report: what changed, the checks' output, open questions, friction.
