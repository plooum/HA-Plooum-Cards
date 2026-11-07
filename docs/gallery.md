# HA Plooum Gallery Card

`type: custom:ha-plooum-gallery-card`

Browses the videos a camera recorded into a Home Assistant media folder (`media_source`), one day at a time: a player, a 24 h timeline and a grid of thumbnails. It opens on the most recent day that has videos.

## File layout

The card accepts two organizations of the recordings, and a mix of both.

1. One folder per day, holding one file per recording, both named after their date and time:

```
<media_source>/<YYYY-MM-DD>/<HH:MM:SS>-<HH:MM:SS>.<ext>
e.g. rec_cam_entree/videos/2026-07-11/10:32:20-10:35:20.mp4
```

2. Flat files named after the start and the end of the clip as Unix timestamps (seconds), directly in `media_source` (or inside a day folder):

```
<media_source>/<start epoch>-<end epoch>.<ext>
e.g. rec_cam_entree/videos/1794032417-1794032495.mp4
```

This is what `path_datetime_format: X` of camera-gallery-card produces. A clip belongs to the day of its start, in Home Assistant's time zone when your profile follows the server time zone, otherwise in the browser's. A clip that runs past midnight stops at 24 h on the timeline. An epoch clip inside a day folder stays in that day.

The file name gives the start and the end of the clip. Folders and files that do not match are ignored. The card is meant for a few videos per day (about ten): there are no favorites, no grouping and no continuous playback.

## File naming

By default (`filename_format` blank or `auto`) the card tries both layouts above: `{start:HH:mm:ss}-{end:HH:mm:ss}` and `{start:X}-{end:X}`, with day folders named `YYYY-MM-DD`. If your recorder names its files differently, set the format yourself.

A format is a pattern in which `{start:FMT}` is required and `{end:FMT}` is optional; everything else is literal text. The extension is ignored. `FMT` is made of these tokens (any other letter is an error and makes the card fail to load, as does a missing `{start:…}`):

| Token | Meaning |
| :--- | :--- |
| `X` | Unix time in seconds (read in Home Assistant's time zone when your profile follows the server, else the browser's) |
| `x` | Unix time in milliseconds (same time zone rule) |
| `YYYY` `MM` `DD` | Year, month, day, as written in the name (local wall-clock time, no conversion) |
| `HH` `mm` `ss` | Hour (24 h), minute, second, as written in the name (no conversion) |

If the format gives no date (no `X` / `x`, nor `YYYY` + `MM` + `DD`), the date comes from the day folder; such a file placed directly in `media_source` is ignored. Without `{end:…}` the clip ends where it starts (a minimal-width segment on the timeline) and its label is the start time only.

Examples:

| `filename_format` | Matches |
| :--- | :--- |
| `{start:X}-{end:X}` | `1794032417-1794032495.mp4` (this is what `path_datetime_format: X` of camera-gallery-card produces) |
| `{start:HH:mm:ss}-{end:HH:mm:ss}` | `07:20:17-07:23:00.mp4` inside a day folder |
| `rec_{start:YYYYMMDD_HHmmss}` | `rec_20261107_072017.mp4` (07:20:17 on 2026-11-07, no end) |

`folder_format` (default `YYYY-MM-DD`) names the day folders with the date tokens `YYYY`, `MM` and `DD` (all three are required), e.g. `DD.MM.YYYY`.

## Layout

1. The player (the selected clip; the most recent of the day when the card opens). It starts playing only with `autoplay`.
2. A bar: **Today** (back to the most recent day that has videos), then `‹` / the displayed date / `›`, which jump to the previous / next day that has videos (empty folders are skipped) and are disabled at either end.
3. A 24 h timeline with a mark every 6 h and one segment per clip (at least 4 px wide so that it stays clickable). The playing clip is solid, the others dimmed. Hover for `HH:MM:SS – HH:MM:SS`; click to play that clip.
4. The thumbnails, most recent first, with the start time (`HH:MM`). Click to play.

Thumbnails are extracted in your browser (one frame per clip, two at a time) and kept in memory. A clip that cannot be played shows "This video can't be played".

## Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:ha-plooum-gallery-card` |
| `media_source` | string | **Required** | The media source folder that holds the day folders, e.g. `media-source://media_source/rec_cam_entree/videos` |
| `filename_format` | string | `auto` | Pattern of the recording file names, see [File naming](#file-naming). Blank or `auto` accepts both layouts above |
| `folder_format` | string | `YYYY-MM-DD` | Pattern of the day folder names (date tokens only) |
| `autoplay` | boolean | `false` | Play the selected clip when the card opens |
| `muted` | boolean | `true` | Mute the player |
| `thumb_size` | number | `140` | Width of the thumbnails, in px |
| `show_timeline` | boolean | `true` | Show the 24 h timeline |
| `timeline_color` | string | `var(--accent-color)` | Color of the timeline segments and of the selected thumbnail |

## Example

```yaml
type: custom:ha-plooum-gallery-card
media_source: media-source://media_source/rec_cam_entree/videos
thumb_size: 160
timeline_color: "#ff9800"
```

The folder must be declared in Home Assistant (`homeassistant: media_dirs:` in `configuration.yaml`, or the Media folder add-on) and readable through the media browser.
