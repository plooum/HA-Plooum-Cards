# Prompt 18: agent board page — no more "reloading", bigger browser previews

You work on HA-Plooum-Cards (see CLAUDE.md). Load `pr-workflow`. Only `tools/agent-board/index.html` changes (and README if a line there becomes wrong). No HA needed. `~/.local/bin/gh` by full path if `gh` isn't found. **Never the built-in browser pane.** **Be fast**: read `index.html` (≈250 lines) and only the SSE / API parts of `board.py` you need. A question → stop and report it.

## Problems (user, fixed requirements)

1. **The page keeps "reloading"**, which is very unpleasant. Cause: every SSE event re-renders the agent list, the detail and the Tests tab with `innerHTML` (`render`, `renderAgents`, `renderDetail`, `renderTests`, `refresh` / `later`), and each frame message rebuilds the Browser panel (`refreshBrowser` → `browserHtml`), so the image restarts from blank (flicker), and open `<details>`, scroll position and hover state can jump.
2. **The browser previews are too small**: the Browser panel's live frame and the test thumbnails.

## Fix (fixed design, don't reopen)

- **Update in place, never rebuild what didn't change.**
  - Frames: one persistent `<img>` in the Browser panel; on a frame message, load the new URL into an off-screen `Image()` and swap `img.src` only once it has loaded (no blank frame); update only the badge text. Never re-render anything else on a frame message.
  - Agent list: keep one row element per agent (keyed by id), update its text / classes only when its data changed; add / move rows as needed.
  - Detail: build the skeleton once per selected agent; on events, append new timeline lines, update the current test row / add finished test rows, update header fields. Keep the scroll position and every `<details>` open state.
  - Tests tab: refresh only when a run starts or ends, and keep the expanded runs open.
- **Bigger previews**: the live frame takes the full width of the detail column (keep its aspect ratio, max height ~70vh); test thumbnails ~160 px wide; hovering a thumbnail shows a larger preview (~480 px), click still opens it full size.
- Keep the dark default, the light toggle, the narrow layout (< 900 px) and the SSE reconnection.

## Checks (strict minimum)

Your own board: `python3 tools/agent-board/board.py serve --port 8121 --data dev/shots/board` (background; stop it by pid at the end — `pkill -f` kills your own shell). A small scratch Playwright script in `dev/shots/` (system Chrome, `channel="chrome"`, like `dev/shot.py`) that:
1. registers an agent and posts frames (any two JPEGs, e.g. screenshots of the board itself) at ~4/s for 3 s plus a fake run (`run-start`, 5 × `test-start`/`test-end`, `run-end`) and a few `action` events;
2. meanwhile records, in the page: how many times the Browser `<img>` element and the agent row element are **replaced** (a `MutationObserver` on the detail / list; expected 0 replacements of those elements), and that a `<details>` opened before the events is still open after;
3. takes `dev/shots/board-big-preview.png` (1400×900, dark: the agent with the big frame and the run with thumbnails) and `dev/shots/board-hover.png` (a thumbnail hovered).

## Delivery

Branch `feature/board-page-updates`, PR "Agent board: update the page in place, bigger browser previews". Open it, don't wait for CI, never merge. Report as `pr-workflow` says, with the two screenshots and the replacement counts.
