# Pilot handoff

Read by the next pilot first (see the `pilot` skill). Committed straight to `main`, no PR. Keep it current.

_Last update: 2026-10-11, pilot session 1 (Opus 5.5)._

## State

| Item | Branch / PR | Status |
| :--- | :--- | :--- |
| Pilot workflow: skills `pilot`, `pr-workflow`, `ha-dev-testing` (+ `editor_shot.py`), `floorplan-card`; CLAUDE.md Pilot mode | `feature/pilot-workflow`, [#6](https://github.com/plooum/HA-Plooum-Cards/pull/6) | waiting for the user's merge approval |
| Floorplan editor: 3D setup view following the projection's alignment | `feature/floorplan-setup-view` (not created yet) | prompt written: [prompts/01-floorplan-setup-view.md](prompts/01-floorplan-setup-view.md); to launch once #6 is merged (the sub-agent needs the skills on `main`) |

The local branch `feature/dpad-keyboard` existed before this session, untouched and unpushed: not ours, leave it.

## Decisions (user)

- 2026-10-11: **Setup view** for the floorplan camera projection. Wide layout: the dialog's preview (right side) becomes the setup view, re-applied after each alignment change even when the preview reloads; the user can move it freely in between ("free view"). Narrow layout: a **Setup / 3D preview** toggle at the top of the alignment zone. Outdoor: facing the pinned facade. Indoor: view **B** (above the camera, looking down to the middle of the room, camera's floor only). The alignment itself stays flexible (free pins). Re-apply only after an alignment change, not when opening the panel; wide vs narrow decided by measuring whether the preview is rendered; UI strings in English.
- 2026-10-11: **one single PR** for the wide and narrow layouts (shared code, no duplication).
- 2026-10-11: don't add the staircase-looking stripes on the garden camera's projected facade to TODO.md (the user said no).
- 2026-10-11: pilot workflow: skills in the repo (through PRs); this handoff and `.claude/pilot/prompts/` straight on `main`; the pilot iterates with sub-agents alone and asks the user only when needed (decisions, merge approvals). "Tu es le pilote" = take the pilot role fully.

## Next

1. Get #6 merged (user approval), then `git pull` on `main`.
2. Launch the sub-agent with prompt 01 (Sonnet, background, main checkout, no worktree).
3. Review its PR (diff, CI, own checks in the dev HA, wide and narrow), loop until clean, present it to the user.
4. After it: put the sub-agent's friction into the skills (PR `feature/skills-...`).

## Sub-agent notes

None yet. Every report must include 2 screenshots (user, 2026-10-11): the prompt names them.
