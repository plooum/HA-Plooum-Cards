# Prompt 14: agent board, part 1 (server, page, test results)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow` and `ha-dev-testing`. You are in your own worktree: `dev/ha.sh start`, `npm run build` (only if you need HA). `~/.local/bin/gh` by full path if `gh` isn't found. **Be fast**: read only the sections named here. A question → stop and report it. Keep your HA running at the end.

## Goal (user's decisions, fixed)

The user wants **one central page**, opened in their own browser, to follow the sub-agents: for each agent a title, its name, what it is doing now, its tests live (the one running, the ones just passed / failed), and **everything stays viewable after the agent is done**. The pilot archives the previous agents when it launches new ones (archived = collapsed, still viewable). History kept **30 days**. Test run history per suite.

**The user will one day move this tool out of this repo to use it elsewhere.** So it is a **generic, self-contained tool** that knows nothing of Home Assistant or this project: everything generic lives in `tools/agent-board/`; the project-specific glue (two small hooks below) stays in `dev/` and only talks to the board's HTTP API.

This PR is part 1: board + test results. Part 2 (later, not you): a Claude Code hook posting the agents' commands and file edits as actions.

## Design (fixed, don't reopen)

`tools/agent-board/`:
- `board.py`: **Python stdlib only** (no pip deps), runs with `python3`. Subcommands:
  - `serve [--port 8120] [--data DIR]`: HTTP server on **127.0.0.1** only; data dir default `~/.local/share/agent-board/`. Storage: append-only `events.jsonl` (one JSON object per line), loaded into memory at start; lines older than **30 days** dropped at start and once a day (rewrite the file).
  - `agent <id> [--title T] [--name N] [--status S] [--branch B] [--pr URL] [--port P] [--checkout PATH]`: upsert an agent (only the given fields). Statuses: `working`, `review`, `done`, `archived` (free text accepted).
  - `event <id> <text>`: add an `action` event to an agent.
  - `archive --except <id>...` : archive every non-archived agent but those.
  - The CLI commands POST to the server (`--url`, default `http://127.0.0.1:8120`, env `AGENT_BOARD_URL`), exit 0 silently if the server isn't running (glue must never break a dev command); print the error only with `-v`.
- HTTP API (JSON; `Access-Control-Allow-Origin: *` and `OPTIONS` handled, so a page on another port can post):
  - `POST /api/agents/<id>` (fields as above), `POST /api/events` `{agent?, port?, kind, text?, data?}`: when `agent` is missing, resolve it from `port` (the most recently updated agent with that port; unknown port → agent id `port-<n>`). Server sets `ts`.
  - Event kinds: `action`, `status` (set by the server when an agent's status changes), `run-start` `{suite, source, total}`, `test-start` `{run, name}`, `test-end` `{run, name, ok, seconds, message?}`, `run-end` `{run, summary, passed, failed}`. `run` is an id the poster generates.
  - `GET /api/state` (agents + their last action + last run), `GET /api/agents/<id>/events`, `GET /api/runs?suite=` (history of runs, each with its tests), `GET /api/stream` (**Server-Sent Events**: every new event / agent change, so the page updates live).
- `index.html`: one page, no external library, served at `/`, English UI, dark and light (`prefers-color-scheme`). Left: agents, active first (title, name, status, current action, a live dot while `working`), archived ones under a collapsed "Archived (n)". Right, for the selected agent: header (title, name, branch, PR link, port, status), **the test run in progress** (current test + finished ones with PASS / FAIL, time, failure message), then the timeline (actions, statuses, test runs, collapsible). A second tab **Tests**: runs by suite, newest first (date, agent, source, summary), expandable to their tests. Live through `/api/stream`, reconnecting on its own.
- `README.md`: what it is, how to run it, the API and the event kinds, how to plug a test runner and a Claude Code hook (part 2) in. Generic: no HA, no Plooum.

Project glue in `dev/` (thin):
- `dev/ui_runner.js`: post `run-start`, `test-start`, `test-end`, `run-end` to the board (`?board=<url>` overrides `http://127.0.0.1:8120`), with `port: location.port` and `source` `pane` or `headless`. **Fire and forget** (`fetch(..., {method:'POST', keepalive:true}).catch(() => {})`, never awaited): a board that is down must neither slow nor fail a suite. One small `report(kind, data)` function, called at the existing places.
- `dev/ha.sh start`: once HA is ready, `python3 tools/agent-board/board.py agent <checkout basename> --port <port> --checkout <path>` (silent). Only that line (and its comment).
- `.claude/skills/ha-dev-testing/SKILL.md`: 2–3 lines: the board, its URL, that suites report to it on their own. Don't touch the `pilot` skill (the pilot does it).

## Checks (strict minimum)

1. `python3 tools/agent-board/board.py serve --port 8121 --data dev/shots/board` (your own port and data dir, in the background; never 8120, the pilot's).
2. `board.py agent <your worktree basename> --title "Prompt 14: agent board" --name "Sonnet" --status working --url http://127.0.0.1:8121`, then one `event`.
3. Run `cards-smoke` once in your pane tab with `&board=http://127.0.0.1:8121`; check `GET /api/runs?suite=cards-smoke` has one run, 9 tests, attached to your agent (resolved from your port).
4. Restart the server: the run is still there (persistence).
5. Stop your board at the end.

Screenshots (headless, `dev/shot.py` doesn't fit: it logs into HA; use Playwright directly from a small scratch script in `dev/shots/`, or the pane's screenshot), both of the board at 8121, wide (1400×900): `dev/shots/board-agent.png` (your agent selected, the run and timeline visible), `dev/shots/board-tests.png` (the Tests tab, the run expanded).

## Delivery

Branch `feature/agent-board`, PR "Agent board: a central live page for agents and test runs". Open it, don't wait for CI, never merge. Report as `pr-workflow` says, with the two screenshots.
