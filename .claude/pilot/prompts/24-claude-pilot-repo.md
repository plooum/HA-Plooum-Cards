# Prompt 24: plooum/claude-pilot, the generic pilot workflow

You work in **`/home/doudou/git/claude-pilot`**, a clone of the new public repo **https://github.com/plooum/claude-pilot** (one commit: LICENSE GPL-3.0 + README stub). `cd` there, `git pull --ff-only`, branch `feature/initial-content`. Not HA-Plooum-Cards: its rules don't apply, except: English everywhere, commits ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, PR body ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. `~/.local/bin/gh` by full path if needed. No browser. A question → stop and report it.

## Goal (user, 2026-10-12)

The **pilot workflow** that lives today in HA-Plooum-Cards (its `pilot` and `pr-workflow` skills) leaves for this repo, made **generic**, so the user can tell a new project's agent: "you are the pilot of this project, follow https://github.com/plooum/claude-pilot" and it sets itself up from the repo. The project-specific parts stay in each project (a sibling sub-agent trims HA-Plooum-Cards in parallel; you only write this repo). It pairs with **plooum/agent-board** (https://github.com/plooum/agent-board: live board of the sub-agents, its own `AGENTS.md` / `install.sh` / global skill `agent-board`): recommended, never required.

## Sources (read them in full, read-only)

- `/home/doudou/git/HA-Plooum-Cards/HA-Plooum-Cards/.claude/skills/pilot/SKILL.md` (102 lines) and `agent_timing.py` next to it.
- `/home/doudou/git/HA-Plooum-Cards/HA-Plooum-Cards/.claude/skills/pr-workflow/SKILL.md` (80 lines).
- The section list of `/home/doudou/git/HA-Plooum-Cards/HA-Plooum-Cards/.claude/pilot/HANDOFF.md` and `BACKLOG.md` (headings and a few lines, for the templates).
- `~/.local/opt/agent-board/install.sh` (your model for `install.sh`) and `~/.local/opt/agent-board/AGENTS.md` (your model for `AGENTS.md`).

## The split (fixed)

**Generic → this repo**, rewritten without any HA / HACS / card / `dev/ha.sh` / `CARD_VERSION` / port / laptop detail:
- Pilot: taking the role on "you are the pilot" / "tu es le pilote"; chat with the user in **their** language; first steps (read the handoff, `git fetch` / `git status` / `gh pr list` against it, check the project's dev env as its pilot skill says, the board if installed, tell the user where things stand); the whole loop (prompt: standalone, decisions as fixed requirements, design choices made, skills to load, premises checked against the project, tests at the **strict minimum** defined in the prompt, branch name, report format, **stop when it needs an answer**, screenshots only for visual changes, renders for a decision = the fewest, short exact prompts / fast path, machine RAM from the handoff; launch: Agent tool, Sonnet, background, prompt content not its path, worktree isolation for parallel work, disjoint files, the pilot stays on `main` in the main checkout; a sub-agent working in **another repo** runs without worktree isolation in that repo's clone; review: screenshots first, full diff, CI, checklist, **don't re-run its tests**, show the user the result; iterate with `SendMessage` to the same sub-agent and **keep it until the user approved the merge**; present to the user and **never merge without approval**; **skills PR right after each review, never batched**; after merge: clean worktrees, no stale branches; update the handoff at launch / review / merge, one commit each; merging fast (rebase only if `main` moved outside the pilot files, `gh pr checks --watch`); **measure every sub-agent** with `agent_timing.py` and steer it while it runs; ask the user only for their decisions and merge approvals.
- The review checklist's generic items (requirements met, no duplication, file style, no regressions, edge cases, console / logs clean, docs updated, no build output / stray files committed, PR title / body / attribution) + "and the project's own checklist (its pilot skill)".
- Skills: where they live, description = "when to load me", one per kind of work when a sub-agent loses time, short and factual; a project has its own **`pilot-<project>`** skill for its specifics.
- Handoff: `.claude/pilot/HANDOFF.md`, `BACKLOG.md`, `prompts/NN-<slug>.md`; sections (Machines, State, Decisions dated, Next, Sub-agent notes); committed straight to `main` **only if the project's CLAUDE.md allows it** (otherwise through PRs), with the detached-worktree fallback (paths generic).
- Agent board: if the `agent-board` skill is installed, follow it (register / archive / statuses); if not, suggest https://github.com/plooum/agent-board once.
- Sub-agent side (from `pr-workflow`): branch off an up-to-date `main` / `origin/main` in a worktree, push `-u`, never commit on `main` / merge / force-push others' branches, commit message rules, sandbox refusals in worktrees (compound commands, heredocs, paths outside the worktree, `--body-file`), `pkill -f` matching its own shell, `Monitor` instead of polling, no `sleep`, be fast (read only named sections, `--only` while working, full suites once, no CI wait, fast path), the PR, the **report format** (keep it exactly), Friction matters, review rounds on the same branch.

**Project-specific → stays in each project** (don't copy): anything about HA, HACS, cards, `dev/`, `npm run build`, `CARD_VERSION`, README.fr, ports 8123+, `ha.sh`, the laptop / desktop, dated decisions about HA-Plooum-Cards features.

## Files (fixed)

- `skills/pilot/SKILL.md` (frontmatter `name: pilot`, description: load when the user says you are the pilot / asks you to drive sub-agents; also tells to load the project's `pilot-<project>` skill when there is one) and `skills/pilot/agent_timing.py` (copied unchanged; the skill calls it as `~/.claude/skills/pilot/agent_timing.py`).
- `skills/pilot-subagent/SKILL.md` (`name: pilot-subagent`, description: load for any task given by a pilot; the project's own delivery skill adds its specifics).
- `templates/`: `HANDOFF.md`, `BACKLOG.md`, `prompt.md` (the prompt skeleton: header, goal, design (fixed), checks (strict minimum), delivery), `CLAUDE-pilot-section.md` (the "Pilot mode" + "Git workflow" lines a project adds to its CLAUDE.md, including the optional pilot-files-on-`main` exception), `pilot-project-skill.md` (skeleton of `pilot-<project>`: dev env start / stop, merge steps, release rules, review checklist additions, machines).
- `install.sh`: idempotent, like agent-board's: target `CLAUDE_PILOT_HOME` (default `~/.local/opt/claude-pilot`) clone or `pull --ff-only`; symlink `~/.claude/skills/pilot` → `<home>/skills/pilot` and `~/.claude/skills/pilot-subagent` → `<home>/skills/pilot-subagent` (something else there → leave it, warn); one line per step. No hook, no settings change.
- `AGENTS.md`: for an agent told "you are the pilot of this project, follow <this repo>": 1. install (`git clone https://github.com/plooum/claude-pilot ~/.local/opt/claude-pilot && ~/.local/opt/claude-pilot/install.sh`; a new session may be needed to see the skills); 2. agent board: recommended, follow https://github.com/plooum/agent-board's AGENTS.md (ask the user); 3. if the project has no `.claude/pilot/` yet: set it up from `templates/` (handoff, backlog, prompts dir, the CLAUDE.md section, a `pilot-<project>` skill, a delivery / testing skill for its sub-agents), **ask the user** the decisions it needs (may pilot files go straight on `main`? which language? which model for sub-agents?), and commit it the way the project allows; 4. load `pilot` (and `pilot-<project>`) and start the loop.
- `README.md`: what it is (humans), install, how to start a pilot in a project, link to agent-board, "AI agent asked to be the pilot: read [AGENTS.md](AGENTS.md)" as the first line after the title.
- `.gitignore`: `.scratch/`.

## Checks (strict minimum)

1. `grep -rniE "plooum-cards|home assistant|hacs|card_version|ha\.sh|lovelace|8123|floorplan" skills templates AGENTS.md README.md`: empty (agent-board / claude-pilot URLs are fine).
2. `install.sh` with a fake HOME in `.scratch/` (`HOME=<scratch>/home CLAUDE_PILOT_HOME=<scratch>/home/.local/opt/claude-pilot ./install.sh`), twice: links created, then "already there". It clones `main`, which doesn't have the skills yet: point the clone at your branch for this check with `CLAUDE_PILOT_REF=<branch>` (support that variable: `git clone -b`), and say so in the README for testers.
3. `python3 skills/pilot/agent_timing.py --help` or on no args: runs.

## Delivery

PR "Generic pilot workflow: skills, templates, AGENTS.md, install.sh" on plooum/claude-pilot. Open it, never merge. Report: the file list with one line each, what you left out as project-specific (list), the checks' output, open questions, friction.
