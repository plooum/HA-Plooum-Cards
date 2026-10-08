# TODO

Issues noticed while working on something else. Each item should be fixable on its own.

## Multi Status card

- [ ] **Editor labels show raw keys.** The `<ha-form>` schemas in `HaPlooumMultiStatusCardEditor` set a `label` key, but `ha-form` ignores it, so the editor shows `title`, `tap_action_type`, `icon_on`, `entity`… Pass `.computeLabel=${(s) => s.label || s.name}` to both `ha-form` elements (main form and per-item forms). Check it in `/plooum-edit/multistatus?edit=1`.
- [ ] **`grid_options` is documented wrongly.** [docs/multistatus.md](docs/multistatus.md) presents `grid_options` (`columns`, `rows`) as a layout option for the status indicators. The card never reads it: it is Home Assistant's generic card sizing option for sections views. Fix or remove that section and the `grid_options` lines in example 2.

## English translation

Cards and code must be in English (see CLAUDE.md, Conventions). These files still contain French UI strings and/or comments:

- [ ] `src/cards/multistatus/ha-plooum-multi-status-card.js`: editor labels, buttons ("Ajouter un équipement", "Supprimer"), select options, `setConfig` error ("Veuillez définir un titre"), stub config, card description in `window.customCards`, comments.
- [ ] `src/cards/cover/ha-plooum-cover-card.js`: comments.
- [ ] `src/cards/temp-humidity/ha-plooum-temp-humidity-card.js`: French strings and comments.
- [ ] `src/cards/gridicons/ha-plooum-gridicons-card.js`: French strings and comments.
- [ ] `src/cards/dpad/ha-plooum-dpad-card.js`: two CSS comments.
- [ ] `src/index.js`: header comment.

Changing a user-visible default (e.g. a stub title) does not break existing dashboards; renaming config keys would, so keep keys as they are.
