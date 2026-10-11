# Task: floorplan editor, a 3D "setup view" that follows the camera projection's alignment

You are a sub-agent of the pilot. Load the skills `pr-workflow`, `ha-dev-testing` and `floorplan-card` before you start (in `.claude/skills/`), and read `CLAUDE.md`. Work in the main checkout `/home/doudou/git/HA-Plooum-Cards` (not a worktree: the dev HA serves this checkout's bundle).

Branch: `feature/floorplan-setup-view`, off an up-to-date `main`. Deliver one PR with everything below (the user wants a single PR: the wide and narrow layouts share code that must not be duplicated). Never merge it. End with the report from `pr-workflow`.

## Why

Lining up a camera for its 3D projection (editor → select a camera → **Advanced: 3D and projection** → **Camera view**, drag the corners of the house onto the picture) is hard with a wide-angle lens: you can't see the effect on the projection. In the 3D view's default framing the projection is small and seen at a slant: a wrong `distortion` looks almost the same as the right one. Seen **facing the facade** (outdoor) or **from above the camera** (indoor), the error is obvious: the picture overflows the walls, straight lines bend.

So, while the user aligns a projecting camera, a 3D view shows the projection from a viewpoint made for checking it: the **setup view**.

## Requirements (decided by the user: don't reopen them)

### Where the setup view is shown

1. **Wide layout**: when HA shows the editor dialog's preview, the **preview's card being edited** becomes the setup view. No extra UI in the editor.
2. **Narrow layout**: when the preview isn't visible (HA hides it in a narrow dialog, e.g. on a phone), a two-way toggle at the top of the camera alignment zone (in the Advanced panel, right above the **Camera view** header) switches that zone between **Setup** (today's camera view with its corners) and **3D preview** (a 3D view of the card in the setup view, at the same place). In 3D preview mode the zone's header reads "Projection preview". The toggle only exists in the narrow layout.
3. Choose between them by **measuring** whether the preview's card is actually rendered (in the document and with a non-zero size), not by guessing from the window width. Re-check when the dialog is resized.

### The viewpoint

4. **Outdoor camera**: facing the facade the editor offers for pinning (`facadeCorners(...)`: the outer wall the camera sees best). The eye is on the facade's outward side (the camera's side), along its normal, a little above it (orbit `tilt` ≈ 72°, i.e. ~18° above horizontal), the target at the middle of the facade at mid-wall height, framed on the facade's width and height with a margin. Floors shown: the card's default.
5. **Indoor camera** (the user's "view B"): the eye above the camera, looking down towards the middle of the camera's room (orbit `tilt` ≈ 50°, azimuth from the room's center towards the camera), framed on the room. Only the camera's floor is shown: no floors above, no roof (`_level3d` = that floor).
6. A camera on another floor than the ground floor: use its floor's `z0`.
7. Fallback, when no facade / room can be found: behind the camera facing what it films, like `_screenTap` does.
8. One function computes the setup view (orbit, level, label) from the plan, the camera and the viewport, and every caller uses it.

### When the view is set

9. The setup view only exists for a selected camera with `projection: true`, while its Advanced panel is open. Otherwise nothing changes.
10. It is (re)applied after each alignment change: a corner dropped, a pin removed (tap), **Unpin**, the picture dragged to turn the camera, a projection-related field changed in the Advanced panel (tilt, height, the projection toggle), **Capture** / forgetting the reference picture. **Not** when merely opening the panel or selecting the camera.
11. **It must survive the preview's reload**: after a `config-changed`, HA gives the preview card a new config or recreates it (stacks rebuild their cards). The card shown after the reload must be in the setup view, so the user follows the effect of the corner they moved. So the "setup view wanted" state can't live only on a card instance.
12. **Free view**: as soon as the user moves that 3D view (drag, pan, wheel, pinch, zoom buttons, double-click, the 🏠 button, a camera chip), it behaves exactly as a normal card from then on. The next alignment change (point 10) puts it back in the setup view. A preview reload that doesn't follow an alignment change keeps it free.
13. A badge, top-left of the 3D viewport:
    - in the setup view: `Setup · <camera name> — <south facade | room name>` (accent background, crosshairs icon `mdi:crosshairs-gps`). For the facade, name it by the side it faces (north / south / east / west, from the plan with y down = south), or just "facade" if that gets complicated;
    - in free view: `Free view` and a **Setup view** button that applies the setup view again.
    The pilot's mock-ups: a pill at top-left, 13px medium text, white on the accent color in setup mode; dark translucent with a small accent button in free view.
14. If the preview's card is in 2D, it switches to 3D for the setup view. When the setup ends (panel folded, another camera or a room selected, projection turned off, another stack card selected, dialog closed), the card goes back to the view, floors and orbit it had before.
15. In a stack (the dialog previews every card of the stack), scroll the edited card into view (`block: 'nearest'`) when the setup view is applied.
16. Only the dialog preview's card and the editor's own 3D preview are affected. **The dashboard cards behind the dialog, which have the same config, never are.** Note: `card.preview` is true for them too in edit mode; find the preview's card by walking up the composed tree (`parentNode || host`) to `hui-dialog-edit-card`, the same dialog as the editor.
17. The alignment itself doesn't change: free pins, any corner, as many as today. Only the 3D viewpoint is new.
18. UI strings in English.

## Design (decided by the pilot, follow it unless it doesn't work, and then say why in the report)

- **Module-level shared state** between the editor and the cards (both are in this file): for example a small registry keyed by the `hui-dialog-edit-card` element. It holds the setup request `{ camera id, floor index, seq }` (seq incremented at each alignment change, point 10), the config being edited, and whether the target is in free view and since which seq. Cards register on `connectedCallback` and unregister on `disconnectedCallback`; a newly connected card checks it right away (that's how point 11 works).
- **Which preview card**: the floorplan card in the same dialog whose config matches the editor's current config (compare the floors; HA may hand over a copy, not the same object). If none matches exactly, the only floorplan card of the dialog, if there is exactly one.
- A card applies a request when its seq is newer than the last one it applied, unless it's in free view for that seq. Any user gesture on its 3D view marks it free.
- **The narrow layout's 3D preview** is a real `ha-plooum-floorplan-card` element created by the editor with the editor's current config, and driven through **the same code path** as the dialog's preview card (it simply is the target of the setup request). No second 3D renderer, no copy of the viewpoint logic.
- The setup orbit goes through the card's existing `_orbit` / `_level3d` / `_view`, so the existing animation (`_shownOrbit`) and gestures keep working. Save the card's previous `_view`, `_level3d` and `_orbit` when the setup starts, restore them when it ends (point 14).
- During a drag, `config-changed` is only dispatched on pointer up: following the drop is enough (no live update during the drag).

## Docs

- `docs/floorplan.md`, in the editor's **Camera view** part: describe the setup view (wide and narrow layouts, free view, what brings it back).
- README.md and README.fr.md only if they describe this part of the editor (today they don't: then leave them alone).
- Don't bump `CARD_VERSION`.

## Test cases (do each one, give what you saw and screenshot paths)

Dev HA, `/plooum-edit/floorplan?edit=1`, with `.claude/skills/ha-dev-testing/editor_shot.py` (1700×1050 for the wide layout, 420×900 for the narrow one). The vertical stack's card 3 (index 2) is "Home in 3D", card 1 (index 0) "Home" is in 2D.

1. Wide, card 3, `camera.garden_camera`, open Advanced: the preview **doesn't move** yet. Drop a corner (call the real pointer handlers or dispatch pointer events on the camera view): the preview card faces the south facade (y = 5, from x = 0 to 11), badge `Setup · Garden Camera — …`, and is scrolled into view.
2. Same, after the preview reloads (the drop dispatches `config-changed`): still in the setup view, with the new settings.
3. Turn the preview by hand (pointer drag on its 3D view): badge `Free view`; the view stays where you left it. Click **Setup view**: back to the setup view. Turn it again, then drop another corner: back to the setup view.
4. `camera.living_room_camera` (indoor): after an alignment change, view from above the camera towards the middle of the Living Room, ground floor only, no roof.
5. Card 1 "Home" (2D): after an alignment change on a projecting camera, the preview switches to 3D in the setup view; fold the Advanced panel: back to 2D as before.
6. A camera without `projection` (`camera.driveway_camera`): nothing changes.
7. The dashboard cards behind the dialog keep their view in every case (check their `_orbit` / `_view`).
8. Narrow (420×900): the toggle shows above **Camera view**; **3D preview** shows the embedded 3D view in the setup view with its badge; an alignment change made in **Setup** shows in **3D preview**; free view and **Setup view** work there too.
9. Close the dialog: no errors, nothing left registered (the module state is empty again).
10. `editor_shot.py` / `dev/shot.py` exit code 0 on `/plooum-test/floorplan` and on the editor runs (no console errors), and the card outside the editor behaves as before.

## The 2 screenshots of your report

1. `dev/shots/setup-wide.png`: the whole editor dialog at 1700×1050, `camera.garden_camera` selected, Advanced open, after a corner drop: camera view on the left, the preview's "Home in 3D" card facing the south facade with its `Setup · …` badge on the right.
2. `dev/shots/setup-narrow.png`: the dialog at 420×900, same camera, the toggle on **3D preview**, showing the embedded 3D view in the setup view with its badge.

