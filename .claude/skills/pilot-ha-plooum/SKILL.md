---
name: pilot-ha-plooum
description: HA-Plooum-Cards specifics for the pilot. Load it together with the global `pilot` skill (plooum/claude-pilot) when you are the pilot of this repo.
---

# Pilot: HA-Plooum-Cards specifics

The role, loop, review and handoff are in the global `pilot` skill (`~/.claude/skills/pilot`, from plooum/claude-pilot). Only what is specific to this repo is here.

## First steps here

- Handoff: [.claude/pilot/HANDOFF.md](../../pilot/HANDOFF.md).
- `dev/ha.sh status`: the main checkout's HA on 8123 may stay running.
- The agent board lives in `~/.local/opt/agent-board` (see the `agent-board` skill).

## Sub-agents' dev environment

- Each worktree starts its own HA: `dev/ha.sh start`, then `npm run build` there. Ports 8124+, ~270 MB each, `dev/ha.sh list` shows them. The prompt tells the sub-agent to `dev/ha.sh stop` at the end.
- In parallel: 3-4 on the desktop, 1-2 on the laptop (7 GB RAM).
- Prompts say: suites with `dev/ui_test.py`, hand checks with `dev/shot.py --js`, never the built-in pane.
- `dev/ha.sh start` registers the worktree on the board.
- The floorplan card is one 7,000-line file: give parallel PRs disjoint work.

## Merging here

- Stop the sub-agent's HA **before** `gh pr merge`: `--delete-branch` removes its worktree and orphans its HA (find it with `ss -ltnp | grep 812`).
- Rebase rule: CLAUDE.md, **Git workflow**. CI = Build + Validate.
- Releases only on the user's go (CLAUDE.md, **Releases**).
- The main checkout's `/plooum-edit` goes stale when `plooum-test.yaml` changes: `dev/ha.sh reset` then `dev/ha.sh start`.

## Review checklist: project items

- The card outside the editor is unchanged; the dashboard cards behind the editor dialog are unaffected.
- Edge cases: missing / unavailable entity, a camera with no picture, another floor, an empty plan.
- `shot.py` exits 0.
- `docs/<card>.md` updated; README.md and README.fr.md together.
- No bundle committed, no `CARD_VERSION` bump in a feature PR.
- Branch without `tags/`; UI strings in English.

## Test premises

- Check test cases against `dev/ha-config/dashboards/plooum-test.yaml` (both floors); prompt 10 assumed a free side that was the ground floor's own wing.
- A speed-up task: measure the split first (`dev/ui_test.py --verbose`); prompt 19 assumed page loads dominated and they did not.

## Project skills

| Skill | For |
| :--- | :--- |
| `pilot-ha-plooum` | this file |
| `pr-workflow` | every sub-agent: this repo's delivery specifics |
| `ha-dev-testing` | any task that tests in the dev HA |
| `floorplan-card` | any change to the floorplan card |

Skill ideas: `vivarium-card`, `docs-readme`, `new-card`.

## Handoff here

`.claude/pilot/` is committed straight to `main` (CLAUDE.md exception). Fallback when a sub-agent works in the main checkout: a detached worktree, `git worktree add --detach ../HA-Plooum-Cards-pilot origin/main`, then `git -C ../HA-Plooum-Cards-pilot push origin HEAD:main`. The push lists "Bypassed rule violations": expected.
