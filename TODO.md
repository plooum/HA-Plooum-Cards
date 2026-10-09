# TODO

Issues noticed while working on something else. Each item should be fixable on its own.

## Multi Status card

- [x] **Editor labels show raw keys.** The `<ha-form>` schemas in `HaPlooumMultiStatusCardEditor` set a `label` key, but `ha-form` ignores it, so the editor shows `title`, `tap_action_type`, `icon_on`, `entity`… Pass `.computeLabel=${(s) => s.label || s.name}` to both `ha-form` elements (main form and per-item forms). Check it in `/plooum-edit/multistatus?edit=1`.
- [x] **`grid_options` is documented wrongly.** [docs/multistatus.md](docs/multistatus.md) presents `grid_options` (`columns`, `rows`) as a layout option for the status indicators. The card never reads it: it is Home Assistant's generic card sizing option for sections views. Fix or remove that section and the `grid_options` lines in example 2.

## Floorplan card

- [x] **Outdoor projection through the house.** An outdoor camera's picture is projected onto the whole ground in front of it and onto every outer wall and roof slope facing it (`outdoorProjectors()` in `_buildScene()`), including what the house hides from the camera: the ground behind the house (where the picture actually shows its walls), or a wall behind another wing of an L-shaped house. Leave out what lies in the house's shadow as seen from the camera: a shadow map in the WebGL renderer (depth of the scene rendered from each projecting camera, compared in `MODE.picture` of the fragment shader).

### Editor: camera alignment

- [ ] **Hidden corners in an outdoor camera's view.** The editor's camera view offers every corner of the house outline as a handle to drag (`planCorners(..., outline)` in `_renderCameraView()`), including the ones the house hides from the camera (the back corners). Leave out the corners whose line of sight from the camera crosses the indoor rooms.
- [ ] **Only the facing facades for an outdoor camera.** For an outdoor camera, the camera view (`_renderCameraView()`) draws the lines of every room (`planLines(plan.rooms, …)`), back walls included, which clutters the picture. Draw only the outer walls facing the camera (outward normal towards the camera position, as for the projection in `_buildScene()`), and the ground lines in front of them.
- [ ] **Correct the plan's proportions.** When the drawn plan is a little off (a wall measured too short), pinned corners can't all fall on their place in the picture. Let the camera view adjust the gap between two corners horizontally and between two corners vertically (a stretch along the plan's width / depth, and of the wall height) to make up for these measuring errors. This only changes this camera's projection (a correction stored in its settings, applied when its picture is projected), never the plan: the picture is warped to fit the 3D model as well as possible.

### Projection and 3D view

- [ ] **Roof over narrow strips.** A part of a floor that a floor above doesn't cover gets its own hip roof (`roofRects()` + `hipRoof()`): a strip along an upper wall looks like a ledge. A shed roof leaning on that wall would look more natural.
- [ ] **Frozen projected picture.** Projected pictures are snapshots reloaded every `refresh_interval` (3 s by default): if the camera is turned (PTZ, knocked), a fresh picture no longer matches the alignment and is projected askew. Add a "Capture" button to the editor's camera view: it uploads the current picture through Home Assistant's image upload (as the picture card does; check that `image_upload` is available) and stores its id in the camera's settings as the alignment's reference picture. The camera view aligns on that reference, and a new option `projection_picture: frozen` (default) always projects it, never reloaded. Without a reference yet, keep today's behavior.
- [ ] **Watched live projection.** Depends on the frozen picture. `projection_picture: live`: project a recent snapshot (own, long interval, e.g. 5 min, separate from the screens' `refresh_interval`), but only while it still looks like the reference: compare both pictures scaled down (~64 px) on their edges rather than their colors, to tolerate light changes. A snapshot that differs too much, fails to load or comes out black never replaces the last good one (or the reference), and the camera shows "Camera moved? Re-align it" (editor and its screen). Expect infrared night pictures to be rejected: keeping the last daytime picture is fine.
- [ ] **Fade the screen of a projecting camera.** In 3D, when a camera projects its picture onto the scene, its screen in front of it hides part of that projection and repeats it. Make it much less visible (semi-transparent, or smaller) for cameras with `projection`.

### 2D plan

- [ ] **Previews always shown next to the cameras.** In 2D, a camera's preview only appears while the mouse is on its marker or after a tap (`_camHover` / `_camPinned`). Add an option (e.g. `camera_previews: always`, off by default to keep today's behavior) to show a small snapshot next to each camera marker at all times, refreshed rarely (e.g. every 5 min, same interval as the watched live projection?). A snapshot that fails to load or comes out black never replaces the previous one.
- [ ] **No live stream on the 2D plan.** With `camera_view: live`, the 2D previews and the room panel load the live stream (`_cameraImage()` → `ha-camera-stream`), one per camera shown. Show only snapshots on the plan, and open the live stream on a click on the preview (more-info dialog, or the preview switching to live).
