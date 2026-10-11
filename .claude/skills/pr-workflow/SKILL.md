---
name: pr-workflow
description: How a sub-agent delivers work on HA-Plooum-Cards - feature branch, commits, pull request, and the report it gives back to the pilot. Load it for any development task given by the pilot.
---

# Delivering a change (sub-agent)

You were given a task by the pilot, an agent who reviews your work and loops with you. You deliver a **branch and an open PR**, never a merge.

## Branch and commits

- You may be in a git worktree of your own (launched with `isolation: "worktree"`): there, `dev/ha.sh start` gives you your own HA on its own port (8124+) serving your bundle; `dev/ha.sh stop` when you're done (see `ha-dev-testing`). In a worktree, create the branch off `origin/main` (`git fetch`, `git checkout -b feature/<name> origin/main`): `main` itself is checked out in the main checkout. Such a branch tracks `origin/main` until your first `git push -u origin feature/<name>`: always push with `-u`.
- Start from an up-to-date `main`: `git checkout main`, `git fetch`, `git pull --ff-only`, then `git checkout -b feature/<name>` (the name the prompt gives).
- Never `tags/` in a branch name: HACS strips it from download URLs and its validation fails.
- Never commit on `main`, never merge, never force-push anything but your own feature branch.
- The bundle (`ha-plooum-cards.js`, `.map`) is gitignored: run `npm run build` to test, never commit it. Don't commit screenshots or scratch scripts either: keep them in `dev/shots/` (gitignored) or a scratch directory.
- Don't bump `CARD_VERSION`: that's a separate PR.
- Commit messages: English, imperative subject, end with the attribution line from your system prompt (`Co-Authored-By: ...`).
- Run git steps as separate commands rather than one long `&&` chain. In a worktree the sandbox refuses "too complex" commands outright: brace expansion, and `git` mixed with `&&`, `;`, a heredoc or `python3 -`. Run plain separate commands, and write multi-line scripts or file edits with the Write / Edit tools. The refusal also hits a `python3` call on a path containing `git` when chained, and `git` / `gh` / `sed` with shell variables.
- `node`, `npm`, `gh` or `uv` not found: on the laptop they live in `~/.local/bin` (`export PATH=~/.local/bin:$PATH`, or the full path).

## Code conventions (from CLAUDE.md)

- English everywhere: UI strings, comments, identifiers.
- Match the file's style: comment density, naming, lit idioms. Read the code around your change before writing.
- Don't duplicate logic: factor it into one function used by every caller.
- README.md and README.fr.md change together. Behavior or options of a card → its `docs/<card>.md`.
- Out-of-scope issues: mention them in your report, don't fix them and don't edit TODO.md (the pilot decides).

## Testing

The user watches: run your suites and hand checks **in your own tab of the built-in browser pane** (`runner.html`, see `ha-dev-testing`), headless only for screenshots and a final re-run.

**Be fast** (the user finds the loop long):
- Read only the sections the prompt names (grep, then read around); don't read a 7,000-line file or a whole skill you don't need.
- While you work, run only the test you're on (`&only=<name>` in the pane, `--only` headless); run the full suites the prompt lists **once**, at the end, with `pause=0`.
- One `npm run build` per change you want to see, then a page reload; no HA restart unless `configuration.yaml` changed.
- Screenshots only if the prompt asks for them; one try per shot: check the viewpoint on a first shot before a series.
- **Fast path** (the prompt says so: a one-function fix): no screenshots, the new test plus `cards-smoke`, a 5-line report.

## Pull request

```bash
git push -u origin feature/<name>
gh pr create --base main --title "<English title>" --body-file <scratchpad>/pr-body.md   # write the body with Write first
gh pr checks <N> --watch      # Build and Validate must pass
```

In a worktree the sandbox refuses a long inline `--body "..."` as too complex: use `--body-file`. Right after a push, `gh pr checks --watch` may still list the previous commit's runs: run it again until it shows the new ones (`gh pr view <N> --json headRefOid,statusCheckRollup`). Don't `sleep` to wait: the harness blocks it; `--watch` waits for you.

The body: what changed and why, how it was tested, what wasn't tested. It ends with the line from your system prompt (`🤖 Generated with [Claude Code](https://claude.com/claude-code)`).

## Report to the pilot

End your work with this report, and nothing else around it:

```
## Report
Branch / PR: feature/<name>, #<N> (CI: pass | fail: <which>)
Done: <bullets: what changed, which functions/files>
Deviations from the prompt: <each one, with the reason; "none" otherwise>
Tested: <the suite's output pasted in full (PASS / FAIL lines, total time) and its path under dev/tests/; then what the suite doesn't cover and what you checked by hand>
Screenshots: <PNG paths in dev/shots/ when the prompt asks for them, see below>
Not tested: <and why>
Open questions: <decisions you need from the pilot> (when you need one to go on, stop there: report and end your turn; the pilot resumes you with the answer. Never wait or poll.)
Friction: <what made you lose time: a command that failed, something hard to find, a wrong assumption in the prompt or a skill, and how you got past it>
```

**Tests are a suite**: write the prompt's test cases as `dev/tests/<feature>.json` and run `dev/ui_test.py` (see `ha-dev-testing`); the pilot re-runs it. The **Tested** section is its output, not a narrative of what you clicked. The suite is committed with the PR.

**Screenshots when the prompt asks for them** (a visual change): those it names, otherwise the main state and the most important other one (e.g. wide and narrow layout, before and after an action). Full page or cropped to the card, in `dev/shots/`, never committed. The pilot looks at them first to check your work.

The **Friction** section matters: the pilot turns it into skills so the next sub-agent doesn't lose the same time. Be concrete ("`deep()` selector with a descendant combinator doesn't cross shadow roots: walk with `.shadowRoot`"), not vague.

When the pilot sends you review comments, fix them on the same branch, push, and give a new report (only what changed).
