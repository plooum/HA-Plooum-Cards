# HA Plooum Multi Status Card

`type: custom:ha-plooum-multi-status-card`

An elegant and compact Home Assistant card designed to track multiple entities (such as temperature, lighting, air pump, and CO2 in an aquarium).

## Features

- Display the state of a main entity (e.g., temperature).
- Track multiple boolean entities via changing icon colors (lights, switches, CO2, UV).
- Support for custom SVG icons or standard MDI icons with independent colors for **On** and **Off** states.
- Unavailable devices stand out: an entity that is `unavailable`, `unknown` or missing is drawn with a dedicated **Unavailable** color (red by default) instead of looking "Off".
- Hovering an indicator shows a tooltip with the entity name and its translated state (e.g. `TV Plug: Unavailable`).
- Configurable click actions (e.g., redirect to a dashboard, toggle an entity state, or execute a script).
- Built-in visual configuration editor (no need to manually edit YAML unless you want to).
- Clean, translucent modern styling that seamlessly adapts to all themes.

## Configuration

You can configure this card either through the Visual Editor or manually via YAML.

### Main Card Options
| Name | Type | Requirement | Description |
|---|---|---|---|
| `type` | string | **Required** | Must be `custom:ha-plooum-multi-status-card`. |
| `title` | string | Optional | The title displayed at the top of the card. |
| `tap_action_type` | string | Optional | Action to perform on card click (`navigate`, `toggle`, `script`, or `none`). |
| `navigation_path` | string | Optional | URL or dashboard path to redirect to if `tap_action_type` is `navigate`. |
| `tap_action_entity` | string | Optional | Entity ID to toggle if `tap_action_type` is `toggle`. |
| `tap_action_script` | string | Optional | Script entity ID to execute if `tap_action_type` is `script`. |
| `show_temp` | boolean | Optional | Set to `true` to display the main entity value. |
| `temp_entity` | string | Optional | The entity ID to display as the main value (e.g., `sensor.temperature`). |
| `temp_unit` | string | Optional | The unit of measurement to display next to the value (e.g., `°C`). |
| `condensed` | boolean | Optional | Set to `true` to put the title and the main value on one line (title left, value right), with the indicators below: the card is then as tall as a button card (56px). When the line is too narrow for both, the value takes it and the title becomes a small badge on the card's top border (full title in the tooltip). Ignored when `show_temp` is `false`. |
| `badge_position` | string | Optional | With `condensed`: where the title badge sits on the top border, `left` (default) or `right`. |
| `status_items` | list | Optional | List of devices/entities to track. See **Status Items** below. |

Like any card, its size in a sections view is set with Home Assistant's standard `grid_options`.

### Status Items (`status_items`)
| Name | Type | Requirement | Description |
|---|---|---|---|
| `entity` | string | **Required** | The entity ID to monitor (e.g., `light.living_room`). |
| `type` | string | **Required** | Type of indicator to use. Accepts `icon` or `svg`. |
| `color_on` | string | Optional | Hex/RGB color code when the entity is in the 'On' state. |
| `color_off` | string | Optional | Hex/RGB color code when the entity is in the 'Off' state. |
| `color_unavailable` | string | Optional | Hex/RGB color code when the entity is `unavailable`, `unknown` or does not exist. Defaults to `#ef5350`. Set it to the same value as `color_off` to keep the previous behavior. |
| `icon_on` | string | Optional* | The MDI icon for the 'On' state. *(Required if `type: icon`)* |
| `icon_off` | string | Optional* | The MDI icon for the 'Off' state. *(Required if `type: icon`)* |
| `svg_content` | string | Optional* | JS template string returning an SVG. Use `${color}` to inject the state color dynamically. *(Required if `type: svg`)* |

## Examples

### Example 1: General Dashboard (Generic Example using Icons)

```yaml
type: custom:ha-plooum-multi-status-card
title: Living Room
navigation_path: /dashboard-home/living-room
show_temp: true
temp_entity: sensor.living_room_temperature
temp_unit: °C
status_items:
  - entity: light.living_room_lights
    type: icon
    icon_on: mdi:lightbulb
    icon_off: mdi:lightbulb-off
    color_on: "#fdd835"
    color_off: "#757575"
  - entity: switch.tv_plug
    type: icon
    icon_on: mdi:television
    icon_off: mdi:television-off
    color_on: "#4caf50"
    color_off: "#757575"
```

### Example 2: Dashboard with Custom SVG Indicators

```yaml
type: custom:ha-plooum-multi-status-card
title: Pond
tap_action_type: navigate
navigation_path: /dashboard-home/pond
temp_entity: sensor.pond_thermometer_temperature
temp_unit: °C
status_items:
  - entity: light.uv_pond
    type: svg
    color_on: '#ab47bc'
    color_off: '#757575'
    svg_content: |
      (color) => `
        <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: ${color};">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" opacity="0.3" />
          <text x="12" y="15.5" font-size="10" font-weight="900" font-family="Roboto, sans-serif" text-anchor="middle" fill="${color}">UV</text>
        </svg>
      `
```

### Example 3: Card with Toggle Tap Action

```yaml
type: custom:ha-plooum-multi-status-card
title: Ceiling Light
tap_action_type: toggle
tap_action_entity: light.ceiling_light
show_temp: false
status_items:
  - entity: light.ceiling_light
    type: icon
    icon_on: mdi:lightbulb
    icon_off: mdi:lightbulb-off
    color_on: "#fdd835"
    color_off: "#757575"
```
