# Pilot handoff

Read by the next pilot first (see the `pilot` skill). Committed straight to `main`, no PR. Keep it current.

_Last update: 2026-10-11, end of pilot session 3 (Opus 5.5, laptop): #17–#34 merged; releases V1.2.0 (`projected_windows`), V1.3.0 (drawn roofs `roofs` + editor roof layer), V1.3.1 (partial gable end), V1.3.2 (window sides). Live test runner in the pane (`runner.html`), dev user in English, faster measured sub-agent loop. Nothing in progress._

`main`'s protection: the user turned off "Lock branch" on 2026-10-11 (it blocked PR merges too); the pilot pushes `.claude/pilot/` straight to `main`. The pilot stays on `main` in the main checkout (HA on 8123) and commits the handoff there; sub-agents work in their own worktrees with their own HA (see the `pilot` skill).

## Machines

The user works on two PCs; the pilot may start on either.

- **Desktop**: 31 GB RAM, 8 cores: 3–4 sub-agents in parallel.
- **Laptop** (`doudou-laptop`, Linux Mint 22.3, set up 2026-10-11): **7 GB RAM**, 8 cores: **1–2 sub-agents at most** in parallel. Tools are user-level in `~/.local` (no sudo): Node 24 LTS (`~/.local/opt/node`), `gh` (`~/.local/opt/gh_*`), `uv`; all in `~/.local/bin` (on PATH via `.profile` / `.bashrc`). `gh` logged in as `plooum` (HTTPS, `gh auth setup-git`); git identity `Plooum <letailleur.edouard@gmail.com>` global. No clipboard tool: `gh auth login --web` can't copy its code, the user opens github.com/login/device by hand.
- New PC checklist: `node`/`npm`, `uv`, `gh` + `gh auth login`, git identity, `git config fetch.prune true`, `npm install`, `npm run build`, `dev/ha.sh start` (~70 s first time: venv + HA + Playwright), then `dev/tests/cards-smoke.json` (9/9).

## State

| Item | Branch / PR | Status |
| :--- | :--- | :--- |
| Pilot workflow: skills `pilot`, `pr-workflow`, `ha-dev-testing` (+ `editor_shot.py`), `floorplan-card`; CLAUDE.md Pilot mode | `feature/pilot-workflow`, [#6](https://github.com/plooum/HA-Plooum-Cards/pull/6) | merged 2026-10-11 |
| Floorplan editor: 3D setup view following the projection's alignment | `feature/floorplan-setup-view`, [#7](https://github.com/plooum/HA-Plooum-Cards/pull/7) | merged 2026-10-11 (not tested yet in the Android app) |
| Skills: friction from the setup view sub-agent | `feature/skills-setup-view-friction`, [#8](https://github.com/plooum/HA-Plooum-Cards/pull/8) | merged 2026-10-11 |
| Floorplan `CARD_VERSION` 1.8.0 + release **V1.1.0** | [#9](https://github.com/plooum/HA-Plooum-Cards/pull/9), [release](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.1.0) | merged and published 2026-10-11, both assets attached by build.yml |

| UI test runner `dev/ui_test.py` + floorplan setup view suite | `feature/ui-test-runner`, [#10](https://github.com/plooum/HA-Plooum-Cards/pull/10) | merged 2026-10-11 (suite 9/9 PASS in 27.8 s) |
| One dev HA per worktree (ports 8124+), parallel sub-agents | `feature/parallel-instances`, [#11](https://github.com/plooum/HA-Plooum-Cards/pull/11) | merged 2026-10-11 |
| `CARD_VERSION` 1.0.0 for button-badge, cover, dpad, gridicons, tabbed, temp-humidity (prompt 04) | `feature/card-versions`, [#14](https://github.com/plooum/HA-Plooum-Cards/pull/14) | merged 2026-10-11 |
| Test view per card + `dev/tests/cards-smoke.json` (prompt 05) | `feature/card-smoke-tests`, [#15](https://github.com/plooum/HA-Plooum-Cards/pull/15) | merged 2026-10-11 (9/9 in ~4.5 s, also on main's HA) |
| Skills: friction from prompts 04/05, skills PR right after each review (pilot) | `feature/skills-friction-04-05`, [#16](https://github.com/plooum/HA-Plooum-Cards/pull/16) | merged 2026-10-11 |
| Release **V1.1.1** (six new `CARD_VERSION`s, smoke suite) | [release](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.1.1) | published 2026-10-11, both assets attached by build.yml |
| Floorplan: windows / shutters on a projected facade, render experiments (prompt 06) | `feature/floorplan-projected-windows`, draft [#17](https://github.com/plooum/HA-Plooum-Cards/pull/17) | merged 2026-10-11, released in V1.2.0 |
| Skills: stop for answers, keep sub-agents, HA stopped before merge | `feature/skills-friction-06b`, [#19](https://github.com/plooum/HA-Plooum-Cards/pull/19) | merged 2026-10-11 |
| Floorplan `CARD_VERSION` 1.9.0 + release **V1.2.0** (for #17) | `feature/floorplan-version-1.9.0`, [#20](https://github.com/plooum/HA-Plooum-Cards/pull/20) | merged 2026-10-11, [release V1.2.0](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.2.0) published, both assets attached by build.yml |
| Live test runner in the pane (prompt 07) | `feature/live-test-runner`, [#21](https://github.com/plooum/HA-Plooum-Cards/pull/21) | merged 2026-10-11 (main HA restarted + bootstrap: English, runner served) |
| Skills: always watch the sub-agents | `feature/skills-always-watch`, [#23](https://github.com/plooum/HA-Plooum-Cards/pull/23) | merged 2026-10-11 |
| Skills: `--body-file` (prompt 07) | `feature/skills-friction-07`, [#22](https://github.com/plooum/HA-Plooum-Cards/pull/22) | merged 2026-10-11 |
| Skills: friction from prompt 06 | `feature/skills-friction-06`, [#18](https://github.com/plooum/HA-Plooum-Cards/pull/18) | merged 2026-10-11 |
| Floorplan `CARD_VERSION` 1.10.0 + release **V1.3.0** (drawn roofs) | [#28](https://github.com/plooum/HA-Plooum-Cards/pull/28), [release](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.3.0) | published 2026-10-11, both assets attached |
| Floorplan drawn roofs, part 1: `roofs` option + 3D (prompt 08) | `feature/floorplan-roof-zones`, [#24](https://github.com/plooum/HA-Plooum-Cards/pull/24) | merged 2026-10-11 |
| Skills: friction from prompt 08 | `feature/skills-friction-08`, [#25](https://github.com/plooum/HA-Plooum-Cards/pull/25) | merged 2026-10-11 |
| Floorplan drawn roofs, part 2: editor roof layer (prompt 09) | `feature/floorplan-roof-editor`, [#26](https://github.com/plooum/HA-Plooum-Cards/pull/26) | merged 2026-10-11 |
| Skills: friction from prompt 09 | `feature/skills-friction-09`, [#27](https://github.com/plooum/HA-Plooum-Cards/pull/27) | merged 2026-10-11 |
| Drawn roofs: partial gable end (prompt 10) | `feature/floorplan-partial-gable`, [#29](https://github.com/plooum/HA-Plooum-Cards/pull/29) | merged 2026-10-11, released in [V1.3.1](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.3.1) (floorplan 1.10.1, [#31](https://github.com/plooum/HA-Plooum-Cards/pull/31)). Deviation accepted: same-floor rooms also close the side |
| Skills: faster sub-agent loop + prompt 10 friction (also CLAUDE.md: no rebase for `.claude/pilot/`-only moves of `main`) | `feature/skills-friction-10`, [#30](https://github.com/plooum/HA-Plooum-Cards/pull/30) | merged 2026-10-11 |
| Bug: projected windows reappear when the view turns (prompt 11, fast path) | `feature/floorplan-window-sides`, [#32](https://github.com/plooum/HA-Plooum-Cards/pull/32) | merged 2026-10-11, released in [V1.3.2](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.3.2) (floorplan 1.10.2, [#34](https://github.com/plooum/HA-Plooum-Cards/pull/34)) |
| Skills: measure each sub-agent (`agent_timing.py`) and cut what takes time | `feature/skills-agent-timing`, [#33](https://github.com/plooum/HA-Plooum-Cards/pull/33) | merged 2026-10-11 |
| `.claude/worktrees/` in `.gitignore` (pilot, backlog item) | `feature/gitignore-worktrees`, [#35](https://github.com/plooum/HA-Plooum-Cards/pull/35) | merged 2026-10-12
| `dev/shot.py --console` (prompt 13, fast path) | `feature/shot-console`, [#36](https://github.com/plooum/HA-Plooum-Cards/pull/36) | merged 2026-10-12
| Suites: `finally` steps restore states (prompt 12, fast path) | `feature/suite-finally`, [#38](https://github.com/plooum/HA-Plooum-Cards/pull/38) | merged 2026-10-12
| Skills: trust the sub-agents' tests, tests at the strict minimum (pilot) | `feature/skills-trust-tests`, [#37](https://github.com/plooum/HA-Plooum-Cards/pull/37) | merged 2026-10-12
| Agent board part 1: server, page, test results (prompt 14) | `feature/agent-board`, [#39](https://github.com/plooum/HA-Plooum-Cards/pull/39) | merged 2026-10-12; board running from main on 8120 (default data dir)
| Skills: prompt 14 friction (pkill, Monitor) | `feature/skills-friction-14`, [#40](https://github.com/plooum/HA-Plooum-Cards/pull/40) | merged 2026-10-12
| Agent board part 2: Claude Code hook, commands + file edits (prompt 15) | `feature/board-hook`, [#42](https://github.com/plooum/HA-Plooum-Cards/pull/42) | merged 2026-10-12 (`.claude/settings.json` hook; live check at the first sub-agent of a new session)
| Pilot skill: keep the agent board current | `feature/skills-pilot-board`, [#41](https://github.com/plooum/HA-Plooum-Cards/pull/41) | merged 2026-10-12
| Agent board part 3: live browser view, headless screencast, agents leave the pane (prompt 16) | `feature/board-browser-view`, [#43](https://github.com/plooum/HA-Plooum-Cards/pull/43) | merged 2026-10-12
| Pilot skill: sub-agents leave the pane | `feature/skills-pilot-no-pane`, [#44](https://github.com/plooum/HA-Plooum-Cards/pull/44) | merged 2026-10-12
| Agent board: `archive` route fix (pilot, 2 lines) | `feature/board-archive-route`, [#45](https://github.com/plooum/HA-Plooum-Cards/pull/45) | waiting for approval |
| Drop fisheye from TODO.md (pilot) | `feature/todo-no-fisheye`, [#12](https://github.com/plooum/HA-Plooum-Cards/pull/12) | merged 2026-10-11 |
| Pilot skill: no stale branches (pilot) | `feature/skills-branch-hygiene`, [#13](https://github.com/plooum/HA-Plooum-Cards/pull/13) | merged 2026-10-11 |

## Decisions (user)

- 2026-10-12, **agent board, browser view**: a read-only live view of each sub-agent's browser in the board. The built-in pane can't be mirrored, so **sub-agents no longer use the pane**: suites and hand checks run in headless Chrome (`ui_test.py` / a small command for hand checks) that streams a screencast to the board; live frames not stored, one screenshot per finished test kept (30 days). **Supersedes** the 2026-10-11 "watch the sub-agents in the pane" decisions. Part 3, after part 2 (hook); stays generic (the board receives frames for an agent).

- 2026-10-12, **agent board**: dark design by default (not the OS setting; a toggle to light). one central live page (own browser, e.g. :8120) showing each sub-agent (title, name, current action), its tests live and after it's done; history 30 days; test run history per suite; the pilot archives previous agents when launching new ones; actions = **commands and file edits only**; **the pilot isn't shown**. **Must be generic and self-contained (`tools/agent-board/`)**: the user will later move it out to use elsewhere. Part 1 = server + page + test results (prompt 14), part 2 = Claude Code hook for actions.

- 2026-10-12: **optimize everything; the pilot doesn't re-run the sub-agents' tests**: trust them, but define their tests carefully in the prompt; tests always at the **strict minimum**. At the review, **show the user the result** (pane / screenshots). The dev HA on 8123 may stay running. After backlog items 1, 3, 4: **explain the test tool to the user** (#37).

- 2026-10-11: **measure what takes time and keep improving**; watch each running sub-agent and steer it when it drifts (#33).

- 2026-10-11: **the sub-agent loop is too long: optimize it** (#30). Baseline: prompts 06–10 took 8–13 min and 49–78 tool calls each, plus 2–4 min of pilot CI waits per merge.

- 2026-10-11, **roofs**: the user draws the roof like a floor: the floors' outer walls drawn as guides, **rectangular zones** (like rooms), each with **0 (flat), 1, 2, 3 or 4 slopes**, a **direction** and a **pitch per zone**; the user can add zones; zones **pre-filled from the automatic roof** when the roof layer opens; without `roofs` the automatic roof stays as today. Pilot's design: `roofs: [{x,y,w,h,slopes,direction,pitch}]`, direction north/east/south/west (north = -y), meaning per type in prompt 08; part 1 = option + 3D, part 2 = editor.

- 2026-10-11, **always**: the user wants to **always be able to watch the sub-agents**: suites and hand checks in the sub-agent's own pane tab (`runner.html`), headless only for screenshots. Say so in every prompt (skills by #23).

- 2026-10-11: **keep the sub-agent's context, worktree and HA until the user has validated its returns** (every round trip, and the merge approval) (in case of changes): fixes go to the same sub-agent with `SendMessage`; cleanup only after the merge. In the `pilot` skill by #19.

- 2026-10-11: the user wants to **watch the sub-agents' tests live in the built-in browser pane** (the suites run in headless Chrome today). Pilot's proposal, approved 2026-10-11 (prompt 07): an in-page runner (`/plooum_dev/runner.html?suite=…`, served by `plooum_dev`) that runs each test of a suite in an iframe, so a sub-agent just navigates its pane tab to it.

- 2026-10-11, **tokens**: a sub-agent that needs an answer **stops** (ends its turn with the question in its report), it never waits, polls or works around it; the pilot answers later with `SendMessage`, which resumes it with its context. Say so in every prompt; in the skills by #19.

- 2026-10-11: `projected_windows` stays a **real option** with `overlay`, `solid`, `outline`, `hidden` (`faint` removed). Default `overlay`: the pilot's pick from "transparent / projection on top", to confirm with the user at the review.

- 2026-10-11: two floorplan topics, **shutters first**, then roofs. Shutters on a projected facade: by default transparent / the projection on top; the user wants **renders of several variants before deciding** (prompt 06: `solid`, `faint`, `overlay`, `outline`, `hidden`). **Only 5 renders** (one per variant, close view, shutters at 50): the user found 30 too long; keep render requests minimal. Roofs (shapes, slope, config level): to discuss after.

- 2026-10-11, **very important**: the skills PR is opened **right after each review**, never postponed or batched (written in the `pilot` skill by #16).
- 2026-10-11: **no Android test** of the setup view needed; **no new feature** for now.
- 2026-10-11: **never** more complex camera handling in the floorplan (fisheye or other), now or later.
- 2026-10-11: a `CARD_VERSION` for every card (prompt 04).
- 2026-10-11: a test view per card, and tests for all cards that are **simple and fast** (the user finds tests long): prompt 05.
- 2026-10-11: no useless branch left behind, now or later: GitHub "Automatically delete head branches" turned on, `fetch.prune=true` in the main checkout, check in the pilot skill (#13). `feature/dpad-keyboard` deleted.
- 2026-10-11: the pilot keeps the **inventory of what's left** in [BACKLOG.md](BACKLOG.md), itself (no sub-agent), straight on `main`.
- 2026-10-11: **Setup view** for the floorplan camera projection. Wide layout: the dialog's preview (right side) becomes the setup view, re-applied after each alignment change even when the preview reloads; the user can move it freely in between ("free view"). Narrow layout: a **Setup / 3D preview** toggle at the top of the alignment zone. Outdoor: facing the pinned facade. Indoor: view **B** (above the camera, looking down to the middle of the room, camera's floor only). The alignment itself stays flexible (free pins). Re-apply only after an alignment change, not when opening the panel; wide vs narrow decided by measuring whether the preview is rendered; UI strings in English.
- 2026-10-11: **one single PR** for the wide and narrow layouts (shared code, no duplication).
- 2026-10-11: don't add the staircase-looking stripes on the garden camera's projected facade to TODO.md (the user said no).
- 2026-10-11: sub-agents must be able to test **in parallel**: one HA instance per worktree on its own port, and one built-in browser tab each when the user watches.
- 2026-10-11: the sub-agents' tests are too slow: optimize them (one suite per feature with assertions, run in one command; no fixed waits).
- 2026-10-11: pilot workflow: skills in the repo (through PRs); this handoff and `.claude/pilot/prompts/` straight on `main`; the pilot iterates with sub-agents alone and asks the user only when needed (decisions, merge approvals). "Tu es le pilote" = take the pilot role fully.

## Next

Agent board done (#39, #42, #43; skills #41, #44), running from main on 8120 (start it if down: pilot skill). Hook verified live 2026-10-12 (it took effect mid-session: prompt 16 got 29 actions; Bash shows the command when the agent gave no description). Browser panel verified with a pilot demo run (agent `demo-browser-view`, port 8123). Was: check live that the hook (#42, `.claude/settings.json`) posts a sub-agent's commands / edits to its timeline (hooks load at session start; unverified whether the hook's `cwd` is the sub-agent's worktree), and that its suites show in the Browser panel. Then BACKLOG.md (roof layer checks).

How to run the loop now (all in the skills since #30 / #33): short exact prompts with checked premises, fast path for one-function fixes, the sub-agent tests in its own pane tab (`runner.html`, `pause=0`) and doesn't wait for CI; watch it in the background and steer it when it drifts; after it reports, `python3 .claude/skills/pilot/agent_timing.py <its task output file>` and log the totals below; keep it (context, worktree, HA) until the user approved the merge; stop its HA before `gh pr merge`; rebase only if `main` moved outside `.claude/pilot/` (CLAUDE.md); skills PR right after each review; releases only on the user's go.

## Sub-agent notes

- Prompt 05 (Sonnet, ~6 min + 1 min review round, 53 tool calls): 9/9 in ~4.4 s. Review round: floorplan test flaked on a cold instance (`rendered(tag, 1)` vs lazy dashboard: pass the view's real count), redundant editor assert, cover test depended on the current position, machine-formatted JSON. Friction: worktree sandbox refuses compound `git` / heredoc / `python3 -` commands; a card's shadow root has 1 child (`ha-card`, styles adopted); an editor appended to `body` fails on `localize` (append next to the card, in the skill now).

- Prompt 04 (Sonnet, ~2 min, 18 tool calls): no review round. Friction to put in skills (with prompt 05's): `dev/shot.py` doesn't print `console.info` (wanted: `--console <substr>`); in a worktree the sandbox refuses compound commands (brace expansion, `git` with `&&` / `;` / heredoc): plain separate commands, scripts written with Write; `git checkout -b x origin/main` tracks origin/main until `git push -u`. The banner logs on every `connectedCallback` (several times per page): existing pattern, accepted.

- Prompt 03 (Sonnet, ~7 min, 34 tool calls): no review round needed. Sub-agents **do** have the built-in browser tools (it opened, used and closed its own tab on 8124). Friction already in its skills/code: `set -e` + `&&` chains as last loop statement abort silently (use `if`); a `nohup` inside `flock 9` must close fd 9 (`9>&-`); `.gitignore` entries with a trailing `/` don't match symlinks.

- Prompt 02 (Sonnet, ~13 min, 31 tool calls): no review round needed. Its friction is already in the skills it rewrote (`wait_for_function` doesn't await promises: readiness check must be sync; no `about:blank` between tests; the dashboard builds stack cards lazily: snapshot by title).

- Prompt 01 (Sonnet, ~13 min, 48 tool calls): delivered all 10 test cases and the 2 screenshots. Deviations accepted: narrow = preview hidden **or stacked below** the editor (HA 2026.10 stacks it at 420 px instead of hiding it); entering 3D preview bumps seq. Friction, put in the skills by #8: 420 px stacks the preview; stub `setPointerCapture` for synthetic pointer events; `editor_shot.py` js steps are separate evaluates (persist with `window.x`), one `openEditor` per run; `hui-dialog-edit-card` stays in the DOM after Cancel; to drop a corner in place move ≥4 px then back; pilot skill: commit the handoff from a **detached** worktree (`git worktree add --detach`, `git push origin HEAD:main`); floorplan skill: the setup view's design (setupView, setupDialogs, _setupBump).

- Prompt 16 (Sonnet): 3.7 + 2.7 min, 31 + 12 calls, 1 round (speed). Prompt 15 (Sonnet): 1.2 min, 14 calls, no round.
- Prompt 14 (Sonnet): 4.5 + 1.4 + 0.6 min, 67 + 21 + 12 calls, 2 review rounds (headless reporting missing, main checkout registered; narrow layout).
- Prompt 12 (Sonnet, fast path): 1.6 + 0.8 min, 19 + 9 calls, 1 review round. Prompt 13 (Sonnet, fast path): 0.7 min, 11 calls, no round. Friction already in the skills.
- Prompt 11 (Sonnet, fast path, one steer): **4.7 min**, 25 calls, model 1.0 min, tools 4.0 (headless suites 143 s before the steer, HA start 25 s), 3 refusals (`export PATH`, a /tmp path).
- Prompt 10 (Sonnet, ~8 min, 49 tool calls): the prompt's premise (x 8–11 free) was wrong, found through a failing suite; screenshot viewpoint trial and error.
- Prompt 09 (Sonnet, ~10.5 + ~2.5 min, 65 + 13 tool calls). Prompt 08 (Sonnet, ~10.5 min, 71). Prompt 07 (Sonnet, ~9 + ~3.5 min, 53 + 17).
- Prompt 06 (Sonnet, ~10.5 min, 63 tool calls): had already rendered the 30-shot grid when the scope was cut to 5. Friction in #18 (orbit dist in px, `_tick` refresh, sandbox, `~/.local/bin`). Its worktree: `.claude/worktrees/agent-a3c78baeefb7f2c02` (HA on 8124, still running).

None yet. Every report must include 2 screenshots (user, 2026-10-11): the prompt names them.
