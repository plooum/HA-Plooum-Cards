# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install     # install dependencies
npm run build   # rollup -c — regenerates ha-plooum-cards.js and its sourcemap at the repo root
```

`compil.sh` runs both of the above in sequence. There is no lint or unit-test setup; cards are tested in a local Home Assistant — see **Testing** below.

The compiled bundle (`ha-plooum-cards.js` / `.js.map`) is **not** committed (gitignored). Locally, run `npm run build` after any change under `src/` so the dev HA serves it. On GitHub, [build.yml](.github/workflows/build.yml) builds it on every push and PR (downloadable artifact), and attaches it to each published release — HACS downloads it from the release assets. [validate.yml](.github/workflows/validate.yml) runs the HACS checks.

## Architecture

This is a single HACS (Home Assistant Community Store) Lovelace plugin that bundles several independent custom cards into one JS file.

- **Single entry point**: [src/index.js](src/index.js) imports every card module so they register themselves. Rollup ([rollup.config.mjs](rollup.config.mjs)) bundles this into one IIFE file, `ha-plooum-cards.js`, which is the one resource HACS/Home Assistant loads (declared in [hacs.json](hacs.json), shipped as a release asset).
- **Each card is fully self-contained** in `src/cards/<card-name>/`, as a single `.js` file built with `lit` (`LitElement`, `html`, `css`). A card file defines, in order:
  1. The card class (`static getConfigElement()`, `static getStubConfig()`, `setConfig()`, `render()`, `static get styles()`).
  2. A paired editor class (`<Card>Editor`) implementing the visual config UI (`setConfig()`, `_valueChanged()` dispatching `config-changed` events, `render()`).
  3. A registration block at the bottom: `customElements.define('ha-plooum-<name>-card', ...)` and `customElements.define('ha-plooum-<name>-card-editor', ...)`, each guarded with `if (!customElements.get(...))` to avoid double-registration, followed by pushing an entry (`type`, `name`, `description`, `preview`) onto `window.customCards`.
- Cards do not share code or state with each other — there is no shared component/util layer. Any similarity between cards (e.g. color picker inputs, entity pickers in editors) is duplicated per card rather than factored out.
- New cards should keep the folder name and the `ha-plooum-<name>-card` custom element slug matching (e.g. `src/cards/dpad/` → `ha-plooum-dpad-card`). Some existing cards don't: `multistatus/` → `ha-plooum-multi-status-card`, `tabbed/` → `ha-plooum-tabs-card`, `button-badge/` → `ha-plooum-buttonbadge-card`. Never rename an existing element: user dashboards reference it.

### Conventions

- **English everywhere in cards and code**: UI strings shown by cards and editors (labels, tooltips, messages), comments, identifiers, and the dev environment.
- **The README exists in two languages**: [README.md](README.md) in English (shown by GitHub and HACS) and [README.fr.md](README.fr.md) in French, each linking to the other at the top. Any change to one must be made to the other in the same PR.
- Out-of-scope issues noticed while working go into [TODO.md](TODO.md), not into spawned background tasks or worktrees.

### Adding a new card

1. Create `src/cards/<card-name>/` with the card's source file, following the class/editor/registration pattern above (including the `customElements.get` existence guards).
2. Add an import line in [src/index.js](src/index.js): `import './cards/<card-name>/<file>.js';`.
3. Run `npm run build`.
4. Add a row (and a short description with a preview) to [README.md](README.md) and [README.fr.md](README.fr.md), and a `docs/<card-name>.md` file documenting its config parameters.
5. Add a view for it in [dev/ha-config/dashboards/plooum-test.yaml](dev/ha-config/dashboards/plooum-test.yaml) (and a card in the `all` view), wired to the test entities.

No other configuration (no new Rollup config, no new HACS resource) is needed — every card ships in the same bundle.

## Git workflow

Every change goes through a pull request, without exception: code, docs, READMEs, this file, [TODO.md](TODO.md), workflows, `CARD_VERSION` bumps. Nothing is committed directly on `main`. It is a light gitflow, with no `develop` or `release` branches.

1. Branch `feature/<name>` off an up-to-date `main` (`git fetch`, `git pull --ff-only`).
2. Commit there and push the branch. One feature or fix per PR: several TODO items mean several PRs.
3. Open a PR against `main` with `gh pr create` and check that its CI (Build, Validate) passes.
4. Wait for the owner's explicit approval. Never merge a PR before it.
5. Once approved: if `main` has moved, rebase the branch on `origin/main` and push it again (force-push is allowed on the feature branch only) so CI runs on the real result. Then **squash-merge** it: `gh pr merge <N> --squash --delete-branch`, subject `<PR title> (#<N>)`. Each PR becomes a single commit on `main`.
6. Locally: `git checkout main`, `git pull --ff-only`, `git branch -D feature/<name>` (`-D`: a squashed branch isn't an ancestor of `main`). Check the Build and Validate runs on `main`.

### Releases

Tags are named `V0.0.NN` (lightweight), made on `main` once the PRs are merged; run `git fetch --tags` first. The GitHub release is titled with the tag name and its notes are in French, like [README.fr.md](README.fr.md). A `CARD_VERSION` bump goes through its own PR like any change; a new card ships at its initial `CARD_VERSION`.

Publishing the release triggers [build.yml](.github/workflows/build.yml), which builds the bundle and attaches `ha-plooum-cards.js` and its `.map` to it: check that the run passed and that both assets are on the release.

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

- `/plooum-test/<view>`: YAML dashboard ([plooum-test.yaml](dev/ha-config/dashboards/plooum-test.yaml)) with an `all` view showing every card, and one view per card for focused cases (`/plooum-test/habitat` is a sections view covering every severity, strip style and fold case, including narrow and short grid cells; `/plooum-test/multistatus` covers on, off, unavailable, missing entity and SVG items; `/plooum-test/floorplan` is a full-width panel view with a hand-written two-floor plan with cameras and a terrace, the same plan in 3D, in 3D with floating screens (`screen_mode: billboard`), and a plan generated from the areas; the garden and living room cameras project their picture). Put regression cases for a card in its view.
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
| `light.kitchen_light` / `light.bedroom_light` | toggle targets | `input_boolean.kitchen_light` / `input_boolean.bedroom_light` |
| `sensor.kitchen_temperature` / `sensor.bedroom_temperature` | numeric values (°C) | `input_number.kitchen_temperature` / `input_number.bedroom_temperature` |
| `binary_sensor.front_door` (door) / `binary_sensor.hallway_motion` (motion) | binary sensors with a device class | `input_boolean.front_door_open` / `input_boolean.hallway_motion` |
| `camera.garden_camera`, `camera.driveway_camera` (outdoor scenes), `camera.living_room_camera`, `camera.kitchen_camera`, `camera.garage_camera` (indoor scenes) | fake cameras ([camera.py](dev/ha-config/custom_components/plooum_dev/camera.py)): name and clock drawn on each image; `camera.living_room_camera` films the Living Room from inside and `camera.garden_camera` the house from the garden through a wide-angle lens (`distortion: -0.25`), for real (checkerboard floor or ground, striped walls, from their pose on the floorplan view): projected in 3D their pictures must fall exactly on the room / the facades and ground, and their tile corners are known points for the editor's point matching; `camera.garage_camera` **becomes `unavailable`** | availability: `input_boolean.garage_camera_available` |
| `sensor.aquarium_temperature` (150L), `sensor.aquarium_60l_temperature` (60L) | habitat card measures (°C) | `input_number.aquarium_temperature` / `input_number.aquarium_60_temperature` |
| `sensor.aquarium_ph` | habitat card measure, **non-numeric** (`calibrating`) when `input_boolean.aquarium_ph_calibrating` is on | `input_number.aquarium_ph` |
| `input_number.aquarium_nitrate` | habitat card custom measure (mg/L) | itself |
| `light.aquarium_light` | dimmable light, its level (%) is an `input_number`, 0 = off | `input_number.aquarium_light_level` |
| `input_boolean.aquarium_60_air` | a critical actuator, off at start | itself |
| `sensor.terrarium_temperature` / `sensor.terrarium_humidity` | habitat card measures (°C, %) | `input_number.terrarium_*` |
| `switch.terrarium_heat_lamp` / `switch.terrarium_mister` / `switch.terrarium_uvb` | habitat card actuators; `switch.terrarium_uvb` **becomes `unavailable`** | `input_boolean.terrarium_*`, availability: `input_boolean.terrarium_uvb_available` |
| `sensor.pond_temperature` / `switch.pond_uv` | pond measure and actuator | `input_number.pond_temperature` / `input_boolean.pond_uv` |

`switch.does_not_exist` and `camera.does_not_exist` are referenced on purpose but don't exist (missing-entity case).

`dev/bootstrap.py` also puts these entities in floors and areas (Ground Floor: Living Room, Kitchen, Hallway; Upstairs: Bedroom, Bathroom — empty on purpose), for cards that read the area registry (the floorplan card's generated plan). Edit `AREAS` in it and run `dev/.venv/bin/python dev/bootstrap.py` to change them; it only adds and reassigns, so remove areas through the UI or `dev/ha.sh reset`.

`image_upload:` is enabled for the floorplan editor's **Capture** button (a camera's reference picture, served at `/api/image/serve/<id>/original`); uploaded pictures live in the runtime state, so `dev/ha.sh reset` drops them and the YAML dashboard can't reference one.

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
