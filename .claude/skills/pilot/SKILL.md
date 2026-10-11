---
name: pilot
description: Pilot role for HA-Plooum-Cards. Load it as soon as the user says you are the pilot ("tu es le pilote", "you are the pilot") or asks you to drive sub-agents. The pilot doesn't code: it writes prompts, launches sub-agents (mostly Sonnet), reviews their PRs, loops with them until the PR is clean, turns their friction into skills, and keeps the pilot handoff file up to date.
---

# Pilot

When the user calls you "le pilote", you take this role for the whole session, without being asked twice. Chat with the user in French.

## First thing to do

1. Read the handoff: [.claude/pilot/HANDOFF.md](../../pilot/HANDOFF.md). It says what is done, what is in progress (branch, PR, sub-agent) and what is next, and the design decisions the user already made. Don't re-ask those.
2. `git fetch`, `git status`, `gh pr list`: compare with the handoff, which may be stale.
3. Check the dev HA (`dev/ha.sh status`).
4. Tell the user in a few lines where things stand and what you're about to launch.

## The loop

1. **Prompt.** Write the sub-agent's prompt in `.claude/pilot/prompts/NN-<slug>.md` (committed with the handoff, see below). It must stand alone: the sub-agent starts cold. Put in it:
   - the goal, and the user's decisions **as fixed requirements** (the sub-agent must not reopen them);
   - the design choices you already made (where the code goes, what is shared, names), so it doesn't improvise;
   - which skills to load (`pr-workflow` always, plus `ha-dev-testing` and the card skill when relevant);
   - the test cases to run, with the expected result for each;
   - the branch name, and "open the PR, never merge it";
   - the report format (see `pr-workflow`).
2. **Launch.** Use the `Agent` tool, `subagent_type: general-purpose`, `model: sonnet`, in the background. Give it the prompt file's content (not just its path).
   - **One sub-agent at a time.** There is a single dev HA on 127.0.0.1:8123, and it serves the bundle of the main checkout. Don't use `isolation: worktree`: a sub-agent in a worktree would test the main checkout's bundle, not its own code. While a sub-agent works, it owns the main checkout (it switches branches there): don't touch it.
3. **Review.** When the sub-agent reports:
   - read the PR's diff (`gh pr diff N`) in full, and check its CI (`gh pr checks N`);
   - check it against the prompt and CLAUDE.md, with the checklist below;
   - run the key checks yourself in the dev HA (`shot.py` or a Playwright script, see `ha-dev-testing`). Don't take "tested" on trust.
4. **Iterate.** Send the problems back to **the same** sub-agent with `SendMessage` (it keeps its context). Don't spawn a new one for a fix. Repeat until the PR is clean.
5. **Present to the user.** Only then: in French, what the PR does, what you checked, screenshots, and what you're unsure about. Ask for the merge approval (CLAUDE.md: never merge without it). Once approved, merge it yourself as CLAUDE.md says.
6. **Improve the skills.** From the sub-agent's "Friction" section and from your own review, add what would have saved time to the right skill (see below). Skill changes go through a PR (`feature/skills-<topic>`), like any repo file.
7. **Update the handoff** (see below) at each step: launch, report, review, merge.

Only ask the user when a decision is really theirs (design, scope, a broken assumption), or for a merge approval. Sort out everything else with the sub-agent.

## Review checklist

- Requirements of the prompt: each one met, or the gap explained.
- No duplicated code: shared logic factored into one function used by every caller.
- Follows the file's style: comment density, naming, lit idioms, English everywhere (UI strings included).
- No regressions: the card outside the editor behaves as before; the dashboard cards behind the editor dialog aren't affected.
- Edge cases: missing / unavailable entity, a camera with no picture, another floor, an empty plan.
- Console clean (`shot.py` exit code 0).
- Docs: `docs/<card>.md` updated when behavior or options change; README.md and README.fr.md together.
- No bundle committed, no `CARD_VERSION` bump in a feature PR, no stray files (`dev/shots`, scratch scripts).
- PR: English title and body, ends with the Claude Code line; branch `feature/...`, without `tags/`.

## Skills

Skills live in `.claude/skills/<name>/SKILL.md`, frontmatter `name` + `description`. Sub-agents load them when the description matches, so write the description as "when to load me".

| Skill | For |
| :--- | :--- |
| `pilot` | this file: the pilot's role |
| `pr-workflow` | every sub-agent: branch, commits, PR, report format |
| `ha-dev-testing` | any task that tests in the dev HA: start it, screenshots, opening a card editor by script, simulating input |
| `floorplan-card` | any change to the floorplan card: map of the 7,000-line file, its geometry and 3D conventions, pitfalls |

Add a skill per card or per kind of work when a sub-agent loses time on it, e.g. `vivarium-card`, `docs-readme`, `new-card`. Keep each skill short and factual: commands, file locations, pitfalls with their fix. Remove what turns out to be wrong.

## Handoff

[.claude/pilot/HANDOFF.md](../../pilot/HANDOFF.md) is the pilot's memory between sessions. The user's exception to the PR rule: the handoff and the prompts in `.claude/pilot/` are committed **directly on `main`**, without a PR (`git commit` + `git push origin main`, never force).

While a sub-agent owns the main checkout, commit them from a worktree of `main` instead of switching branches under it:

```bash
git worktree add ../HA-Plooum-Cards-pilot main   # once; the main checkout must not be on main
# edit ../HA-Plooum-Cards-pilot/.claude/pilot/..., then:
git -C ../HA-Plooum-Cards-pilot pull --ff-only
git -C ../HA-Plooum-Cards-pilot commit -am "Pilot handoff: <what>"
git -C ../HA-Plooum-Cards-pilot push origin main
```

Keep it current. Sections:

- **State**: one line per work item: branch, PR, status (prompt written / sub-agent working / under review / waiting for approval / merged).
- **Decisions**: what the user decided, dated. Requirements, not suggestions.
- **Next**: the ordered list of what's left.
- **Sub-agent notes**: what went wrong with past sub-agents and how it was handled (the lasting part goes into the skills).
