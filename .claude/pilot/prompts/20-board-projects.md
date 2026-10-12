# Prompt 20: agent board, generic across projects (still in this repo)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow`. No HA needed except for the last check. `~/.local/bin/gh` by full path if `gh` isn't found. **Never the built-in browser pane.** **Be fast**: read `tools/agent-board/README.md`, `tools/agent-board/hook.py`, and in `tools/agent-board/board.py` the store (`upsert_agent`, event / port resolution ~lines 140–200, `archive`) and the CLI (~lines 330–379); in `tools/agent-board/index.html` only the agent list / detail rendering and the Tests tab's `<select id="suite">` code. A question → stop and report it.

## Goal (user, 2026-10-12)

The agent board (`tools/agent-board/`) must become **generic for all the user's projects**, while staying in this repo and working for this one as today. Moving it out to its own repo is **not** part of this PR. Today it has no notion of project: agents of several projects would mix, `archive --except` would archive other projects' agents, and events resolved by `port` could land on another project's agent.

## Design (fixed)

1. **Project = the main checkout's absolute path** (the git common dir's parent: for a worktree, read its `.git` file `gitdir: <main>/.git/worktrees/<x>`; for a normal checkout, the dir holding `.git`). Shown as its basename. One stdlib helper `project_of(path)` in `board.py`; `hook.py` imports it from its sibling `board.py` (same dir, `sys.path`), no copy.
2. **Agents get a `project` field.** `board.py agent` takes `--project P`, **defaulting to the project of the current directory** (none when not in a git checkout). The hook sends `project` with each action. Existing agents without one stay valid (shown under "All").
3. **Scoped operations**: `archive --except ...` archives only agents of the **same project** (current dir's by default, `--project P` to choose, `--all-projects` for the old behavior). Events resolved by `port` (no `agent`) pick among agents of the event's `project` when it is given, else among all (today's behavior). An unknown port creates `port-<n>` with that project.
4. **Test runs carry the project**: `dev/ui_test.py` and `dev/shot.py` pass it (computed with `project_of` on their own checkout) to the board: in the events they post and in the `runner.html` URL (`&project=`), and `dev/ui_runner.js` adds it to its events when present. `dev/ha.sh` (line ~143) passes `--project` when it registers a worktree's agent. `GET /api/runs` takes `?project=`.
5. **The reusable streaming module moves into the tool**: `dev/board_stream.py` → `tools/agent-board/board_stream.py` (`git mv`, no copy left), imported by `dev/ui_test.py` and `dev/shot.py` through `sys.path`. Its doc says it needs only Playwright objects passed in. README section "Plug in a browser screencast" points to it instead of `dev/`.
6. **Page**: a **Project** `<select>` in the header ("All projects" + each project seen, by basename, full path as `title`), remembered in `localStorage` (try/catch, like the theme). It filters the agent list, the archived list and the Tests tab (runs and the suite list). Each agent row shows its project basename when "All projects" is selected. Same dark / light styling as the existing `<select id="suite">`.
7. **Nothing project-specific in `tools/agent-board/`**: no "Plooum", HA, port 8123 or `dev/` path. README: a short "Several projects" section (what a project is, the defaults, `--all-projects`), and the hook set up **either** per project (`$CLAUDE_PROJECT_DIR/...`, as this repo does) **or** once in `~/.claude/settings.json` with an absolute path. This repo's `.claude/settings.json` stays as it is.
8. Skills: update the board lines of `.claude/skills/pilot/SKILL.md` (the `archive` / `agent` commands: the project is now automatic from the main checkout, no flag needed) and `.claude/skills/ha-dev-testing/SKILL.md` (the `board_stream` path), one or two lines each.

## Checks (strict minimum)

On a board of your own (`python3 tools/agent-board/board.py serve --port 8121 --data dev/shots/board`, background, stop it at the end), with `--url http://127.0.0.1:8121` / `AGENT_BOARD_URL`:

1. Two agents in two projects (one from your worktree's dir, one with `--project /tmp/other`), plus a third in yours: `archive --except <third>` archives yours only, the other project's agent stays `working`. Paste `GET /api/state` (agents' id / project / status).
2. Two agents on the same `port` in the two projects: an event with that port and your project lands on yours. Paste the result.
3. The hook: pipe one fake PostToolUse JSON (a Bash command, `cwd` = your worktree) into `hook.py --url http://127.0.0.1:8121`: the action lands on the agent named after your worktree, with your project.
4. One real run: `dev/ha.sh start`, `npm run build`, `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json --board http://127.0.0.1:8121` (9/9): the run appears in `GET /api/runs?project=<yours>` and not with `?project=/tmp/other`. Then `dev/ha.sh stop`.
5. **One screenshot** `dev/shots/board-projects.png`: the board page at 8121 (headless Playwright, dark theme, ~1280×800) with the Project select open or set to "All projects", showing agents of both projects with their project names. Not committed.

## Delivery

Branch `feature/board-projects`, PR "Agent board: projects (generic across repos)". Open it, don't wait for CI, never merge. Report as `pr-workflow` says, with checks 1–4 output and the screenshot path.
