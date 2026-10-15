# HA Plooum Sky Card

`type: custom:ha-plooum-sky-card`

Shows the sky above the house as a dome, as if you were lying on the ground looking up. Everything is computed in the browser with [astronomy-engine](https://github.com/cosinekitty/astronomy) (MIT); the star and constellation data come from [d3-celestial](https://github.com/ofrohn/d3-celestial) (BSD-3-Clause). The position comes from Home Assistant (`latitude` / `longitude` of the general settings) unless you set it.

## How to read the dome

- The **zenith** (straight above you) is at the center, the **horizon** is the outer circle. Only what is above the horizon is drawn.
- **N, E, S, W** are written on the edge. North is at the top and east on the left, as on a sky map you hold over your head.
- White dots are the stars up to magnitude 4.5 (the brighter, the bigger). Thin lines and names show the 88 constellations. Stars and constellations fade as the sky brightens.
- Colored dots with a name are the planets (Mercury, Venus, Mars, Jupiter, Saturn). The Moon is drawn with its phase, its lit side facing the Sun. The Sun is shown when it is up.
- The background follows the Sun: day, then civil, nautical and astronomical twilight (Sun 0, -6, -12 and -18 degrees below the horizon), then night.

## Moving through time

With `time_control: rotate`, drag the sky **sideways** (mouse or finger): the whole width of the dome is 6 hours, and dragging to the right moves the time forward. The range is +-6 hours. **Double-tap** (or double-click) to come back to now.

Under the dome, the displayed time (`HH:MM`, browser time zone) is shown, followed by the offset from now (`+2 h 15`, `-0 h 30`) when there is one. The card refreshes every minute.

## Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:ha-plooum-sky-card` |
| `title` | string | none | Title shown above the dome |
| `latitude` | number | Home Assistant's | Latitude in degrees (north positive) |
| `longitude` | number | Home Assistant's | Longitude in degrees (east positive) |
| `time_control` | string | `rotate` | How the time is moved. Only `rotate` for now: drag the sky sideways |
| `show_constellations` | boolean | `true` | Draw the constellation lines and names |

## Example

```yaml
type: custom:ha-plooum-sky-card
title: Sydney
latitude: -33.87
longitude: 151.21
show_constellations: false
```
