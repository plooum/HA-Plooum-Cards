# Ha Plooum Cover Card

`type: custom:ha-plooum-cover-card`

A highly customizable and sleek Lovelace custom card for Home Assistant, designed to control multiple roller shutters (covers) side-by-side. It features vertical sliders for precise position control, integrated action icons, a security lock mechanism to prevent accidental touches, and full visual customization per cover (colors, sizes, and layout).

## Features

* **Multi-Cover Layout**: Control multiple shutters cleanly within a single compact card.
* **Vertical Sliders**: Intuitive drag-and-drop vertical sliders showing real-time percentage positions.
* **Full Customization**: Configure custom names, fonts, sizes, and custom track/thumb/progress colors for each slider.
* **Action Icons**: Quick access icons for Open, Close, and Stop commands.
* **Security Lock**: Optional confirmation prompt ("Are you sure?") to prevent accidental operations, with an automatic re-lock timer.
* **Visual Editor**: Fully compatible with the Home Assistant UI editor for easy configuration.

## Configuration Parameters

### General Card Options
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | Must be `custom:ha-plooum-cover-card`. |
| `lock_message` | string | `"Are you sure ?"` | Confirmation message displayed when clicking locked controls. |
| `vertical_spacing` | integer | `6` | Vertical spacing between elements in pixels. |
| `covers` | list | **Required** | List of cover objects to display (see below). |

### Cover Object Options
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entity` | string | **Required** | The cover entity ID (e.g., `cover.salon`). |
| `name` | string | Entity Friendly Name | Custom name displayed below the slider. Leave empty for default. |
| `show_name` | boolean | `true` | Whether to display the cover name. |
| `name_color` | string | `"#ffffff"` | Text color for the cover name. |
| `name_font_size` | integer | `14` | Font size of the cover name in pixels. |
| `percentage_font_size` | integer | `16` | Font size of the percentage indicator in pixels. |
| `slider_width` | integer | `54` | Width of the slider / column container in pixels. |
| `slider_bg_color` | string | `"#333333"` | Background color of the slider track. |
| `slider_progress_color` | string | `"#888888"` | Color of the slider progress/fill bar. |
| `slider_thumb_color` | string | `"#ffffff"` | Color of the slider handle (thumb). |
| `icon_up` | string | `"mdi:arrow-up"` | Icon for opening the cover. |
| `icon_down` | string | `"mdi:arrow-down"` | Icon for closing the cover. |
| `icon_stop` | string | `"mdi:square"` | Icon for stopping the cover. |

## Examples

```yaml
type: custom:ha-plooum-cover-card
lock_message: "Do you really want to move this shutter ?"
vertical_spacing: 8
covers:
  - entity: cover.living_room_shutter
    name: "Living Room"
    name_color: "#4fc3f7"
    slider_bg_color: "#222222"
    slider_progress_color: "#2196f3"
    slider_thumb_color: "#ffffff"
  - entity: cover.bedroom_shutter
    name: "Bedroom"
    name_color: "#ffb74d"
    slider_bg_color: "#222222"
    slider_progress_color: "#ff9800"
    slider_thumb_color: "#ffffff"
```

> **Note:** this card loads `LitElement` from Home Assistant's own frontend (not bundled), so it only activates once the Lovelace UI is up — this is expected and does not affect the other cards in this extension.
