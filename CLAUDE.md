# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install     # install dependencies
npm run build   # rollup -c — regenerates ha-plooum-cards.js and its sourcemap at the repo root
```

`compil.sh` runs both of the above in sequence. There is no lint or unit-test setup; cards are tested in a local Home Assistant — see **Testing** below.

After any change under `src/`, run `npm run build` — the compiled bundle (`ha-plooum-cards.js` / `.js.map`) is committed to the repo and must stay in sync with the source.

## Architecture

This is a single HACS (Home Assistant Community Store) Lovelace plugin that bundles several independent custom cards into one JS file.

- **Single entry point**: [src/index.js](src/index.js) imports every card module so they register themselves. Rollup ([rollup.config.mjs](rollup.config.mjs)) bundles this into one IIFE file, `ha-plooum-cards.js`, which is the one resource HACS/Home Assistant loads (declared in [hacs.json](hacs.json)).
- **Each card is fully self-contained** in `src/cards/<card-name>/`, as a single `.js` file built with `lit` (`LitElement`, `html`, `css`). A card file defines, in order:
  1. The card class (`static getConfigElement()`, `static getStubConfig()`, `setConfig()`, `render()`, `static get styles()`).
  2. A paired editor class (`<Card>Editor`) implementing the visual config UI (`setConfig()`, `_valueChanged()` dispatching `config-changed` events, `render()`).
  3. A registration block at the bottom: `customElements.define('ha-plooum-<name>-card', ...)` and `customElements.define('ha-plooum-<name>-card-editor', ...)`, each guarded with `if (!customElements.get(...))` to avoid double-registration, followed by pushing an entry (`type`, `name`, `description`, `preview`) onto `window.customCards`.
- Cards do not share code or state with each other — there is no shared component/util layer. Any similarity between cards (e.g. color picker inputs, entity pickers in editors) is duplicated per card rather than factored out.
- New cards should keep the folder name and the `ha-plooum-<name>-card` custom element slug matching (e.g. `src/cards/dpad/` → `ha-plooum-dpad-card`). Some existing cards don't: `multistatus/` → `ha-plooum-multi-status-card`, `tabbed/` → `ha-plooum-tabs-card`, `button-badge/` → `ha-plooum-buttonbadge-card`. Never rename an existing element: user dashboards reference it.

### Conventions

- **English everywhere in cards and code**: UI strings shown by cards and editors (labels, tooltips, messages), comments, identifiers, and the dev environment. README.md is the exception: it is intentionally in French.
- Out-of-scope issues noticed while working go into [TODO.md](TODO.md), not into spawned background tasks or worktrees.

### Adding a new card

1. Create `src/cards/<card-name>/` with the card's source file, following the class/editor/registration pattern above (including the `customElements.get` existence guards).
2. Add an import line in [src/index.js](src/index.js): `import './cards/<card-name>/<file>.js';`.
3. Run `npm run build`.
4. Add a row to the table in [README.md](README.md) and a `docs/<card-name>.md` file documenting its config parameters.
5. Add a view for it in [dev/ha-config/dashboards/plooum-test.yaml](dev/ha-config/dashboards/plooum-test.yaml) (and a card in the `all` view), wired to the test entities.

No other configuration (no new Rollup config, no new HACS resource) is needed — every card ships in the same bundle.

## Testing

Cards are tested in a real, local Home Assistant Core (no Docker: the user is not in the `docker` group) that lives in [dev/](dev/). Its config, test entities and dashboards are versioned; its runtime state (`.storage`, database, venv, token, logs) is gitignored.

### Start it

```bash
dev/ha.sh start     # first run: installs HA (uv venv, Python 3.14), onboards, creates the token and the /plooum-edit dashboard (~10 s afterwards)
dev/ha.sh status | stop | restart | logs [n]
dev/ha.sh reset     # wipes runtime state only (git clean -X on dev/ha-config); next start re-onboards
```

HA listens on http://127.0.0.1:8123 only. Check whether it is already running (`dev/ha.sh status`) before starting it. The dev user's test credentials are in [dev/bootstrap.py](dev/bootstrap.py); a long-lived token is written to `dev/.ha-token`.

### Edit → test loop

1. Edit `src/…`, run `npm run build`.
2. Reload the page. No HA restart: the `plooum_dev` custom integration ([dev/ha-config/custom_components/plooum_dev](dev/ha-config/custom_components/plooum_dev/__init__.py)) serves the repo's `ha-plooum-cards.js` (and `.map`) at `/plooum_dev/` with `Cache-Control: no-store`, declared as a Lovelace resource exactly like a HACS install.
3. Restart HA (`dev/ha.sh restart`) only after changing `configuration.yaml`. YAML dashboards are re-read on page reload.

### Dashboards

- `/plooum-test/<view>`: YAML dashboard ([plooum-test.yaml](dev/ha-config/dashboards/plooum-test.yaml)) with an `all` view showing every card, and one view per card for focused cases (`/plooum-test/multistatus` covers on, off, unavailable, missing entity and SVG items). Put regression cases for a card in its view.
- `/plooum-edit/<view>?edit=1`: storage-mode copy of the same dashboard, the only kind where **card editors** can be opened (click "Modifier" on a card). It is seeded from the YAML file only when it doesn't exist; to re-seed it, `dev/ha.sh reset`.

### Browser: use the built-in browser pane

The user wants to watch, so drive the Claude Code built-in browser (`mcp__Claude_Browser__*`): `preview_start` with `url: http://127.0.0.1:8123/plooum-test/all`. Login is automatic (`trusted_networks` provider with bypass for 127.0.0.1). Use `read_console_messages` (onlyErrors) to catch card errors, and `javascript_tool` to inspect shadow DOM or simulate input. The pane's console buffer is not cleared between page loads: it keeps older messages, such as websocket failures logged while HA was restarting. For a clean error check, run `dev/shot.py`.

[dev/shot.py](dev/shot.py) is the headless fallback (system Chrome via Playwright) for when the pane isn't available or for scripted checks. It takes a screenshot, can crop to an element, evaluates JS, and exits with code 1 if the page logged errors:

```bash
dev/.venv/bin/python dev/shot.py /plooum-test/multistatus -e ha-plooum-multi-status-card -o dev/shots/ms.png --js "1+1"
```

### Test entities (all in [configuration.yaml](dev/ha-config/configuration.yaml))

| Entity | Use | Controlled by |
| :--- | :--- | :--- |
| `light.living_room_light` | toggle target | `input_boolean.living_room_light` |
| `switch.tv_plug` | toggle target, **becomes `unavailable`** | `input_boolean.tv_plug`, availability: `input_boolean.tv_plug_available` |
| `sensor.living_room_temperature` / `sensor.living_room_humidity` | numeric values (°C, %) | `input_number.living_room_temperature` / `input_number.living_room_humidity` |
| `cover.living_room_cover` / `cover.bedroom_cover` | position covers (open/close/stop/set_position) | `input_number.*_cover_position` |
| `button.ptz_up/down/left/right` | D-Pad `press` | each press increments `counter.ptz_presses` |
| `script.test_script` | script actions | each run increments `counter.script_runs` |
| `input_boolean.aquarium_pump/co2/uv`, `input_boolean.mower` | plain booleans | themselves |

`switch.does_not_exist` is referenced on purpose but doesn't exist (missing-entity case).

Change states and check that actions fired with [dev/api.sh](dev/api.sh):

```bash
dev/api.sh POST services/input_boolean/turn_off '{"entity_id":"input_boolean.tv_plug_available"}'   # switch.tv_plug → unavailable
dev/api.sh POST services/input_number/set_value '{"entity_id":"input_number.living_room_temperature","value":-3.5}'
dev/api.sh GET states/counter.ptz_presses        # did the D-Pad click call button.press?
dev/api.sh POST states/sensor.fake '{"state":"unknown"}'   # arbitrary state, not persisted, no services
```

Cards update live over the websocket; no reload is needed after a state change.

### What to check for a card change

- Rendering in each relevant state: on / off / `unavailable` / `unknown` / entity missing, and non-numeric values for sensors.
- Actions: click in the pane, then check the backing entity or counter with `dev/api.sh`.
- The editor in `/plooum-edit`: open it, change a field, and confirm the `config-changed` payload. The native `<input type="color">` opens an OS dialog the pane can't drive: set `.value` and dispatch an `input` event through `javascript_tool` instead.
- No errors in the console.

### Gotchas (HA 2026.10)

- On a dashboard, a card that fails `setConfig` or isn't defined becomes a `hui-error-card` that is **invisible outside edit mode**. An empty spot means a broken card: check in `?edit=1` or look for `hui-error-card` in the DOM.
- The frontend uses a scoped custom-element registry polyfill. Loading the bundle through `frontend: extra_module_url` runs it before the polyfill and the cards are never found, so keep it as a Lovelace resource.
- `http:` in YAML is deprecated: it becomes a "pending" config to confirm in the UI, with auto-revert. `dev/ha.sh` seeds `.storage/http` instead.
- Without `recorder:`, every page load logs an `unknown_command` (`recorder/info`) rejection. It's kept enabled to keep the console clean.
- `/lovelace` redirects to the new `/home/overview` page, which is not an editable Lovelace dashboard; use `/plooum-edit`.
- `ha-form` ignores a `label` key in schema entries; labels need `.computeLabel`.
