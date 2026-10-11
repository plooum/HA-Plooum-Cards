# Task: one dev Home Assistant per git worktree, so sub-agents can test in parallel

You are a sub-agent of the pilot. Load the skills `pr-workflow` and `ha-dev-testing` before you start, and read `CLAUDE.md`. Work in the main checkout `/home/doudou/git/HA-Plooum-Cards`. The main dev HA runs on 8123 (`dev/ha.sh status`): don't stop it, don't break it. In editor dialogs, never click Save. `gh` is `~/.local/bin/gh`. Leave the local branch `feature/dpad-keyboard` alone.

Branch: `feature/parallel-instances`, off an up-to-date `main`. One PR, never merged by you. End with the `pr-workflow` report.

## Why

Today only one sub-agent can test at a time: there is a single dev HA (127.0.0.1:8123) and it serves the bundle of the main checkout, so sub-agents can't work in git worktrees (they would test the main checkout's code). The user wants several sub-agents to develop and test **at the same time**, each with **its own HA instance on its own port**, and, when the user watches, **its own tab** in the built-in browser.

Good news, already true: the `plooum_dev` integration serves the bundle of `<config dir>/../..` (`repo_root` default in `dev/ha-config/custom_components/plooum_dev/__init__.py`), and the runtime state (`.storage`, db, token, logs) is gitignored under `dev/`. So an HA started by **a worktree's own `dev/ha.sh`** already serves **that worktree's** bundle and keeps its own state. What's missing is the port, the shared install, and the tools that hard-code 8123.

## Requirements

1. **Port per checkout.**
   - The main checkout keeps **8123**: nothing changes for it.
   - In a git worktree (`git rev-parse --git-dir` ≠ `--git-common-dir`), `dev/ha.sh start` picks the first free port from **8124** up, and writes it to `dev/.ha-port`, which is gitignored. It keeps that port on the next starts while it's still free.
   - `HA_PORT=<n> dev/ha.sh start` forces a port.
   - The seeded `.storage/http` uses that port, and `status` prints the URL.
2. **Shared install.** A worktree doesn't install its own venv: `dev/ha.sh` uses the main checkout's `dev/.venv`, found through `git rev-parse --git-common-dir`. It's only installed when missing there. Same for `node_modules`: document that a worktree needs it, and make `dev/ha.sh start` (or a `dev/ha.sh setup` command) link the main checkout's `node_modules` into the worktree, so `npm run build` works there without a fresh install.
3. **Every dev tool follows the checkout's instance.**
   - `dev/shot.py`, `dev/ui_test.py`, `dev/api.sh` and `dev/bootstrap.py` take their URL from that checkout's `dev/.ha-port` (default 8123). The token comes from that checkout's `dev/.ha-token`.
   - `--url` / `HA_URL` overrides it.
   - Put the "which URL" logic in one place per language: a small shared Python helper for the `.py` tools, and the same few lines for the two shell scripts.
4. **First start in a worktree**: it onboards like a fresh install (bootstrap, token, `/plooum-edit` dashboard, areas). Measure how long it takes, and make it as short as reasonable. For instance, check whether copying the main checkout's `.storage` is safe and faster than onboarding again. If you copy, the copied token must still work, or be regenerated. Report what you chose and why.
5. **Cleanup.** `dev/ha.sh stop` stops that checkout's instance only. Add `dev/ha.sh list`: every running dev instance on this machine (port, pid, checkout path). An instance keeps its pid file in its own checkout. To find them all, use `git worktree list` from the main checkout plus each worktree's `dev/.ha.pid` / `dev/.ha-port`.
6. **Watching in the built-in browser.** Headless `ui_test.py` remains the way to test. When the user wants to watch, a sub-agent opens **its own tab** in the built-in browser pane (`tabs_create`, then `navigate` to its instance's URL). It only ever acts on its tab (`tabId` on every call) and never closes or uses another agent's tab. Write this down in `ha-dev-testing`.
   - Check whether a sub-agent actually has the `mcp__Claude_Browser__*` tools. If it doesn't, say so in the report, and write in the skill that only the pilot can open those tabs, one per sub-agent instance.
   - Login: `trusted_networks` bypass for 127.0.0.1 should work on any port. Check it.
7. **The pilot's loop** (`.claude/skills/pilot/SKILL.md`):
   - replace "one sub-agent at a time, no worktree" by: several sub-agents in parallel, each launched with `isolation: "worktree"`, each starting its own instance from its worktree (`dev/ha.sh start`, then `npm run build` there);
   - the pilot stays on `main` in the main checkout, which makes handoff commits simple again. Keep the detached-worktree instructions only as a fallback;
   - after a merge: stop the instance (`dev/ha.sh stop` in the worktree), then remove the worktree;
   - a rule of thumb for how many in parallel (RAM: measure one instance's memory; the machine has 31 GB and 8 cores);
   - remind that parallel PRs touching the same file (the floorplan card is one big file) will conflict: give them disjoint work, or run them one after the other.
8. **`pr-workflow` and `ha-dev-testing` skills, CLAUDE.md "Testing"**: a short paragraph each on the per-worktree instance (how to start it, its port, `list`, stop it when done).

## Test cases (write them down as commands in the report, with their output)

1. Main checkout: `dev/ha.sh status` still says 8123. `dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-setup-view.json` → 9/9 PASS.
2. Create a worktree (`git worktree add ../HA-Plooum-Cards-wt1 -b test/wt1 origin/main`). In it:
   - `dev/ha.sh start` → port 8124, its own token;
   - `npm run build` works without `npm install`;
   - the floorplan suite run from the worktree → 9/9 PASS **against 8124**.
3. Prove it serves the worktree's bundle: change a visible string in the worktree only (e.g. the setup badge's "Setup ·" → "WT1 ·", not committed) and rebuild there. Assert it with a one-test suite or `dev/shot.py --js`: 8124 shows "WT1 ·", 8123 still shows "Setup ·". Revert the change.
4. **In parallel**: a second worktree on 8125. Run the floorplan suite at the same time in the main checkout, wt1 and wt2 (three background processes started together) → all 9/9 PASS. Report the three totals and the wall time.
5. `dev/ha.sh list` shows the three instances. `dev/ha.sh stop` in wt1 stops only 8124. Then clean up: stop wt2, `git worktree remove` both, delete the `test/wt*` branches. Nothing may be left running except the main 8123.
6. The memory of one instance (RSS), for the parallelism rule of thumb.

## The 2 screenshots of your report

1. `dev/shots/parallel-8123.png` and 2. `dev/shots/parallel-8124.png`: the same view (e.g. `/plooum-test/floorplan`, or the setup badge of test 3) on both instances, showing they serve different bundles (test 3's "Setup ·" vs "WT1 ·").
