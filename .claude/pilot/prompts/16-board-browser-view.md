# Prompt 16: agent board, part 3 (read-only live view of each agent's browser; agents leave the pane)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow` and `ha-dev-testing`. Your own worktree: `dev/ha.sh start`, `npm run build`. `~/.local/bin/gh` by full path if `gh` isn't found. **Don't use the built-in browser pane at all** (that's the point of this PR). **Be fast**: read only `tools/agent-board/README.md`, the parts of `tools/agent-board/board.py` / `index.html` you change, `dev/ui_test.py`, `dev/shot.py`. A question → stop and report it. Keep your HA running at the end.

## Goal (user's decisions, fixed)

The agent board (`tools/agent-board/`, http://127.0.0.1:8120) must show, for each sub-agent, a **read-only live view of its browser**: the page it is driving, as it changes. The built-in pane can't be mirrored, so **sub-agents stop using the pane**: every suite runs headless (`dev/ui_test.py`) and every hand check through `dev/shot.py`, and both **stream a screencast** of their headless Chrome to the board. **Live frames are not stored**; **one screenshot per finished test is kept** (same 30-day retention as events). The board stays **generic** (the user will move it out of this repo): it just receives images for an agent.

## Design (fixed, don't reopen)

Board (`tools/agent-board/`, stdlib only):
- `POST /api/frame` (body: JPEG, `Content-Type: image/jpeg`; query `agent=` or `port=`, resolved like events): keeps **only the latest frame per agent, in memory**; broadcasts an SSE message `{type: 'frame', agent, ts}` (no image in it), **throttled to ~4 per second per agent**.
- `GET /api/agents/<id>/frame`: the latest JPEG (404 if none), `Cache-Control: no-store`.
- `POST /api/shots` (JPEG; query `agent=`/`port=`, `run=`, `name=`): saves `shots/<id>.jpg` in the data dir, attaches its id to that run's test (`shot` field, whether it arrives before or after `test-end`), broadcasts. `GET /api/shots/<id>.jpg`. The daily / startup pruning also deletes shot files older than 30 days.
- `index.html`: in the agent detail, above the test run, a **Browser** panel: the latest frame (`<img>` reloaded on each SSE frame message for the selected agent), a "live" badge while frames arrive (< 3 s), else "last frame hh:mm:ss"; hidden when the agent never sent one. Click opens it full size. Each test row with a shot gets a small thumbnail that opens the full image. Dark default and the narrow layout as today.
- `README.md`: the three endpoints, how to plug a screencast in (generic, a few lines).

Project side (`dev/`):
- One small shared helper `dev/board_stream.py` (stdlib + Playwright objects passed in): `start(page, board_url, port)` opens a CDP session (`page.context.new_cdp_session(page)`), `Page.startScreencast` (`format: jpeg`, `quality: 60`, `maxWidth: 1280`, `maxHeight: 900`), acks each `Page.screencastFrame` at once, and hands the decoded JPEG to **one background thread that posts only the latest frame** (drop older ones; urllib, 0.5 s timeout, errors swallowed). `shot(page, ...)` posts a test's JPEG screenshot to `/api/shots`. Nothing may slow or fail a suite when the board is down.
- `dev/ui_test.py`: stream for the whole run (re-attach after each page load if the CDP session needs it); after each test, post the page's screenshot as that test's shot. Uses the existing `--board`.
- `dev/shot.py`: `--board` option (default `http://127.0.0.1:8120`); streams the live frames while it runs (no shot posted).
- Skills — **agents leave the pane** (this replaces the 2026-10-11 "watch in the pane" rule):
  - `ha-dev-testing`: suites with `dev/ui_test.py` only; hand checks with `dev/shot.py --js ...`; the user watches on the board (http://127.0.0.1:8120); `runner.html` stays for the pilot / the user, not for sub-agents. Remove or rewrite every "run it in your own pane tab" instruction (and the tabs_create / navigate advice for sub-agents).
  - `pr-workflow`: same in its Testing section.
  - Don't touch the `pilot` skill (the pilot does it).

## Checks (strict minimum)

1. Your own board: `python3 tools/agent-board/board.py serve --port 8121 --data dev/shots/board` in the background (never 8120; stop it by pid at the end, `pkill -f` kills your own shell). Register your agent with `--port <your HA port>`.
2. `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json --board http://127.0.0.1:8121` → 9/9; then `GET /api/agents/<id>/frame` is a JPEG, and the run in `GET /api/runs?suite=cards-smoke` has 9 tests each with a `shot`.
3. Board stopped: the same suite still passes, no slower than ~1 s.

Screenshots (headless Playwright scratch script in `dev/shots/`, dark, 1400×900), of your board at 8121: `dev/shots/board-browser.png` (your agent: Browser panel with the last frame, the run with thumbnails), `dev/shots/board-shot-open.png` (a test's shot opened full size).

## Delivery

Branch `feature/board-browser-view`, PR "Agent board: live browser view of each agent (headless screencast)". Open it, don't wait for CI, never merge. Report as `pr-workflow` says, with the two screenshots and the timings of check 2 and 3.
