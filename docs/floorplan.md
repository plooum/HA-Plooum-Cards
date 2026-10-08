# Ha Plooum Floorplan Card

`type: custom:ha-plooum-floorplan-card`

A live floor plan of your home. Draw your rooms, drop your devices where they really are, and the plan comes alive: lit rooms glow around their lamps, floors take the color of the room temperature, shutters close on the windows, open doors turn red and rooms with motion pulse.

![Floorplan preview](previews/floorplan.png)

## Features

- **Zero configuration to start**: with no `floors`, the plan is generated from your Home Assistant floors and areas, with each area's entities placed in its room. The card picker preview already shows your home.
- **Visual plan editor**: draw rooms by dragging on a grid, move and resize them, and drag entities from a searchable list onto the plan. Your areas don't need to be right: an entity belongs to the room it is dropped in, wherever Home Assistant thinks it is.
- **Roles guessed from the entity**: lights glow, `temperature` / `humidity` sensors feed the room, covers become windows, `door` / `window` / `opening` binary sensors show alerts, `motion` / `occupancy` / `presence` sensors make the room pulse. Nothing to map by hand.
- **Interactive plan**: tap a device to toggle it (hold for its details), drag a shutter along its window to set its position, tap a room to zoom on it and list its devices with their controls (the plan grows taller if the room needs it). Tap another room to switch to it; close with the panel's ✕, `Escape` or a tap outside the rooms.
- **Several floors**, switched with chips at the top of the card.
- **Every state stays readable**: unavailable devices blink in grey, an entity that no longer exists shows as an orange dashed `?`.

## Using the editor

1. Add the card: the plan generated from your areas appears. Fix it, or click **Blank plan** to start from scratch.
2. **Draw a room**: drag on an empty spot of the grid. A drag that starts on a wall draws a room that shares it. Rooms snap to a half-unit grid.
3. **Move / resize a room**: drag it from the inside (its devices move with it); select it to get resize handles on its corners. Rename it and give it an icon in the form below the plan.
4. **Place an entity**: drag it from the list onto the plan, or click it to drop it in the middle of the selected room. Filter the list (Lights, Covers, Sensors…) or search by name, entity id or area.
5. **Covers stick to the nearest wall** and are drawn as windows: drop them on or near a wall.
6. **Remove an entity**: drag it out of the plan, or select it and click **Remove from plan**.
7. **Undo** (button or `Ctrl+Z`) reverts the last changes. With the plan focused, arrows move the selection, `Shift` + arrows resize a room, `Delete` removes it.
8. **Floors**: `+ Floor` adds one; select no room nor entity to rename or delete the current floor.

**From my areas** regenerates the whole plan from your areas (after confirmation).

## Configuration Parameters

The editor writes this configuration for you; it can also be written by hand. Positions and sizes are in grid units (one square of the editor grid); `x` grows to the right and `y` downwards.

### Card

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:ha-plooum-floorplan-card` |
| `title` | string | — | Title shown above the plan. |
| `temp_min` | number | `17` (`63` in °F) | Temperature shown as a blue floor. |
| `temp_max` | number | `27` (`81` in °F) | Temperature shown as a red floor. |
| `floors` | list | generated | The plan, one item per floor (see below). Leave it out to generate the plan from your areas. |

### Floor (`floors` items)

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Name shown on the floor chip. |
| `rooms` | list | Rooms of the floor (see below). |
| `entities` | list | Entities placed on the floor (see below). |

### Room (`rooms` items)

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Room name, shown in its top-left corner. |
| `icon` | string | Optional MDI icon shown before the name. |
| `x`, `y` | number | Top-left corner. |
| `w`, `h` | number | Width and height. |

Walls shared by two rooms are drawn thin; outer walls are drawn thick.

### Entity (`entities` items)

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `entity` | string | Entity id. |
| `x`, `y` | number | Position. An entity belongs to the (smallest) room containing it. |
| `name` | string | Optional name, instead of the friendly name. |
| `icon` | string | Optional icon, instead of the state icon. |
| `length` | number | Covers only: window length, default `1.5`. |

How each entity is shown:

| Entity | On the plan |
| :--- | :--- |
| `light.*` | Icon; when on, a glow around it in the light's color, as bright as the light. |
| `sensor.*` with `device_class: temperature` | Room temperature (average if several) and floor color. Outside any room: a value badge. |
| `sensor.*` with `device_class: humidity` | Room humidity. Outside any room: a value badge. |
| other `sensor.*` | A value badge. |
| `cover.*` on a wall | A window with its shutter; drag along it to set the position. Off a wall: an icon. |
| `binary_sensor.*` door / window / opening | Icon, red when open. |
| `binary_sensor.*` motion / occupancy / presence | Icon; the room outline pulses when detected. |
| `climate.*` | Icon; its current temperature is used when the room has no temperature sensor. |
| anything else | Icon, highlighted when active. |

A tap toggles lights, switches, fans and input booleans, runs scenes, scripts and buttons, and opens the details of anything else. A long press always opens the details.

## Example

```yaml
type: custom:ha-plooum-floorplan-card
title: Home
floors:
  - name: Ground floor
    rooms:
      - { name: Living room, icon: "mdi:sofa", x: 0, y: 0, w: 7, h: 5 }
      - { name: Kitchen, icon: "mdi:stove", x: 7, y: 0, w: 4, h: 3 }
      - { name: Hallway, x: 7, y: 3, w: 4, h: 2 }
    entities:
      - { entity: light.living_room, x: 3, y: 2.5 }
      - { entity: sensor.living_room_temperature, x: 6, y: 1 }
      - { entity: cover.living_room, x: 3.5, y: 0, length: 2.5 }  # on the top wall
      - { entity: light.kitchen, x: 9, y: 1.5 }
      - { entity: binary_sensor.front_door, x: 10.25, y: 4.25 }
      - { entity: binary_sensor.hallway_motion, x: 8, y: 4 }
      - { entity: sensor.outdoor_temperature, x: 12, y: 2 }       # outside: a badge
  - name: Upstairs
    rooms:
      - { name: Bedroom, icon: "mdi:bed", x: 0, y: 0, w: 5, h: 4 }
    entities:
      - { entity: light.bedroom, x: 2.5, y: 2 }
      - { entity: cover.bedroom, x: 0, y: 2 }                     # on the left wall
```
