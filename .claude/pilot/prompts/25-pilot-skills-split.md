# Prompt 25: HA-Plooum-Cards keeps only its pilot specifics (generic part → plooum/claude-pilot)

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow`. No HA, no browser, no build: docs and skills only. `~/.local/bin/gh` by full path if needed. A question → stop and report it.

## Goal (user, 2026-10-12)

The generic pilot workflow leaves this repo for **https://github.com/plooum/claude-pilot** (public; a sibling sub-agent writes it in parallel), installed per machine in `~/.local/opt/claude-pilot`, its skills linked globally as **`pilot`** (the pilot's role, loop, review, handoff, measuring with `~/.claude/skills/pilot/agent_timing.py`) and **`pilot-subagent`** (the sub-agent side: branch, PR, sandbox pitfalls, be fast, the report format with Friction). This repo keeps **only what is specific to HA-Plooum-Cards**, in skills that are loaded **together with** the global ones.

## Changes (fixed)

1. **`git mv .claude/skills/pilot .claude/skills/pilot-ha-plooum`**, `git rm .claude/skills/pilot-ha-plooum/agent_timing.py` (global now). Rewrite its `SKILL.md`: frontmatter `name: pilot-ha-plooum`, description "HA-Plooum-Cards specifics for the pilot. Load it together with the global `pilot` skill (plooum/claude-pilot) when you are the pilot of this repo." Keep **only** (rephrased short, nothing generic left):
   - first steps here: `dev/ha.sh status` (8123 may stay running), the board (`~/.local/opt/agent-board`), the handoff path;
   - sub-agents' dev env: each worktree starts its own HA (`dev/ha.sh start`, `npm run build`, ports 8124+, ~270 MB each, `dev/ha.sh list`), how many in parallel (desktop 3–4, laptop 1–2), `dev/ha.sh stop` at the end; prompts say suites with `dev/ui_test.py`, hand checks with `dev/shot.py --js`, never the built-in pane; `dev/ha.sh start` registers the worktree on the board; the floorplan card is one 7,000-line file (disjoint work);
   - merging here: stop the sub-agent's HA **before** `gh pr merge` (`--delete-branch` removes its worktree and orphans its HA: `ss -ltnp | grep 812`), rebase rule from CLAUDE.md, CI = Build + Validate, releases only on the user's go (CLAUDE.md **Releases**); the main checkout's `/plooum-edit` goes stale when `plooum-test.yaml` changes (`dev/ha.sh reset` + `start`);
   - the review checklist's project items: the card outside the editor unchanged, the dashboard cards behind the editor dialog unaffected, edge cases (missing / unavailable entity, a camera with no picture, another floor, an empty plan), `shot.py` exit 0, `docs/<card>.md`, README.md + README.fr.md together, no bundle, no `CARD_VERSION` bump in a feature PR, branch without `tags/`, UI strings in English;
   - the project's skills table (`pilot-ha-plooum`, `pr-workflow`, `ha-dev-testing`, `floorplan-card`) and skill ideas (`vivarium-card`, `docs-readme`, `new-card`);
   - the handoff here: `.claude/pilot/` goes straight to `main` (CLAUDE.md exception), the detached-worktree fallback with `../HA-Plooum-Cards-pilot`, "Bypassed rule violations" expected;
   - test premises: check them against `dev/ha-config/dashboards/plooum-test.yaml` (both floors; prompt 10's wrong free side); a speed-up task: measure the split first (`dev/ui_test.py --verbose`, prompt 19).
2. **`.claude/skills/pr-workflow/SKILL.md`**: description "HA-Plooum-Cards specifics for a sub-agent delivering work. Load it together with the global `pilot-subagent` skill for any task given by the pilot." Keep only the specifics: worktree HA (`dev/ha.sh start` / `stop` / `setup`), no `tags/` in a branch, bundle never committed, no `CARD_VERSION` bump, code conventions from CLAUDE.md (English, README pair, `docs/<card>.md`, TODO.md left to the pilot), testing (`dev/ui_test.py`, `dev/shot.py`, never the pane, the board, `dev/shots/` for scratch files), laptop tools in `~/.local/bin`, CI = Build + Validate, the report's **Tested** section = the suite output and its path under `dev/tests/`, the suite committed with the PR. Drop the generic parts (git / sandbox / `pkill` / `Monitor` / be fast / PR / report format / Friction): one line "The branch, PR, report format and sandbox pitfalls are in the global `pilot-subagent` skill."
3. **CLAUDE.md**, section **Pilot mode**: the agent loads the global `pilot` skill (plooum/claude-pilot, `git clone https://github.com/plooum/claude-pilot ~/.local/opt/claude-pilot && ~/.local/opt/claude-pilot/install.sh` on a new machine) **and** `pilot-ha-plooum`, then reads the handoff. The project skills line lists `pilot-ha-plooum`, `pr-workflow`, `ha-dev-testing`, `floorplan-card`; sub-agents load `pr-workflow` with the global `pilot-subagent`.
4. No file outside `.claude/pilot/` mentions `.claude/skills/pilot/` afterwards: `grep -rn "skills/pilot/" --exclude-dir=node_modules --exclude-dir=.venv . | grep -v "^./.claude/pilot/"` empty (except `~/.claude/skills/pilot/...`, the global path).

## Checks (strict minimum)

The grep of step 4, and `wc -l` of the two rewritten skills (each should be well under its old length: 102 and 80 lines). Paste both.

## Delivery

Branch `feature/pilot-skills-split`, PR "Pilot skills: keep the HA-Plooum-Cards specifics, the generic workflow moves to plooum/claude-pilot". Open it, don't wait for CI, never merge. Report as `pr-workflow` says, with the list of what you kept in each skill.
