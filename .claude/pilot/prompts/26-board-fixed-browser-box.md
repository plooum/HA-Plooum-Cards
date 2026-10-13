# 26 — agent-board: browser box always shown, fixed small size

Repo: `~/git/agent-board` (plooum/agent-board). Work in that clone, no worktree. Load the `pilot-subagent` skill. **Fast path**: one small change, no suite.

## Goal (user's decisions, fixed)

In an agent's detail panel (`index.html`), the live browser box must:
1. **Always be shown** for the selected agent, even when it has no browser / no frame yet: an empty box with a dim centred "No browser" text, badge empty.
2. Have a **fixed size**, the same whatever the window size: **480 × 300 px** (16:10). It's only for monitoring work in progress, not for interacting.

## Where

- CSS `.browser` (~line 75): replace `width: min(100%, calc(70vh * 1.6))` with a fixed `width: 480px; height: 300px` (drop `aspect-ratio`), keep `flex: none` / no shrink. Add a style for the placeholder text.
- `updateBrowser()` (~line 246) and `loadDetail`'s frame probe (~line 277): today the box is only filled when `frames[id]` exists. Build the `<h3>Browser</h3>` + badge + `.browser` box whenever `state.detailFor === id`; when there is no frame, show the "No browser" placeholder instead of the `<img>`; when the first frame arrives, the image replaces it (keep the off-screen decode swap: never a blank frame).
- Nothing else changes (no server change).

## Test (only this)

Run `python3 board.py serve --port 8121` from the clone in the background (same default data dir, read-only use) and **leave it running**: the pilot will look at it. With `curl -s localhost:8121/ | grep -c 'No browser'` ≥ 1 as the sanity check. No screenshot.

## Deliver

Branch `feature/fixed-browser-box`, one commit, PR on plooum/agent-board, **never merge**. Report per `pilot-subagent` (short). If you need an answer, stop and put it in Open questions.
