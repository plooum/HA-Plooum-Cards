# Prompt 05: a test view for every card, and one fast smoke suite

You work on HA-Plooum-Cards (a HACS bundle of Lovelace cards, see CLAUDE.md). Load the `pr-workflow` and `ha-dev-testing` skills first. You are in your own git worktree: start your own HA there (`dev/ha.sh start`, it picks a port from 8124, onboards a fresh instance seeded from the YAML dashboard), `npm run build` there, and `dev/ha.sh stop` when done. Run every tool from your worktree.

## Goal (decided by the user, don't reopen)

1. **A view per card** in `dev/ha-config/dashboards/plooum-test.yaml`, as the base for the tests to come. Five cards lack one: dpad, cover, gridicons, tabbed, button-badge (they only appear in the `all` view).
2. **Tests for all nine cards, simple and fast.** The user finds tests long: the whole suite must run in **under 20 s** alone. Smoke tests, not exhaustive ones. No test in the HA Android app.

You don't change any card under `src/`. If a test reveals a card bug, don't fix it: report it (Open questions).

## Design (fixed)

### Views

- Paths = folder slugs, as the file header says: `dpad`, `cover`, `gridicons`, `tabbed`, `button-badge`. Insert them in the file next to the existing per-card views, same style (title, path, a short comment line).
- Each view holds a few cards wired to the test entities of CLAUDE.md's table, covering the states that matter for that card: on, off, `unavailable` (`switch.tv_plug` via `input_boolean.tv_plug_available`), missing entity (`switch.does_not_exist`), and the card's main options. Keep each view small (2–4 cards): it's a base, later tests add regression cases. Give each card a distinct `title` / `name` when the card has one, so a test can find it.
  - dpad: the press / script config of the `all` view, plus one with a missing entity.
  - cover: the two covers, one card with `lock_enabled: true`.
  - gridicons: on / off / unavailable / missing icons.
  - tabbed: the two-tab card of `all`.
  - button-badge: the `all` card, and one whose main entity is missing.
- Don't touch the existing views (other tests and suites rely on them).

### The suite

- **One file**: `dev/tests/cards-smoke.json`, **one test per card** (nine tests), each on its card's view (`"path": "/plooum-test/<view>"`, the YAML dashboard, not `/plooum-edit`). Names: `"<view>: renders, reacts, editor"`.
- Each test, in a few steps:
  1. **Renders**: every card of the view exists, has rendered content in its shadow root, and there is no `hui-error-card` on the page.
  2. **Reacts** (one check, the card's main behavior): either a click that calls a service, checked on the backing entity / counter through `hass.states` (dpad: a press increments `counter.ptz_presses`; gridicons / button-badge: a toggle flips `light.living_room_light`; cover: a button moves a cover's position), or, for a display card (multistatus, temp-humidity, vivarium, floorplan, tabbed), a state change made through `hass.callService` that the card shows (an `input_number` value appears, an icon changes, a tab click shows the other tab). Wait with `waitFor`, never fixed waits. **Leave the state as you found it** (toggle back, restore the value), so reruns and the other suites see the same start.
  3. **Editor renders**: without opening the edit dialog (slow): `const ed = await customElements.get('<tag>').getConfigElement(); ed.hass = hass; ed.setConfig(card.config); document.body.append(ed); await ed.updateComplete;` then assert it rendered something, and remove it. Use the config of a card on the page.
- Helpers: add a small `T.card` namespace to `dev/ui_helpers.js` only for what several tests share (e.g. `T.hass()`, `T.card.all(tag)`, `T.card.editorRenders(card)`, `T.card.waitState(entity, predicate)`, `T.card.call(domain, service, data)`). No copy-pasted JS across tests. Keep it short.
- Floorplan: its view is heavy (3D, cameras); test only what's quick: the cards render, and the editor of the plan card renders. If the view alone makes the suite miss the 20 s budget, say so in the report with the timings.
- Run it: `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json`. All PASS, exit code 0. Run it twice in a row: the second run must pass too (state restored).
- Add one line for the suite to CLAUDE.md's **UI test suites** paragraph (the command, and that it's the smoke suite to run after any card change), and to the `ha-dev-testing` skill if a helper deserves a mention.

## Delivery

Branch `feature/card-smoke-tests`, PR titled "A test view per card and a fast smoke suite for all nine cards". One PR for both (the views exist for the tests). Open the PR, check CI, never merge. Report as `pr-workflow` says, with the suite's full output and its total time.

Screenshots: 1. `dev/shots/smoke-gridicons.png`: the new `/plooum-test/gridicons` view, full page (on / off / unavailable / missing); 2. `dev/shots/smoke-cover.png`: the new `/plooum-test/cover` view.
