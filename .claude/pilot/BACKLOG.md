# Backlog

What is left to do, kept by the pilot (user's request, 2026-10-11). Committed straight to `main` with the handoff, no PR. The handoff's **State** tracks work in progress; this file lists what hasn't started. When an item starts, move it to the handoff's State; when it's merged, delete it here.

[TODO.md](../../TODO.md) stays the repo's list of out-of-scope issues noticed while working (changed through PRs); its items are mirrored here so this file is the one complete inventory.

_Last update: 2026-10-11, end of pilot session 3 (V1.3.2 released)._

## Waiting on the user

Nothing.

## Next

- [ ] **Agent board: bigger browser previews** (user, 2026-10-12): the Browser panel's live frame (and the test thumbnails) are too small; enlarge them (e.g. the frame at the detail column's full width, thumbnails larger / a hover preview). Small `tools/agent-board/index.html` PR.

- [ ] **Agent board: the page keeps "reloading"** (user, 2026-10-12: very unpleasant). Cause (pilot): every SSE event re-renders the agent list / detail / Tests tab with `innerHTML` (index.html `render`, `renderDetail`, `refresh` ~l.112-240), and each frame rebuilds the Browser panel (`refreshBrowser`), so the image reloads from blank (flicker), open `<details>` / scroll / selection can jump. Fix: update in place — swap the frame's `img.src` only after the next image has loaded (preload), patch only the changed rows (agent row, current test row, new timeline line), keep scroll and open state; no full re-render on frame / action events. **Same PR as the bigger previews** (same file).

- [ ] **Roof layer checks**: touch input, narrow edit dialog, a plan generated from areas (not tested by prompt 09).

## Dropped (user, 2026-10-11)

- Android test of the floorplan setup view: not needed.
- Fisheye lenses / any more complex camera handling: never.
- `feature/dpad-keyboard`: deleted.
