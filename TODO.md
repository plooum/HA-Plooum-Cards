# TODO

Issues noticed while working on something else. Each item should be fixable on its own.

## Multi Status card

- [x] **Editor labels show raw keys.** The `<ha-form>` schemas in `HaPlooumMultiStatusCardEditor` set a `label` key, but `ha-form` ignores it, so the editor shows `title`, `tap_action_type`, `icon_on`, `entity`… Pass `.computeLabel=${(s) => s.label || s.name}` to both `ha-form` elements (main form and per-item forms). Check it in `/plooum-edit/multistatus?edit=1`.
- [x] **`grid_options` is documented wrongly.** [docs/multistatus.md](docs/multistatus.md) presents `grid_options` (`columns`, `rows`) as a layout option for the status indicators. The card never reads it: it is Home Assistant's generic card sizing option for sections views. Fix or remove that section and the `grid_options` lines in example 2.

## Floorplan card

- [ ] **Roof over narrow strips.** A part of a floor that a floor above doesn't cover gets its own hip roof (`roofRects()` + `hipRoof()`): a strip along an upper wall looks like a ledge. A shed roof leaning on that wall would look more natural.
- [ ] **Outdoor projection through the house.** An outdoor camera's picture is projected onto the whole ground in front of it and onto every outer wall and roof slope facing it (`outdoorProjectors()` in `_buildScene()`), including what the house hides from the camera: the ground behind the house (where the picture actually shows its walls), or a wall behind another wing of an L-shaped house. Leave out what lies in the house's shadow as seen from the camera: a shadow map in the WebGL renderer (depth of the scene rendered from each projecting camera, compared in `MODE.picture` of the fragment shader).
