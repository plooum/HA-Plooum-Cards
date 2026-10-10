# Ha Plooum Room Temp & Humidity Card

`type: custom:ha-plooum-temp-humidity-card`

A sleek, highly customizable Home Assistant Lovelace card designed to display room temperature and humidity readings in a compact layout with a main icon, customizable styling, and granular tap/hold actions.

## Description

The **Ha Plooum Room Temp & Humidity Card** offers a modern and space-efficient way to monitor temperature and humidity sensors in your Home Assistant dashboard. It supports fine-grained visual customization (padding, gaps, offset, colors, font sizes, decimal precision) and separate click/hold interactions for individual sensor rows as well as the card itself.

## Features

- **Main Icon Customization**: Add a prominent room icon with offset controls (X/Y axis), custom sizing, and color configuration.
- **Dual Sensor Display**: Dedicated rows for temperature and humidity sensors with customizable icons, precision decimals, and colors.
- **Granular Tap & Hold Actions**: Assign distinct `tap_action` and `hold_action` events for the card background, temperature row, and humidity row (`more-info`, `toggle`, `navigate`, `call-service`).
- **Flexible Styling**: Full control over padding, gaps, font sizes, icon sizes, and text color.
- **Visual UI Editor**: Fully built-in editor allowing configuration without typing raw YAML.
- **Grid & Masonry Friendly**: Optimized layout for section views and standard Lovelace grids.

## Configuration Parameters

### General Card Settings

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | Must be `custom:ha-plooum-temp-humidity-card`. |
| `title` | string | `"Title"` | Title text displayed at the top of the card. Leave empty to hide. |
| `title_font_size` | string | `"19px"` | Font size for the title (e.g. `18px`, `1.2rem`). |
| `title_margin_bottom` | string | `"3px"` | Bottom margin under the title. |
| `card_padding` | string | `"4px"` | Inner padding around the card. |
| `values_gap` | string | `"0px"` | Vertical space between the temperature and humidity rows. |
| `center_values` | boolean | `true` | Centers the values horizontally when set to `true`. |
| `condensed` | boolean | `false` | Puts the main icon, the title and the two values (stacked on the right) on one line: the card is then as tall as a button card (56px, one row in a sections view). When the line is too narrow, the icon and the values keep it and the title becomes a small badge on the card's top border (full title in the tooltip). In very narrow cells (e.g. four cards per row on a phone), the icon and the values shrink together, then the icon is hidden and only the values shrink, so they always stay inside the card. `card_padding`, `title_margin_bottom` and `center_values` are ignored. |
| `badge_position` | string | `"left"` | With `condensed`: where the title badge sits on the top border, `left` or `right`. |

### Main Icon Settings

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `main_icon` | string | `"mdi:sofa"` | MDI icon displayed on the left side. Leave empty to hide. |
| `main_icon_color` | string | `"#FFFFFF"` | Hex or CSS color for the main icon. |
| `main_icon_size` | string | `"42px"` | Size of the main icon. |
| `main_icon_offset_x` | string | `"0px"` | Horizontal alignment offset (e.g., `5px`, `-10px`). |
| `main_icon_offset_y` | string | `"0px"` | Vertical alignment offset (e.g., `2px`, `-4px`). |

### Temperature Settings

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `temp_entity` | string | **Optional** | Entity ID for temperature (e.g., `sensor.living_room_temperature`). |
| `show_temp_icon` | boolean | `true` | Whether to display the temperature row icon. |
| `temp_icon` | string | `"mdi:thermometer"` | Icon used for temperature. |
| `temp_color` | string | `"#E57373"` | Color for the temperature value and icon. |
| `temp_decimals` | number | `1` | Number of decimal places to display. |
| `temp_font_size` | string | `"13px"` | Font size for temperature text. |
| `temp_icon_size` | string | `"1.2em"` | Size of the temperature icon. |

### Humidity Settings

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `humidity_entity` | string | **Optional** | Entity ID for humidity (e.g., `sensor.living_room_humidity`). |
| `show_humidity_icon` | boolean | `true` | Whether to display the humidity row icon. |
| `humidity_icon` | string | `"mdi:water"` | Icon used for humidity. |
| `humidity_color` | string | `"#4FC3F7"` | Color for the humidity value and icon. |
| `humidity_decimals` | number | `0` | Number of decimal places to display. |
| `humidity_font_size` | string | `"13px"` | Font size for humidity text. |
| `humidity_icon_size` | string | `"1.2em"` | Size of the humidity icon. |

### Action Options (`tap_action`, `hold_action`)

Actions can be configured globally on the card or individually for the temperature and humidity rows (`temp_tap_action`, `temp_hold_action`, `humidity_tap_action`, `humidity_hold_action`).

| Action | Description | Additional Configuration |
| :--- | :--- | :--- |
| `none` | Disables touch action. | None |
| `more-info` | Opens the entity's details dialog. | `entity`: (Optional) Overrides default entity. |
| `toggle` | Toggles the state of a switch/light. | `entity`: Target entity ID. |
| `navigate` | Navigates to a Lovelace dashboard path. | `navigation_path`: e.g. `/lovelace/salon` |
| `call-service` | Calls a Home Assistant service or script. | `service`: e.g. `script.turn_on_heating`, `service_data`: map of params |

## Examples

### Basic Example

```yaml
type: custom:ha-plooum-temp-humidity-card
title: Living Room
temp_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
```

### Advanced Custom Example

```yaml
type: custom:ha-plooum-temp-humidity-card
title: Master Bedroom
title_font_size: 18px
title_margin_bottom: 4px
card_padding: 8px
values_gap: 2px
main_icon: mdi:bed
main_icon_color: "#FFFFFF"
main_icon_size: 44px
main_icon_offset_x: "0px"
main_icon_offset_y: "2px"
temp_entity: sensor.bedroom_temperature
temp_icon: mdi:thermometer
temp_color: "#FF8A65"
temp_decimals: 1
temp_font_size: 14px
temp_icon_size: 1.2em
temp_tap_action:
  action: more-info
humidity_entity: sensor.bedroom_humidity
humidity_icon: mdi:water-percent
humidity_color: "#29B6F6"
humidity_decimals: 0
humidity_font_size: 14px
humidity_icon_size: 1.2em
humidity_tap_action:
  action: navigate
  navigation_path: /lovelace/climate
tap_action:
  action: toggle
  entity: light.bedroom_light
```
