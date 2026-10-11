# Pilot handoff

Read by the next pilot first (see the `pilot` skill). Committed straight to `main`, no PR. Keep it current.

_Last update: 2026-10-11, pilot session 1 (Opus 5.5)._

`main`'s protection: the user turned off "Lock branch" on 2026-10-11 (it blocked PR merges too); the pilot can push `.claude/pilot/` straight to `main`. While a sub-agent owns the main checkout, commit from a detached worktree: `git worktree add --detach ../HA-Plooum-Cards-pilot origin/main`, commit there, `git push origin HEAD:main`.

## State

| Item | Branch / PR | Status |
| :--- | :--- | :--- |
| Pilot workflow: skills `pilot`, `pr-workflow`, `ha-dev-testing` (+ `editor_shot.py`), `floorplan-card`; CLAUDE.md Pilot mode | `feature/pilot-workflow`, [#6](https://github.com/plooum/HA-Plooum-Cards/pull/6) | merged 2026-10-11 |
| Floorplan editor: 3D setup view following the projection's alignment | `feature/floorplan-setup-view`, [#7](https://github.com/plooum/HA-Plooum-Cards/pull/7) | merged 2026-10-11 (not tested yet in the Android app) |
| Skills: friction from the setup view sub-agent | `feature/skills-setup-view-friction`, [#8](https://github.com/plooum/HA-Plooum-Cards/pull/8) | merged 2026-10-11 |
| Floorplan `CARD_VERSION` 1.8.0 + release **V1.1.0** | [#9](https://github.com/plooum/HA-Plooum-Cards/pull/9), [release](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.1.0) | merged and published 2026-10-11, both assets attached by build.yml |

The local branch `feature/dpad-keyboard` existed before this session, untouched and unpushed: not ours, leave it.
| UI test runner `dev/ui_test.py` + floorplan setup view suite | `feature/ui-test-runner`, [#10](https://github.com/plooum/HA-Plooum-Cards/pull/10) | merged 2026-10-11 (suite 9/9 PASS in 27.8 s) |

## Decisions (user)

- 2026-10-11: **Setup view** for the floorplan camera projection. Wide layout: the dialog's preview (right side) becomes the setup view, re-applied after each alignment change even when the preview reloads; the user can move it freely in between ("free view"). Narrow layout: a **Setup / 3D preview** toggle at the top of the alignment zone. Outdoor: facing the pinned facade. Indoor: view **B** (above the camera, looking down to the middle of the room, camera's floor only). The alignment itself stays flexible (free pins). Re-apply only after an alignment change, not when opening the panel; wide vs narrow decided by measuring whether the preview is rendered; UI strings in English.
- 2026-10-11: **one single PR** for the wide and narrow layouts (shared code, no duplication).
- 2026-10-11: don't add the staircase-looking stripes on the garden camera's projected facade to TODO.md (the user said no).
- 2026-10-11: the sub-agents' tests are too slow: optimize them (one suite per feature with assertions, run in one command; no fixed waits).
- 2026-10-11: pilot workflow: skills in the repo (through PRs); this handoff and `.claude/pilot/prompts/` straight on `main`; the pilot iterates with sub-agents alone and asks the user only when needed (decisions, merge approvals). "Tu es le pilote" = take the pilot role fully.

## Next

Nothing in progress: ask the user for the next development. Every prompt now specifies its tests as a `dev/tests/<feature>.json` suite run by `dev/ui_test.py`, and the pilot reviews by re-running it. Open point: the setup view hasn't been tried in the HA Android app.

## Sub-agent notes

- Prompt 02 (Sonnet, ~13 min, 31 tool calls): no review round needed. Its friction is already in the skills it rewrote (`wait_for_function` doesn't await promises: readiness check must be sync; no `about:blank` between tests; the dashboard builds stack cards lazily: snapshot by title).

- Prompt 01 (Sonnet, ~13 min, 48 tool calls): delivered all 10 test cases and the 2 screenshots. Deviations accepted: narrow = preview hidden **or stacked below** the editor (HA 2026.10 stacks it at 420 px instead of hiding it); entering 3D preview bumps seq. Friction, put in the skills by #8: 420 px stacks the preview; stub `setPointerCapture` for synthetic pointer events; `editor_shot.py` js steps are separate evaluates (persist with `window.x`), one `openEditor` per run; `hui-dialog-edit-card` stays in the DOM after Cancel; to drop a corner in place move ≥4 px then back; pilot skill: commit the handoff from a **detached** worktree (`git worktree add --detach`, `git push origin HEAD:main`); floorplan skill: the setup view's design (setupView, setupDialogs, _setupBump).

None yet. Every report must include 2 screenshots (user, 2026-10-11): the prompt names them.
