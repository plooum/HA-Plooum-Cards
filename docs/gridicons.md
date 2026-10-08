# HA Plooum GridIcons Card

`type: custom:ha-plooum-gridicons-card`

A lightweight, modern custom Home Assistant card designed to display multiple entity icons side-by-side inside a single compact pill container. Perfect for grouping related smart devices (robot mowers, pumps, lights, switches, scripts) into a space-saving row without cluttering your dashboard.

## Features

- **Compact Pill Design**: Group multiple controls into a single semi-transparent row.
- **Dynamic State Colors**: Customize active and inactive colors per icon based on entity state.
- **Tap & Hold Actions**: Independent short press and long press actions supporting:
  - `toggle`: Toggle entity state directly.
  - `navigate`: Open dashboard paths or sub-pages.
  - `execute_script`: Trigger Home Assistant scripts.
  - `none`: Passive icon indicator.
- **Built-in Visual Editor**: Native graphical UI editor with entity, icon, path, and color pickers.
- **Flexible Layout**: Adjustable icon sizing and CSS alignment (`space-around`, `space-between`, `center`, `flex-start`, `flex-end`).

## Configuration Parameters

### Card Options

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:ha-plooum-gridicons-card` |
| `icon_size` | string | `31px` | Size of icons (e.g., `28px`, `32px`, `2rem`) |
| `alignment` | string | `space-around` | Flexbox alignment (`space-around`, `space-between`, `center`, `flex-start`, `flex-end`) |
| `icons` | list | `[]` | List of icon configuration objects |

### Icon Options (`icons` array)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entity` | string | Optional | Target entity ID (e.g., `vacuum.mower_robot`) |
| `icon` | string | `mdi:help-circle` | MDI icon string (e.g., `mdi:robot-mower`) |
| `active_color` | string | `#FFC107` | Hex color when entity state is active (not `off` / `unavailable`) |
| `inactive_color` | string | `#FFFFFF` | Hex color when entity state is inactive |
| `tap_action_type` | string | `toggle` | Short tap action: `toggle`, `navigate`, `execute_script`, or `none` |
| `tap_action_path` | string | Optional | Target path if `tap_action_type` is set to `navigate` |
| `tap_action_script` | string | Optional | Script ID (`script.my_script`) if `tap_action_type` is set to `execute_script` |
| `hold_action_type` | string | `none` | Long press action: `toggle`, `navigate`, `execute_script`, or `none` |
| `hold_action_path` | string | Optional | Target path if `hold_action_type` is set to `navigate` |
| `hold_action_script` | string | Optional | Script ID if `hold_action_type` is set to `execute_script` |

## Examples

### Basic Example

```yaml
type: custom:ha-plooum-gridicons-card
icon_size: 31px
alignment: space-around
icons:
  - entity: lawn_mower.robot_mower
    icon: mdi:robot-mower
    active_color: '#66bb6a'
    inactive_color: '#ffffff'
    tap_action_type: toggle
  - entity: switch.pool_pump
    icon: mdi:pump
    active_color: '#00bcd4'
    inactive_color: '#ffffff'
    tap_action_type: toggle
```

### Advanced Example with Tap, Hold, and Navigation

```yaml
type: custom:ha-plooum-gridicons-card
icon_size: 28px
alignment: space-between
icons:
  - entity: vacuum.robot_mower
    icon: mdi:robot-mower
    active_color: '#4CAF50'
    inactive_color: '#9E9E9E'
    tap_action_type: toggle
    hold_action_type: navigate
    hold_action_path: /lovelace/garden

  - entity: switch.pool_pump
    icon: mdi:pump
    active_color: '#00BCD4'
    inactive_color: '#9E9E9E'
    tap_action_type: toggle

  - entity: script.park_all_robots
    icon: mdi:home-import-outline
    active_color: '#FF9800'
    inactive_color: '#FFFFFF'
    tap_action_type: execute_script
    tap_action_script: script.park_all_robots

  - icon: mdi:cog
    active_color: '#FFFFFF'
    inactive_color: '#FFFFFF'
    tap_action_type: navigate
    tap_action_path: /config/dashboard
```
