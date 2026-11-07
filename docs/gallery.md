# HA Plooum Gallery Card

`type: custom:ha-plooum-gallery-card`

Browses the videos a camera recorded into a Home Assistant media folder (`media_source`), one day at a time: a player, a 24 h timeline and a grid of thumbnails. It opens on the most recent day that has videos.

## File layout

The card expects one folder per day, holding one file per recording, both named after their date and time:

```
<media_source>/<YYYY-MM-DD>/<HH:MM:SS>-<HH:MM:SS>.<ext>
e.g. rec_cam_entree/videos/2026-07-11/10:32:20-10:35:20.mp4
```

The file name gives the start and the end of the clip. Folders and files that do not match are ignored. The card is meant for a few videos per day (about ten): there are no favorites, no grouping and no continuous playback.

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
