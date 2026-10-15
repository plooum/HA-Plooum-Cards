# HA Plooum Sky Card

`type: custom:ha-plooum-sky-card`

Shows the sky above the house as a dome, as if you were lying on the ground looking up. Everything is computed in the browser with [astronomy-engine](https://github.com/cosinekitty/astronomy) (MIT); the star and constellation data come from [d3-celestial](https://github.com/ofrohn/d3-celestial) (BSD-3-Clause). The position comes from Home Assistant (`latitude` / `longitude` of the general settings) unless you set it.

## How to read the dome

- The **zenith** (straight above you) is at the center, the **horizon** is the outer circle. Only what is above the horizon is drawn.
- **N, E, S, W** are written on the edge. North is at the top and east on the left, as on a sky map you hold over your head.
- White dots are the stars up to magnitude 4.5 (the brighter, the bigger). Thin lines and names show the 88 constellations. By day the sky is blue and stars, lines and names stay visible, turning navy blue.
- Colored dots with a name are the planets (Mercury, Venus, Mars, Jupiter, Saturn). The Moon is drawn with its phase, its lit side facing the Sun. The Sun is shown when it is up.
- The background follows the Sun: day, then civil, nautical and astronomical twilight (Sun 0, -6, -12 and -18 degrees below the horizon), then night.

## Moving through time

With `time_control: rotate`, drag the sky **sideways** (mouse or finger): the whole width of the dome is 6 hours, and dragging to the right moves the time forward. The range is ±6 hours. **Double-tap** (or double-click) to come back to now.

Under the dome, the displayed time (`HH:MM`, browser time zone) is shown, followed by the offset from now (`+2 h 15`, `-0 h 30`) when there is one. The card refreshes every minute.

## Next event

Under the time, a line announces the next sky event within about 400 days, for example `Perseids meteor shower · Wed 12 Aug, 18:47 · in 3 days · Moon 2 %`. Events are computed locally for the card's position and shown in the browser time zone. They are, in order of date:

- **Solar eclipses**: only those visible from the position, with the Sun up at the maximum (partial, annular or total; partial ones show the share of the Sun covered).
- **Lunar eclipses**: partial and total ones (not penumbral), with the Moon above the horizon at the maximum.
- **Conjunctions**: two planets among Mercury, Venus, Mars, Jupiter and Saturn less than 2° apart (seen from the Earth) and more than 15° from the Sun.
- **Oppositions** of Mars, Jupiter and Saturn.
- **Full Moons**; a full Moon closer than 361,500 km is announced as a **Supermoon**.
- **Equinoxes and solstices**.
- **Meteor showers** (Quadrantids, Lyrids, Eta Aquariids, Perseids, Orionids, Leonids, Geminids, Ursids), at the peak date of the [IMO](https://www.imo.net/) table, with the Moon's illuminated share at that time (a bright Moon hides the fainter meteors).

An event stays announced for 6 hours after it. When it is within 6 hours of now (before or after), the line is highlighted: **tap it** to bring the dome to the event, using the same time offset as dragging the sky. Otherwise a tap does nothing. Set `show_next_event: false` to hide the line.

## Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:ha-plooum-sky-card` |
| `title` | string | none | Title shown above the dome |
| `latitude` | number | Home Assistant's | Latitude in degrees (north positive) |
| `longitude` | number | Home Assistant's | Longitude in degrees (east positive) |
| `time_control` | string | `rotate` | How the time is moved. Only `rotate` for now: drag the sky sideways |
| `show_constellations` | boolean | `true` | Draw the constellation lines and names |
| `show_next_event` | boolean | `true` | Show the next sky event under the time |

## Example

```yaml
type: custom:ha-plooum-sky-card
title: Sydney
latitude: -33.87
longitude: 151.21
show_constellations: false
```
