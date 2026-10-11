# Pilot handoff

Read by the next pilot first (see the `pilot` skill). Committed straight to `main`, no PR. Keep it current.

_Last update: 2026-10-11, pilot session 1 (Opus 5.5)._

`main`'s protection: the user turned off "Lock branch" on 2026-10-11 (it blocked PR merges too); the pilot can push `.claude/pilot/` straight to `main`. While a sub-agent owns the main checkout, commit from a detached worktree: `git worktree add --detach ../HA-Plooum-Cards-pilot origin/main`, commit there, `git push origin HEAD:main`.

## State

| Item | Branch / PR | Status |
| :--- | :--- | :--- |
| Pilot workflow: skills `pilot`, `pr-workflow`, `ha-dev-testing` (+ `editor_shot.py`), `floorplan-card`; CLAUDE.md Pilot mode | `feature/pilot-workflow`, [#6](https://github.com/plooum/HA-Plooum-Cards/pull/6) | merged 2026-10-11 |
| Floorplan editor: 3D setup view following the projection's alignment | `feature/floorplan-setup-view`, [#7](https://github.com/plooum/HA-Plooum-Cards/pull/7) | sub-agent (Sonnet) delivered, CI green; review round 1 sent back (perf of `_checkLayout` in `updated()`, cached config strings in `setupTarget`, embedded card without its header, direction/fov also bump); waiting for its fixes |

The local branch `feature/dpad-keyboard` existed before this session, untouched and unpushed: not ours, leave it.

## Decisions (user)

- 2026-10-11: **Setup view** for the floorplan camera projection. Wide layout: the dialog's preview (right side) becomes the setup view, re-applied after each alignment change even when the preview reloads; the user can move it freely in between ("free view"). Narrow layout: a **Setup / 3D preview** toggle at the top of the alignment zone. Outdoor: facing the pinned facade. Indoor: view **B** (above the camera, looking down to the middle of the room, camera's floor only). The alignment itself stays flexible (free pins). Re-apply only after an alignment change, not when opening the panel; wide vs narrow decided by measuring whether the preview is rendered; UI strings in English.
- 2026-10-11: **one single PR** for the wide and narrow layouts (shared code, no duplication).
- 2026-10-11: don't add the staircase-looking stripes on the garden camera's projected facade to TODO.md (the user said no).
- 2026-10-11: pilot workflow: skills in the repo (through PRs); this handoff and `.claude/pilot/prompts/` straight on `main`; the pilot iterates with sub-agents alone and asks the user only when needed (decisions, merge approvals). "Tu es le pilote" = take the pilot role fully.

## Next

1. Review its PR (diff, CI, own checks in the dev HA, wide and narrow), loop until clean, present it to the user.
2. After it: put the sub-agent's friction into the skills (PR `feature/skills-...`).

## Sub-agent notes

- Prompt 01 (Sonnet, ~13 min, 48 tool calls): delivered all 10 test cases and the 2 screenshots. Deviations accepted: narrow = preview hidden **or stacked below** the editor (HA 2026.10 stacks it at 420 px instead of hiding it); entering 3D preview bumps seq. Friction to put in the skills after #7 (one skills PR): 420 px stacks the preview; stub `setPointerCapture` for synthetic pointer events; `editor_shot.py` js steps are separate evaluates (persist with `window.x`), one `openEditor` per run; `hui-dialog-edit-card` stays in the DOM after Cancel; to drop a corner in place move ≥4 px then back; pilot skill: commit the handoff from a **detached** worktree (`git worktree add --detach`, `git push origin HEAD:main`); floorplan skill: the setup view's design (setupView, setupDialogs, _setupBump).

None yet. Every report must include 2 screenshots (user, 2026-10-11): the prompt names them.
