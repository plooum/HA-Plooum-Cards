# Pilot handoff

Read by the next pilot first (see the `pilot` skill). Committed straight to `main`, no PR. Keep it current.

_Last update: 2026-10-11, pilot session 2 (Opus 5.5)._

`main`'s protection: the user turned off "Lock branch" on 2026-10-11 (it blocked PR merges too); the pilot pushes `.claude/pilot/` straight to `main`. The pilot stays on `main` in the main checkout (HA on 8123) and commits the handoff there; sub-agents work in their own worktrees with their own HA (see the `pilot` skill).

## State

| Item | Branch / PR | Status |
| :--- | :--- | :--- |
| Pilot workflow: skills `pilot`, `pr-workflow`, `ha-dev-testing` (+ `editor_shot.py`), `floorplan-card`; CLAUDE.md Pilot mode | `feature/pilot-workflow`, [#6](https://github.com/plooum/HA-Plooum-Cards/pull/6) | merged 2026-10-11 |
| Floorplan editor: 3D setup view following the projection's alignment | `feature/floorplan-setup-view`, [#7](https://github.com/plooum/HA-Plooum-Cards/pull/7) | merged 2026-10-11 (not tested yet in the Android app) |
| Skills: friction from the setup view sub-agent | `feature/skills-setup-view-friction`, [#8](https://github.com/plooum/HA-Plooum-Cards/pull/8) | merged 2026-10-11 |
| Floorplan `CARD_VERSION` 1.8.0 + release **V1.1.0** | [#9](https://github.com/plooum/HA-Plooum-Cards/pull/9), [release](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.1.0) | merged and published 2026-10-11, both assets attached by build.yml |

| UI test runner `dev/ui_test.py` + floorplan setup view suite | `feature/ui-test-runner`, [#10](https://github.com/plooum/HA-Plooum-Cards/pull/10) | merged 2026-10-11 (suite 9/9 PASS in 27.8 s) |
| One dev HA per worktree (ports 8124+), parallel sub-agents | `feature/parallel-instances`, [#11](https://github.com/plooum/HA-Plooum-Cards/pull/11) | merged 2026-10-11 |
| `CARD_VERSION` 1.0.0 for button-badge, cover, dpad, gridicons, tabbed, temp-humidity (prompt 04) | `feature/card-versions`, [#14](https://github.com/plooum/HA-Plooum-Cards/pull/14) | reviewed, waiting for approval |
| Test view per card + `dev/tests/cards-smoke.json` (prompt 05) | `feature/card-smoke-tests` | sub-agent working (worktree) |
| Drop fisheye from TODO.md (pilot) | `feature/todo-no-fisheye`, [#12](https://github.com/plooum/HA-Plooum-Cards/pull/12) | waiting for approval |
| Pilot skill: no stale branches (pilot) | `feature/skills-branch-hygiene`, [#13](https://github.com/plooum/HA-Plooum-Cards/pull/13) | waiting for approval |

## Decisions (user)

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

See [BACKLOG.md](BACKLOG.md): the complete inventory (user decisions pending, work ready to launch, housekeeping). Nothing in progress. Sub-agents run in parallel (`isolation: "worktree"`, own HA 8124+, 3–4 at a time, disjoint files).

## Sub-agent notes

- Prompt 04 (Sonnet, ~2 min, 18 tool calls): no review round. Friction to put in skills (with prompt 05's): `dev/shot.py` doesn't print `console.info` (wanted: `--console <substr>`); in a worktree the sandbox refuses compound commands (brace expansion, `git` with `&&` / `;` / heredoc): plain separate commands, scripts written with Write; `git checkout -b x origin/main` tracks origin/main until `git push -u`. The banner logs on every `connectedCallback` (several times per page): existing pattern, accepted.

- Prompt 03 (Sonnet, ~7 min, 34 tool calls): no review round needed. Sub-agents **do** have the built-in browser tools (it opened, used and closed its own tab on 8124). Friction already in its skills/code: `set -e` + `&&` chains as last loop statement abort silently (use `if`); a `nohup` inside `flock 9` must close fd 9 (`9>&-`); `.gitignore` entries with a trailing `/` don't match symlinks.

- Prompt 02 (Sonnet, ~13 min, 31 tool calls): no review round needed. Its friction is already in the skills it rewrote (`wait_for_function` doesn't await promises: readiness check must be sync; no `about:blank` between tests; the dashboard builds stack cards lazily: snapshot by title).

- Prompt 01 (Sonnet, ~13 min, 48 tool calls): delivered all 10 test cases and the 2 screenshots. Deviations accepted: narrow = preview hidden **or stacked below** the editor (HA 2026.10 stacks it at 420 px instead of hiding it); entering 3D preview bumps seq. Friction, put in the skills by #8: 420 px stacks the preview; stub `setPointerCapture` for synthetic pointer events; `editor_shot.py` js steps are separate evaluates (persist with `window.x`), one `openEditor` per run; `hui-dialog-edit-card` stays in the DOM after Cancel; to drop a corner in place move ≥4 px then back; pilot skill: commit the handoff from a **detached** worktree (`git worktree add --detach`, `git push origin HEAD:main`); floorplan skill: the setup view's design (setupView, setupDialogs, _setupBump).

None yet. Every report must include 2 screenshots (user, 2026-10-11): the prompt names them.
