# HA Plooum Berlin Clock Card

`type: custom:ha-plooum-berlin-clock-card`

Shows the time as a Berlin clock (Mengenlehreuhr): 24 lamps that you add up to read the time. It refreshes every second.

## How to read it

From top to bottom:

| Row | Lamps | Each lit lamp is worth |
| :--- | :--- | :--- |
| Seconds | 1 round lamp | Lit on even seconds, off on odd ones (it blinks) |
| 1 | 4 red blocks | 5 hours |
| 2 | 4 red blocks | 1 hour |
| 3 | 11 blocks (yellow, the 3rd, 6th and 9th red) | 5 minutes (the red ones mark the quarters: 15, 30, 45) |
| 4 | 4 yellow blocks | 1 minute |

Example: 13:37 is two lit blocks in row 1 (10 h), three in row 2 (3 h), seven in row 3 (35 min) and two in row 4 (2 min). Hover a row to see its value.

## Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:ha-plooum-berlin-clock-card` |
| `title` | string | none | Title shown above the clock |
| `colors` | string | `classic` | `classic`: the real clock's red and yellow, dim grey when unlit. `theme`: the theme's active color (quarters in the error color), faded when unlit |
| `show_time` | boolean | `false` | Show the time in digits (`HH:MM:SS`) under the clock |
| `time_zone` | string | `local` | `local`: the browser's time zone. `server`: Home Assistant's time zone |

## Example

```yaml
type: custom:ha-plooum-berlin-clock-card
title: Server time
colors: theme
show_time: true
time_zone: server
```
