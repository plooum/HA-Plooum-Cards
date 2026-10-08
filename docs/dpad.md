# Ha Plooum D-Pad Card

`type: custom:ha-plooum-dpad-card`

A D-pad style remote control card for Home Assistant, optimized for camera PTZ navigation and other directional controls.

## Features
- **D-Pad Layout**: 5-button interface (Up, Down, Left, Right, and Center) optimized for remote controls and camera PTZ navigation.
- **Multiple Themes**: Choose between `Round`, `Square`, or `Minimalist` (transparent) visual styles.
- **Flexible Action Handling**: Configure each button to execute a script, toggle an entity, press a button/switch, or navigate to another view.
- **Fully Customizable**: Adjustable card size, icon size, padding, alignment, background color, and icon color.
- **Visual Editor**: Full support for Home Assistant's UI visual configuration editor.
- **Overflow Protection**: Robust grid implementation preventing oversized icons from shifting the layout.

## Configuration Parameters

### Global Settings
| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | `custom:ha-plooum-dpad-card` |
| `theme` | string | `round` | Visual theme style (`round`, `square`, or `minimal`). |
| `card_size` | string | `200px` | Total width and height of the remote container. |
| `icon_size` | string | `44px` | Size of the icons inside the buttons. |
| `card_padding` | string | `0` | Padding around the main card. |
| `card_alignment` | string | `center` | Alignment of the card (`left`, `center`, or `right`). |
| `bg_color` | string | `rgba(0, 0, 0, 0.3)` | Background color for round and square themes. |
| `icon_color` | string | `#ffffff` | Color of the icons. |

### Button Settings (`up`, `down`, `left`, `right`, `center`)
For each button (replace `<btn>` with `up`, `down`, `left`, `right`, or `center`), you can configure:
| Name | Type | Description |
| :--- | :--- | :--- |
| `<btn>_icon` | string | MDI icon name (e.g., `mdi:chevron-up`). |
| `<btn>_action_type` | string | Action to perform: `none`, `press`, `toggle`, `execute_script`, or `navigate`. |
| `<btn>_entity` | string | Target entity ID (required for `press` and `toggle`). |
| `<btn>_script` | string | Script entity ID (required for `execute_script`). |
| `<btn>_path` | string | Navigation path (required for `navigate`, e.g., `/lovelace/home`). |

## Examples

```yaml
type: custom:ha-plooum-dpad-card
theme: round
card_size: "220px"
icon_size: "40px"
card_padding: "10px"
card_alignment: center
bg_color: "rgba(0, 0, 0, 0.4)"
icon_color: "#ffffff"

# Up Button Example (Press a button/switch)
up_icon: mdi:chevron-up
up_action_type: press
up_entity: button.camera_up

# Center Button Example (Execute a script)
center_icon: mdi:camera-iris
center_action_type: execute_script
center_script: script.camera_snapshot
```
