---
name: ha-dev-testing
description: Testing HA-Plooum-Cards in the local dev Home Assistant - starting it, screenshots, console errors, opening a card's editor dialog by script, selecting things in an editor, driving the preview card, changing entity states. Load it for any task that checks a card or an editor in the browser.
---

# Testing in the dev Home Assistant

CLAUDE.md's **Testing** section is the reference (start / stop, dashboards, test entities, `dev/api.sh`). This skill adds what it doesn't say, learned the hard way.

## Before anything

- `dev/ha.sh status`; `dev/ha.sh start` if it isn't running (~10 s, longer the first time).
- `npm run build` after every change under `src/`, then reload the page. No HA restart needed (only after `configuration.yaml` changes).
- **The dev HA serves the bundle of the main checkout** (`/home/doudou/git/HA-Plooum-Cards/ha-plooum-cards.js`). Work and build there. From a git worktree, your build isn't the one served.
- Only one agent tests at a time: the dev HA and the main checkout are shared.

## Which browser

- The built-in browser pane (`mcp__Claude_Browser__*`) is for the user to watch. It's often only ~800 px wide: too small for the card editor dialog, and a custom `resize_window` gets reset when the pane's width changes.
- For scripted checks and screenshots, use headless Chrome:
  - `dev/shot.py` for a page or a card (exit code 1 on console errors);
  - [editor_shot.py](editor_shot.py) (in this skill's folder) for anything in the **editor dialog**: it opens the editor, runs JS steps, takes page or element screenshots. Read its docstring.
- Phone layout: `--width 420 --height 900`. HA then **hides the editor dialog's preview** entirely.

## The editor dialog, by script

- Card editors only open on the storage dashboard: `/plooum-edit/<view>?edit=1`. The edit button's label is `Edit` with the `en-US` locale of the scripts, `Modifier` in the user's French pane.
- `/plooum-edit/floorplan` is a panel view holding **one vertical stack**: the dialog shows the stack editor with tabs 1..6. Pick a card: `stack = hui-stack-card-editor; stack._selectedCard = i; stack.requestUpdate()`. Card 3 (index 2) is "Home in 3D".
- The dialog's preview shows **the whole stack**: the card you edit may be off screen. Scroll it with `scrollIntoView()`.
- In a page where the dialog is open, the dashboard cards behind it also exist, with the same config. To find the preview's card, search from `hui-dialog-edit-card`'s shadow root (`previewCard(title)` in editor_shot.py). **`card.preview` doesn't tell them apart**: in edit mode the dashboard cards have `preview === true` too.
- Shadow DOM: `querySelector` doesn't cross shadow roots, and neither does a descendant selector inside `deep()`. Walk the roots (`deep(root, sel)`), or go up the composed tree with `node.parentNode || node.host`.
- You can drive lit components through their reactive properties, e.g. the floorplan editor: `ed._selection = { kind: 'entity', index }`, `ed._cameraAdvanced = true`. Lit re-renders on its own.
- To simulate a user action that emits `config-changed`, prefer calling the real handler, or dispatching the real DOM event, over setting the config: the point is to test the event path.
- Native `<input type="color">`: set `.value` and dispatch an `input` event.

## Checking

- Console errors: `dev/shot.py` / `editor_shot.py` exit code. The pane's console buffer keeps old messages (websocket failures from an HA restart): don't trust it for a clean check.
- A card that fails `setConfig` is an invisible `hui-error-card` outside edit mode: look for it in the DOM.
- Actions: check the backing entity or counter with `dev/api.sh GET states/<entity>`.
- Give screenshot paths in your report. Keep them in `dev/shots/` (gitignored), never commit them.
