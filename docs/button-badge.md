# Ha Plooum Button Badge Card

`type: custom:ha-plooum-buttonbadge-card`

A custom Home Assistant button card that allows you to display a customizable button with an integrated floating badge, icon sizing, text padding, and flexible touch actions (tap, hold, navigate, script execution, or toggle).

## Features

* **Custom Button & Badge Integration**: Display a main button with an optional badge positioned in the top-right corner.
* **Dynamic Styling**:
  * Customize text size (`font_size`) and left text offset/padding (`text_padding_left`).
  * Adjust icon sizes for both the main button (`icon_size`) and the badge (`badge_icon_size`).
  * Dynamic active/inactive state colors for both the main icon/text and the badge background.
* **Flexible Action Handling**: Configure independent actions for **Tap** and **Hold** events on both the main button and the badge:
  * Toggle entities (`toggle`)
  * Navigate to dashboards/views using Home Assistant's native navigation selector (`navigate`)
  * Execute scripts (`execute_script`)
  * No action (`none`)
* **Visual Editor**: Full support for the Home Assistant visual card editor (using built-in pickers and selectors).

## Configuration Parameters

### Main Card Parameters

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | Must be `custom:ha-plooum-buttonbadge-card`. |
| `entity` | string | `""` | The main entity to track state (determines active/inactive colors). |
| `name` | string | `""` | The text displayed on the button. |
| `icon` | string | `""` | The icon displayed on the button (e.g., `mdi:lightbulb`). |
| `font_size` | string | `"13px"` | Font size of the button text (e.g., `13px`, `1rem`). |
| `icon_size` | string | `"24px"` | Size of the main button icon. |
| `icon_padding_left` | string | `"-4px"` | Left offset/padding for the main icon. |
| `icon_align` | string | `"flex-start"` | Alignment of the icon (`flex-start` for left, `center` for centering, especially useful when there is no text). |
| `text_padding_left` | string | `"24px"` | Left padding/offset for the button text to avoid overlapping the icon. |
| `active_color` | string | `"#FFC107"` | Color of the icon and text when the entity is active. |
| `inactive_color` | string | `"#FFFFFF"` | Color of the icon and text when the entity is inactive or unavailable. |

### Badge Parameters (Optional)

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `badge_entity` | string | `""` | The entity tracked by the badge for its active/inactive background. |
| `badge_icon` | string | `""` | The icon displayed inside the badge. |
| `badge_icon_size` | string | `"20px"` | Size of the badge icon. |
| `badge_active_color` | string | `"#FFC107"` | Badge background color when active. |
| `badge_inactive_color` | string | `"rgba(255, 255, 255, 0.25)"` | Badge background color when inactive. |

### Actions Parameters

For both main and badge actions, replace `<prefix>` with either `tap_action`, `hold_action`, `badge_tap_action`, or `badge_hold_action`:

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `<prefix>_type` | string | `"toggle"` | Action type: `toggle`, `navigate`, `execute_script`, or `none`. |
| `<prefix>_path` | string | `""` | Destination path if type is `navigate` (uses native navigation selector). |
| `<prefix>_script` | string | `""` | Script entity ID to execute if type is `execute_script`. |

## Examples

```yaml
type: custom:ha-plooum-buttonbadge-card
entity: light.living_room
name: Living Room
icon: mdi:ceiling-light
font_size: "14px"
icon_size: "26px"
text_padding_left: "28px"
active_color: "#FFC107"
inactive_color: "#9E9E9E"
tap_action_type: toggle
hold_action_type: navigate
hold_action_path: /lovelace/living-room
```

```yaml
type: custom:ha-plooum-buttonbadge-card
entity: switch.coffee_machine
name: Coffee
icon: mdi:coffee
font_size: "13px"
icon_size: "24px"
badge_entity: sensor.coffee_beans_level
badge_icon: mdi:alert
badge_icon_size: "18px"
badge_active_color: "#F44336"
badge_inactive_color: "rgba(255, 255, 255, 0.2)"
tap_action_type: toggle
badge_tap_action_type: execute_script
badge_tap_action_script: script.refill_coffee_notification
```
