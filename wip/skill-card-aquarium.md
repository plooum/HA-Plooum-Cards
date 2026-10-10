# Brief: habitat card (aquarium, pond, terrarium)

Implementation brief for a new card in this repo. It sums up a design session with the user; the decisions below are settled, don't reopen them without asking. Read [CLAUDE.md](../CLAUDE.md) first: card pattern, conventions, dev environment and testing loop all apply.

## Goal

One card = **one habitat** (an aquarium, a pond, a terrarium, a paludarium...). It shows **every sensor and every piece of equipment of that habitat at a glance**, in a **very compact** card, and makes a problem obvious without reading. The user has several aquariums and a pond, and the card must work just as well for a terrarium.

The user's current setup, for reference:

| Habitat | Data |
| :--- | :--- |
| Aquarium 150L | CO2 (on/off), air pump (on/off), temperature, light (%) |
| Aquarium 60L | air pump (on/off), temperature, light (on/off) |
| Aquarium 10L | light (on/off) |
| Pond | temperature, UV filter (on/off) |

## Naming

- Folder `src/cards/habitat/`, file `ha-plooum-habitat-card.js`, element `ha-plooum-habitat-card`, editor `ha-plooum-habitat-card-editor`.
- Display name "HA Plooum Habitat Card". "Habitat" rather than "aquarium" because the same card covers terrariums.
- This is a **new card**. Don't modify `ha-plooum-multi-status-card` (it overlaps in purpose, but user dashboards use it).

## Design (settled)

The design is the "header strip" variant: a **strip** at the top carries the habitat's state and its cause; the **body** below is neutral and always laid out the same way.

### Unfolded

```
+---------------------------------------------------+
| (o) 150L   All good                           [^] |  <- strip: severity icon, name, message, fold toggle
|---------------------------------------------------|
| 25.4°  24-26           68 %  60-80                |  <- measures: main one big, others small
| ===[####|##]===        ==[###|#]===               |  <- range bar: target band + marker
| [CO2] [Air] [Light 80 %] [UV off]                 |  <- actuators as chips, wrapping
+---------------------------------------------------+
```

### Folded (one line)

```
| /!\ 60L  Too warm · since 14:20        27.9°  o o . [v] |
```

Folded shows: severity icon, name, message (ellipsis when too long), main measure, one small dot per actuator (filled in its color = on, hollow = off, amber = unavailable), fold toggle.

### Strip

**Four severity levels**, each with its own icon so the meaning does not rely on color alone:

| Level | When | Example messages |
| :--- | :--- | :--- |
| `ok` | everything within range | `All good` |
| `info` | normal but notable state | `Night`, `Off` |
| `warn` | drifting, or an entity can't be reached | `Close to limit`, `UV unavailable · since 15:02` |
| `alert` | out of range, or a critical item is off or unavailable | `Too warm · since 14:20`, `Air off · since 09:12` |

- The message is the **most severe cause**, followed by `· since <time>` (from that entity's `last_changed`, formatted with the user's HA locale and time format; show a date when it's older than today). When there are several causes, append `· +N`. Order: `alert` > `warn` > `info` > `ok`; ties break by item order in the config.
- **Strip styles** (`strip_style`):
  - `quiet` (**default**): neutral background; only a non-`ok` state colors the icon and text, so a problem stands out by contrast.
  - `tinted`: pale background tint per level.
  - `solid`: full-color background, white text (for wall tablets).
- In `quiet` and `tinted`, an `alert` also colors the card border (danger color).
- Use HA theme variables (`--success-color`, `--warning-color`, `--error-color`, `--secondary-text-color`, `--divider-color`, `--card-background-color`...) so it follows themes and dark mode.

### Body

- **Measures** (temperature, humidity, pH...): the main one (`main: true`, or else the first measure) shows its value in large type with its target range next to it, then a thin **range bar**: green target band, plus a marker that turns red when out of range. Other measures are smaller, side by side, each with its own mini range bar. A measure without a range shows only its value.
- An **out-of-range value** is drawn in the danger color.
- **Actuators** (light, CO2, air pump, UV, heater, mister...): one chip each, in config order, wrapping. Filled in the role color = on; outlined and muted = off; amber with `?` = unavailable/unknown/missing. Dimmable light shows its %.
- Column order doesn't matter (user's words); what matters is that the card stays compact.

### Folding: manual and automatic

- `fold: auto | folded | unfolded`, default `auto`.
- `auto` folds when the card is narrow (`ResizeObserver`, default threshold `fold_below_width: 240` px). It also folds when the card is in a sections grid whose height is too small for the unfolded layout. Measure the size the parent gives the card, not its own content, to avoid a resize loop; in masonry views the height is content-driven, so only width applies.
- The fold toggle in the strip overrides the automatic choice at runtime. Persist that override per card in `localStorage`, wrapped in try/catch (see the floorplan card's `PALETTE_OPEN_KEY` for the repo's pattern). Key it by a stable card identity, such as the habitat name plus the main entity id.
- Provide `getCardSize()` and `getGridOptions()` (see the temp-humidity card): folded = 1 row; unfolded = enough rows for strip, measures and chips.

## Extensibility: the role registry

Adding a sensor type must be **one entry in one table**. Define a `ROLES` object at the top of the card file; everything (rendering, severity, editor choices, default icons and ranges) reads from it. Nothing else should switch on role names.

Each role:

```js
temperature: {
  kind: 'measure',           // 'measure' (numeric value) | 'actuator' (on/off, maybe dimmable)
  label: 'Temperature',
  icon: 'mdi:thermometer',
  color: 'var(--orange-color, #ff9800)',
  domains: ['sensor', 'input_number', 'number'],   // entity picker filter in the editor
  unit: '°C',                // fallback when the entity has no unit_of_measurement
  warn_margin: 0.5,          // inside the range but closer than this to a limit -> warn
  words: { high: 'Too warm', low: 'Too cold' },    // strip messages
  ranges: { aquarium: [24, 26], pond: [12, 22], terrarium: [24, 30] },  // default target per habitat type
},
light: {
  kind: 'actuator',
  label: 'Light',
  icon: 'mdi:lightbulb',
  color: 'var(--amber-color, #ffc107)',
  domains: ['light', 'switch', 'input_boolean', 'number', 'input_number', 'sensor'],
  dimmable: true,            // show % when the entity provides one (see "Reading states")
  night: true,               // when off and nothing worse: info "Night"
},
```

Initial registry (extend freely):

| Role | Kind | Notes |
| :--- | :--- | :--- |
| `temperature` | measure | `Too warm` / `Too cold` |
| `humidity` | measure | `Too humid` / `Too dry`; terrarium default 60–80 % |
| `ph` | measure | margin 0.2, no unit |
| `conductivity` | measure | µS/cm, TDS |
| `water_level` | measure | `Level high` / `Level low` |
| `light` | actuator | dimmable, `night` |
| `co2` | actuator | |
| `air` | actuator | air pump / air stone |
| `filter` | actuator | |
| `uv` | actuator | UV sterilizer (pond/aquarium) or UVB lamp (terrarium) |
| `heater` | actuator | heater, heat mat or basking lamp |
| `cooling` | actuator | fan, chiller |
| `mister` | actuator | misting or fogger (terrarium) |
| `pump` | actuator | return or wave pump |
| `feeder` | actuator | `button`/`script` domain: chip triggers it, never "off" |
| `custom` | either | everything comes from the item config (`kind`, `name`, `icon`, `color`, `unit`) |

**Habitat types** (`habitat: aquarium | pond | terrarium | paludarium`) set the card's default icon, the default ranges per role, and which roles the editor suggests first. They don't restrict anything.

## Configuration

```yaml
type: custom:ha-plooum-habitat-card
name: Aquarium 150L
habitat: aquarium            # aquarium | pond | terrarium | paludarium (default aquarium)
icon: mdi:fishbowl           # optional, default from habitat
strip_style: quiet           # quiet | tinted | solid (default quiet)
fold: auto                   # auto | folded | unfolded (default auto)
fold_below_width: 240        # px, auto mode only
items:
  - role: temperature
    entity: sensor.aquarium_150_temperature
    main: true               # optional: the big measure (default: first measure)
    min: 24                  # optional: target range (default from ROLES[role].ranges[habitat])
    max: 26
    warn_margin: 0.5         # optional override
  - role: co2
    entity: switch.aquarium_150_co2
  - role: air
    entity: switch.aquarium_150_air
    critical: true           # off or unavailable -> alert instead of info/warn
  - role: light
    entity: light.aquarium_150
  - role: custom
    kind: measure
    name: Nitrate
    icon: mdi:flask
    entity: sensor.aquarium_150_no3
    unit: mg/L
    max: 25
```

Item keys: `role` (required), `entity` (required), `name`, `icon`, `color`, `unit`, `main`, `min`, `max`, `warn_margin`, `critical`, `tap_action` (`toggle` default for actuators, `more-info` default for measures, `none`), `hold_action` (default `more-info`). Any of these overrides the role default.

Validate in `setConfig`: throw a clear error for an item without `role` or `entity`, or with an unknown role. A missing entity is **not** a config error: it renders as unavailable, like other cards in this repo.

## Severity rules

Computed per item, then the card takes the worst:

1. Entity missing, `unavailable` or `unknown` → `warn` "`<Label>` unavailable"; `alert` if `critical`.
2. Measure: non-numeric state → same as unavailable. Outside `[min, max]` → `alert` with the role's `high`/`low` word. Inside but within `warn_margin` of a limit → `warn` "Close to limit".
3. Actuator off and `critical` → `alert` "`<Label>` off".
4. Actuator with `night: true` off, and nothing worse → `info` "Night". All actuators off and no measure → `info` "Off".
5. Otherwise `ok` "All good".

Trend wording ("rising") is out of scope for v1 (it needs history).

## Reading states and acting

- Actuator on/off: `on` (or any state other than `off`, `closed`, `idle`, `unavailable` and `unknown`) means on. A `button`/`script` feeder is "ready" rather than on/off.
- Dimmable light %: `light` → `attributes.brightness / 255 × 100` (rounded) when on; `number`/`input_number`/`sensor` → its numeric state (0 = off).
- Tap on an actuator chip → `homeassistant.toggle` for toggleable domains, `light.toggle` for lights, `button.press` for buttons, `script.turn_on` for scripts. A light driven by a `number` isn't toggleable: open more-info instead.
- Hold, or tap on a measure → `hass-more-info` event.
- Tap on the strip's name → more-info of the main measure (or of the first item). The fold chevron is its own button.
- Chips and the fold toggle are real buttons (keyboard focus, `aria-label` with name and state).
- All UI strings in English (repo rule), using the entity's own translated state where HA provides one.

## Visual editor

Required. It follows the repo's editor pattern (`<Card>Editor` class, `config-changed` events, `ha-form` with `.computeLabel`, because `ha-form` ignores `label` keys):

- Top section (`ha-form`): name, habitat type (select), icon (`icon` selector), strip style (select), fold mode (select), fold width (number, shown only for `auto`).
- Items list: one collapsible row per item, showing role icon, name and entity. Each row has:
  - a **role** select, built from `ROLES` and sorted with the habitat type's suggested roles first;
  - an **entity** picker filtered by the role's `domains`;
  - an "Advanced" part with name, icon, color, unit, min/max (measures), warn margin, main (measures), critical, tap action;
  - for `custom`, the kind and the display fields.
- Add item (with a role picker), remove, move up/down.
- `getStubConfig(hass)`: an aquarium with a temperature sensor and a light picked from `hass.states` when found, so the card picker preview shows something real.

## Repo checklist

1. `src/cards/habitat/ha-plooum-habitat-card.js`: card + editor + guarded registration + `window.customCards` entry, `CARD_VERSION = '1.0.0'` and the console banner like the other cards.
2. Import line in `src/index.js`, then `npm run build` (the bundle is committed).
3. `docs/habitat.md` (English, same structure as `docs/multistatus.md`), a row and a section in `README.md` (**French**), a preview image in `docs/previews/` when possible.
4. Test entities in `dev/ha-config/configuration.yaml`, and the new rows in the CLAUDE.md test entities table. Suggested entities, reusing the existing `input_boolean.aquarium_*` where they fit:
   - Aquarium: `sensor.aquarium_temperature` (template from `input_number`), a dimmable `light.aquarium_light` (template light whose level is an `input_number`), with CO2, air and UV from the existing booleans.
   - Terrarium: `sensor.terrarium_temperature`, `sensor.terrarium_humidity`, `switch.terrarium_heat_lamp`, `switch.terrarium_mister`, `switch.terrarium_uvb`. One of them **becomes `unavailable`** through an `input_boolean.*_available`, like `switch.tv_plug`.
   - Pond: `sensor.pond_temperature`, `switch.pond_uv`.
5. A `/plooum-test/habitat` view in `dev/ha-config/dashboards/plooum-test.yaml`, plus one card in the `all` view. Cover:
   - the user's four habitats (150L with every role type, 60L, 10L light only with no measure, pond) and a terrarium;
   - every severity: in range, close to limit, too warm, too cold, unavailable, missing entity (`switch.does_not_exist`), critical off;
   - a non-numeric measure;
   - each `strip_style`;
   - `fold: folded`, and a narrow card that auto-folds (sections view with small `grid_options`);
   - a `custom` item.
6. Restart HA after editing `configuration.yaml` (`dev/ha.sh restart`).

## How to test

Follow CLAUDE.md's **Testing** section. In particular:

- Drive the built-in browser pane, since the user watches: `/plooum-test/habitat`, then the editor in `/plooum-edit/habitat?edit=1`.
- Change states with `dev/api.sh` and watch the strip react live: move the temperature across the limits, make an entity unavailable, turn off a critical actuator.
- Click chips and check the backing entity with `dev/api.sh GET states/...`.
- Editor: add, remove and reorder items, switch a role and check that the entity picker is re-filtered. Check every `config-changed` payload.
- Check the **phone width** (`resize_window` preset `mobile`): the user checks cards in the HA Android app. Auto-fold must kick in, and the folded line must not overflow.
- No console errors (`dev/shot.py` for a clean check).

## Out of scope for v1 (possible later)

- History-based extras: trend arrow and "rising" wording, a sparkline behind the main measure.
- "Next event" footer (needs `schedule` entities or declared times).
- A multi-habitat overview card (fan ⇄ grid, or a matrix of every habitat by role with a 24 h time scrubber). Both were prototyped and liked; the single card comes first.
