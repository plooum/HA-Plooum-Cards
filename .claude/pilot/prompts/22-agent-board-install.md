# Prompt 22: agent-board repo, install docs and a global skill

You work in **`/home/doudou/git/agent-board`**, a clone of the public repo **https://github.com/plooum/agent-board** (`cd` there first; it is not HA-Plooum-Cards, whose CLAUDE.md and skills don't apply, except: English everywhere, commits ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, PR body ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`). `~/.local/bin/gh` by full path if `gh` isn't found. No browser. **Be fast**: read `README.md` and the docstrings / argparse of `board.py` and `hook.py` only. A question → stop and report it.

## Context

The tool was just extracted (history kept) from `tools/agent-board/` of plooum/HA-Plooum-Cards. Since #53 there it is generic (projects = main checkout path). The user's choice (2026-10-12): **installed once per machine**, a clone in `~/.local/opt/agent-board` (updated with `git pull`), the Claude Code hook declared **once in `~/.claude/settings.json`** for all projects. Data stays in `~/.local/share/agent-board/`. Stdlib only, nothing to install.

## Changes (fixed)

1. **README.md**:
   - A short intro line: what it is for (follow Claude Code sub-agents, or any coding agents, live: actions, test runs, a live view of their headless browser).
   - An **Install** section first: `git clone https://github.com/plooum/agent-board ~/.local/opt/agent-board`; start it in the background (`(setsid nohup python3 ~/.local/opt/agent-board/board.py serve > /dev/null 2>&1 &)`), open http://127.0.0.1:8120; update = `git -C ~/.local/opt/agent-board pull` then restart (the kill command: `kill $(ps -eo pid,args | awk '/agent-board\/board.py serve/ && !/awk/ {print $1}')`); `AGENT_BOARD_URL` for another board.
   - The hook section: the global form first, exact JSON for `~/.claude/settings.json` with the absolute path `python3 ~/.local/opt/agent-board/hook.py --only-under /.claude/worktrees/` (say what `--only-under` does: only agents working in Claude Code worktrees, so the main session isn't shown; merge it into existing `hooks` if the file has some); the per-project form after, in one line. Note: don't declare both (actions would be posted twice).
   - The skill: how to install it (step 2).
   - Remove anything that assumes the tool lives inside another repo ("in this repo", `tools/agent-board`, `dev/`).
2. **A global Claude Code skill** `skill/SKILL.md` (frontmatter `name: agent-board`, `description`: when to load it: "when you launch or manage sub-agents and the agent board is installed (~/.local/opt/agent-board), to show them on the board"). Content, short and factual: check the board is up (`curl -s 127.0.0.1:8120/api/state`) and how to start it; right after launching a sub-agent in a worktree: `board.py archive --except agent-<id>` (only this project's agents) and `board.py agent agent-<id> --title ... --name ... --status working --branch ... --checkout <main checkout>/.claude/worktrees/agent-<id>`; `--status review --pr <url>` at review, `--status done` after merge; the agent id is the worktree's basename, which is what the hook and test runners use; test runners report through the HTTP API and `board_stream.py` (README sections). Installed with `ln -s ~/.local/opt/agent-board/skill ~/.claude/skills/agent-board` (README).
3. Nothing else changes in the code.

## Checks (strict minimum)

1. `python3 board.py --help` and `python3 hook.py --help` (or its docstring run) still work.
2. The README's hook JSON is valid JSON (`python3 -m json.tool` on it).
3. `grep -rn -i "plooum-cards\|tools/agent-board\|in this repo" .`: only the extraction mention, if any.

## Delivery

Branch `feature/install-docs`, PR "Install docs and a global Claude Code skill" on plooum/agent-board. Open it, don't wait for CI (there is none), never merge. Report: what changed, the checks' output, open questions, friction.
