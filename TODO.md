# TODO

Issues noticed while working on something else. Each item should be fixable on its own.

## Multi Status card

- [ ] **Editor labels show raw keys.** The `<ha-form>` schemas in `HaPlooumMultiStatusCardEditor` set a `label` key, but `ha-form` ignores it, so the editor shows `title`, `tap_action_type`, `icon_on`, `entity`… Pass `.computeLabel=${(s) => s.label || s.name}` to both `ha-form` elements (main form and per-item forms). Check it in `/plooum-edit/multistatus?edit=1`.
- [ ] **`grid_options` is documented wrongly.** [docs/multistatus.md](docs/multistatus.md) presents `grid_options` (`columns`, `rows`) as a layout option for the status indicators. The card never reads it: it is Home Assistant's generic card sizing option for sections views. Fix or remove that section and the `grid_options` lines in example 2.

## Floorplan card

- [ ] **Follow a PTZ camera's orientation in 3D.** A camera's screen is placed from its `direction` and `tilt` (see `cameraSetup()` and `_camera3d()` in the card). For a camera that can be rotated from Home Assistant, read them from entities instead, e.g. `direction_entity` / `tilt_entity` (a sensor or number giving the pan/tilt angle) plus a `direction_offset` to match the plan. Check first what the user's cameras expose: many PTZ integrations only have move buttons and no position sensor.
- [ ] **Roof over narrow strips.** A part of a floor that a floor above doesn't cover gets its own hip roof (`roofRects()` + `hipRoof()`): a strip along an upper wall looks like a ledge. A shed roof leaning on that wall would look more natural.
