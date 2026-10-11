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
   - test cases built on the test plan's geometry (a free side, a covered strip...): **check them against the plan first** (`dev/ha-config/dashboards/plooum-test.yaml`, both floors' rooms); prompt 10 assumed a free side that was the ground floor's own wing.
   - the test cases as a **suite to write** under `dev/tests/<feature>.json` (file name, test names, what each one asserts), run with `dev/ui_test.py` (see `ha-dev-testing`);
   - the branch name, and "open the PR, never merge it";
   - the report format (see `pr-workflow`).
   - that it **stops** when it needs an answer: the question goes in its report's Open questions and it ends its turn; it never waits, polls or works around it (user, 2026-10-11: saves tokens). You answer later with `SendMessage`, which resumes it with its context.
   - the screenshots, **only when the change is visual** (0 to 2), named after what they must show; none for geometry or logic a suite asserts.
   - **Speed** (user, 2026-10-11: the loop felt long). Prompts are **short and exact**: the functions and approximate lines to touch, the file sections to read (never "read the card"), the test cases with their **premises checked against the test plan**, and the suites to run at the end (the new one, plus `cards-smoke`; the other floorplan suites only when the change can break them). Small fixes (one function, one test) say "fast path" (see `pr-workflow`).
   - **Renders for a user decision: the fewest that show the choice**, one per option from one viewpoint (2026-10-11: the user wanted 5 renders, not a 30-shot grid; it took 10 minutes). Add viewpoints or states only when the user asks.
   - **This machine's RAM** (see the handoff's Machines): on the 7 GB laptop, one or two sub-agents at a time.
2. **Launch.** Use the `Agent` tool, `subagent_type: general-purpose`, `model: sonnet`, in the background. Give it the prompt file's content (not just its path).
   - **Several sub-agents in parallel**, each launched with `isolation: "worktree"`. Each starts its own HA from its worktree (`dev/ha.sh start`, then `npm run build` there): own port (8124, 8125, ...), own token, own bundle, `node_modules` and venv linked from the main checkout (see `ha-dev-testing`). Tell it so in the prompt, and to `dev/ha.sh stop` when done. **The user always wants to be able to watch the sub-agents** (2026-10-11): every prompt says to run the suites and the hand checks in the sub-agent's own pane tab (`runner.html`, see `ha-dev-testing`), headless only for screenshots. A sub-agent opens only its own tab; you open one per instance only for one that has no browser tools.
   - **How many**: one HA instance takes ~270 MB, a headless Chrome suite some hundreds of MB more, and CPU is the real limit (8 cores): a suite takes 28 s alone and ~60 s with three at once. Three or four in parallel is comfortable on this machine (31 GB RAM); more just makes every suite slower. `dev/ha.sh list` shows what is running.
   - **Disjoint work.** Parallel PRs touching the same file conflict (the floorplan card is one 7,000-line file): give them disjoint files or features, or run them one after the other. Rebase the later one on `main` after the earlier merge.
   - You stay on `main` in the main checkout (HA on 8123): handoff commits are plain `git commit` + `git push origin main` there, and you review in it. Don't switch its branch.
3. **Review.** When the sub-agent reports:
   - look at its screenshots first, if any;
   - read the PR's diff (`gh pr diff N`) in full, and check its CI (`gh pr checks N`);
   - check it against the prompt and CLAUDE.md, with the checklist below;
   - re-run the sub-agent's new suite **once**, live in your pane tab (`runner.html`, `pause=0`) so the user sees it; add a test for anything you suspect. Don't take "tested" on trust, but don't re-run what CI or the sub-agent's final run already covers either.
4. **Iterate.** Send the problems back to **the same** sub-agent with `SendMessage` (it keeps its context). Don't spawn a new one for a fix. Repeat until the PR is clean. **Keep the sub-agent** (its context, worktree and HA) until the user has validated its work: through every round trip, and until the merge is approved, in case of changes (user, 2026-10-11).
5. **Present to the user.** Only then: in French, what the PR does, what you checked, screenshots, and what you're unsure about. Ask for the merge approval (CLAUDE.md: never merge without it). Once approved, merge it yourself as CLAUDE.md says.
6. **Improve the skills, right away.** As soon as a review is done (the user insists: never wait, never batch it for later, never ask first), open the skills PR yourself: from the sub-agent's "Friction" section and from your own review, add what would have saved time to the right skill (see below). Skill changes go through a PR (`feature/skills-<topic>`), like any repo file; present it to the user together with the reviewed PR. A friction that needs a code change (a dev tool flag, a helper) goes in BACKLOG.md instead.
7. **After the merge is approved**: in the sub-agent's worktree `dev/ha.sh stop` **before** `gh pr merge` (its `--delete-branch` also removes the local worktree when the branch is checked out there, leaving its HA running orphaned: then find it with `ss -ltnp | grep 812` and kill it), then `git worktree remove <path>` and delete its local branch. Check `dev/ha.sh list` shows no leftover instance. **No stale branches**: GitHub deletes a merged PR's branch (repo setting "Automatically delete head branches", on since 2026-10-11) and `fetch.prune` is on in the main checkout, so `git fetch` drops its `origin/...` ref. Check that `git branch -a` lists only `main` and the branches of open PRs; delete any other local branch (ask the user before deleting one you didn't create).
8. **Update the handoff** (see below) at launch, after the review and after the merge: one commit each, not one per small step (each push to `main` is one more thing to rebase on).
9. **Merging fast**: once approved, stop the sub-agent's HA, then for the feature PR and its skills PR: rebase only if `main` moved outside `.claude/pilot/` (CLAUDE.md), wait with `gh pr checks <N> --watch` (no `sleep` before it beyond the few seconds CI needs to register), merge, next. Note each sub-agent's duration and tool calls in the handoff to see whether the loop gets faster.
10. **Measure every sub-agent** (user, 2026-10-11: find what takes time, keep improving): when it reports, run `python3 .claude/skills/pilot/agent_timing.py <its task output file>` (the transcript the Agent tool names; never read it directly, it's huge). It prints wall / model / tools time, tools by category, errors and the slowest calls. Put the totals in the handoff's sub-agent notes; turn what cost time (refusals, repeated runs, waits) into a prompt or skill fix. While a sub-agent runs, watch its worktree in the background (`git diff --shortstat`, the PR's appearance) and steer it with `SendMessage` if it drifts (headless instead of the pane, waiting on CI, retrying refused commands).

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

Normally you are on `main` in the main checkout and commit them there. **Fallback**, only if a sub-agent works in the main checkout (no worktree) and you can't switch branches under it, commit them from a **detached** worktree of `origin/main` (a worktree on `main` itself fails when the main checkout is on `main`):

```bash
git worktree add --detach ../HA-Plooum-Cards-pilot origin/main   # once
git -C ../HA-Plooum-Cards-pilot fetch -q
git -C ../HA-Plooum-Cards-pilot checkout -q --detach origin/main  # before each edit
# edit ../HA-Plooum-Cards-pilot/.claude/pilot/..., then:
git -C ../HA-Plooum-Cards-pilot commit -am "Pilot handoff: <what>"
git -C ../HA-Plooum-Cards-pilot push origin HEAD:main
```

The push lists "Bypassed rule violations" (pull request required): expected, the user allows it for `.claude/pilot/`. Before merging a PR, rebase it on `origin/main` if the handoff moved `main` (CLAUDE.md).

Keep it current. Sections:

- **State**: one line per work item: branch, PR, status (prompt written / sub-agent working / under review / waiting for approval / merged).
- **Decisions**: what the user decided, dated. Requirements, not suggestions.
- **Next**: the ordered list of what's left.
- **Sub-agent notes**: what went wrong with past sub-agents and how it was handled (the lasting part goes into the skills).
