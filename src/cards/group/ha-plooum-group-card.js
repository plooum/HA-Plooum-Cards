import { LitElement, html, css, nothing } from "lit";

const CARD_VERSION = '1.0.0';

/*
 * A group of cards on a pane of frosted glass: a title, then the cards in a grid. The pane blurs what lies
 * behind it (the dashboard's background) and tints it with a translucent color, so groups stand out
 * without a border.
 *
 * The glass color comes from `glass_color`, otherwise from the theme's `plooum-group-color` variable,
 * otherwise black. The cards inside get a lighter background through the `--plooum-tile-background`
 * variable (read by the Plooum cards) and `--ha-card-background` (read by Home Assistant's cards).
 */

const DEFAULTS = {
  columns: 3,
  glass_opacity: 55,
  blur: 20,
  tile_background: 'rgba(255, 255, 255, 0.06)',
};

/* ==========================================================================
   MAIN CARD : ha-plooum-group-card
   ========================================================================== */
class HaPlooumGroupCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _cards: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-group-card-editor");
  }

  static getStubConfig() {
    return { title: 'Group', cards: [] };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    if (config.cards !== undefined && !Array.isArray(config.cards)) throw new Error("cards must be a list");
    const cardsChanged = !this.config || JSON.stringify(this.config.cards || []) !== JSON.stringify(config.cards || []);
    this.config = { ...config };
    if (cardsChanged) this._buildCards();
  }

  connectedCallback() {
    super.connectedCallback();
    if (!HaPlooumGroupCard._logged) {
      HaPlooumGroupCard._logged = true;
      console.info(
        `%c HA-PLOOUM-GROUP-CARD %c ${CARD_VERSION} `,
        'color: white; background: #03a9f4; font-weight: 700;',
        'color: #03a9f4; background: white; font-weight: 700;'
      );
    }
  }

  async _buildCards() {
    const configs = this.config.cards || [];
    const build = this._build = {};
    if (!configs.length) {
      this._cards = [];
      return;
    }
    if (!window.loadCardHelpers) return;
    const helpers = await window.loadCardHelpers();
    if (this._build !== build) return; // a newer config arrived meanwhile
    this._cards = configs.map((cardConfig) => {
      let el;
      try {
        el = helpers.createCardElement(cardConfig);
      } catch (err) {
        el = document.createElement("hui-error-card");
        el.setConfig({ type: "error", error: err.message, origConfig: cardConfig });
      }
      if (this.hass) el.hass = this.hass;
      // Lets a card ask to be rebuilt (Home Assistant's own cards do when their type loads late).
      el.addEventListener("ll-rebuild", (ev) => {
        ev.stopPropagation();
        this._buildCards();
      }, { once: true });
      return el;
    });
  }

  updated(changed) {
    if (changed.has("hass") && this._cards) {
      for (const el of this._cards) el.hass = this.hass;
    }
  }

  getCardSize() {
    const rows = Math.ceil((this.config.cards || []).length / Number(this._opt('columns')));
    return 1 + rows;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 3 };
  }

  _opt(key) {
    const v = this.config[key];
    return v === undefined || v === null || v === '' ? DEFAULTS[key] : v;
  }

  // The glass's background: the configured color, or the theme's, at glass_opacity.
  _glassBackground() {
    const opacity = Math.min(100, Math.max(0, Number(this._opt('glass_opacity'))));
    const color = this.config.glass_color || 'var(--plooum-group-color, #000)';
    return `color-mix(in srgb, ${color} ${opacity}%, transparent)`;
  }

  render() {
    if (!this.config) return nothing;
    const blur = Math.max(0, Number(this._opt('blur')));
    const filter = blur ? `blur(${blur}px) saturate(150%)` : 'none';
    const columns = Math.max(1, Number(this._opt('columns')));
    const style = [
      `--group-glass: ${this._glassBackground()}`,
      `--group-filter: ${filter}`,
      `--group-columns: ${columns}`,
      `--plooum-tile-background: ${this._opt('tile_background')}`,
    ].join('; ');
    const cards = this._cards || [];
    return html`
      <ha-card style=${style}>
        ${this.config.title ? html`<div class="title">${this.config.title}</div>` : nothing}
        ${cards.length
          ? html`<div class="grid">${cards.map((el) => html`<div class="cell">${el}</div>`)}</div>`
          : html`<div class="empty">Add cards to this group.</div>`}
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      ha-card {
        padding: 12px;
        border-radius: var(--ha-card-border-radius, 22px);
        background: var(--group-glass);
        backdrop-filter: var(--group-filter);
        -webkit-backdrop-filter: var(--group-filter);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-top-color: rgba(255, 255, 255, 0.16);
        box-shadow: none;
        /* Cards inside: Home Assistant's take the tile background too. */
        --ha-card-background: var(--plooum-tile-background);
        --ha-card-box-shadow: none;
        --ha-card-border-width: 0;
      }
      .title {
        margin: 0 4px 10px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(var(--group-columns), minmax(0, 1fr));
        gap: 8px;
      }
      .cell {
        min-width: 0;
      }
      .cell > * {
        display: block;
        height: 100%;
      }
      .empty {
        padding: 8px 4px;
        color: var(--secondary-text-color);
      }
    `;
  }
}

/* ==========================================================================
   EDITOR : ha-plooum-group-card-editor
   ========================================================================== */
const SCHEMA = [
  {
    type: 'grid', name: '', schema: [
      { name: 'title', selector: { text: {} } },
      { name: 'columns', selector: { number: { min: 1, max: 8, mode: 'box' } } },
    ],
  },
  {
    type: 'expandable', name: '', title: 'Glass', icon: 'mdi:blur', schema: [
      {
        type: 'grid', name: '', schema: [
          { name: 'glass_color', selector: { text: {} } },
          { name: 'glass_opacity', selector: { number: { min: 0, max: 100, unit_of_measurement: '%', mode: 'box' } } },
          { name: 'blur', selector: { number: { min: 0, max: 60, unit_of_measurement: 'px', mode: 'box' } } },
          { name: 'tile_background', selector: { text: {} } },
        ],
      },
    ],
  },
];

const LABELS = {
  title: 'Title',
  columns: `Columns (${DEFAULTS.columns})`,
  glass_color: 'Glass color (default: the theme\'s)',
  glass_opacity: `Glass opacity (${DEFAULTS.glass_opacity} %)`,
  blur: `Blur (${DEFAULTS.blur} px, 0 = none)`,
  tile_background: `Cards background (${DEFAULTS.tile_background})`,
};

class HaPlooumGroupCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      lovelace: { attribute: false },
      _config: { state: true },
      _selected: { state: true },
      _adding: { state: true },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  connectedCallback() {
    super.connectedCallback();
    // hui-card-picker and hui-card-element-editor are defined once a stack card editor has loaded.
    // The stack card itself loads lazily: wait for its class, then load its editor.
    if (!customElements.get('hui-card-element-editor') && window.loadCardHelpers) {
      window.loadCardHelpers()
        .then((helpers) => {
          helpers.createCardElement({ type: 'vertical-stack', cards: [] });
          return customElements.whenDefined('hui-vertical-stack-card');
        })
        .then(() => customElements.get('hui-vertical-stack-card').getConfigElement())
        .then(() => this.requestUpdate())
        .catch(() => {});
    }
  }

  _emit(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }

  _cards() {
    return [...(this._config.cards || [])];
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    const config = { ...ev.detail.value };
    for (const key of Object.keys(config)) {
      if (config[key] === '' || config[key] === undefined || config[key] === null) delete config[key];
    }
    if (this._config.cards) config.cards = this._config.cards;
    this._emit(config);
  }

  _moveCard(index, delta) {
    const cards = this._cards();
    const to = index + delta;
    if (to < 0 || to >= cards.length) return;
    [cards[index], cards[to]] = [cards[to], cards[index]];
    this._emit({ ...this._config, cards });
  }

  _removeCard(index) {
    const cards = this._cards();
    cards.splice(index, 1);
    if (this._selected === index) this._selected = undefined;
    this._emit({ ...this._config, cards });
  }

  _cardPicked(ev) {
    ev.stopPropagation();
    const card = ev.detail.config;
    const cards = [...this._cards(), card];
    this._adding = false;
    this._selected = cards.length - 1;
    this._emit({ ...this._config, cards });
  }

  _cardEdited(ev) {
    ev.stopPropagation();
    const cards = this._cards();
    cards[this._selected] = ev.detail.config;
    this._emit({ ...this._config, cards });
  }

  static label(card) {
    const type = String(card.type || 'card').replace(/^custom:/, '');
    const name = card.name || card.title || card.entity || '';
    return name ? `${name} · ${type}` : type;
  }

  _renderBack(title) {
    return html`
      <div class="nav">
        <ha-icon-button .path=${'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z'} label="Back"
          @click=${() => { this._selected = undefined; this._adding = false; }}></ha-icon-button>
        <span>${title}</span>
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return nothing;

    if (this._adding) {
      return html`
        ${this._renderBack('Add a card')}
        <hui-card-picker .hass=${this.hass} .lovelace=${this.lovelace} @config-changed=${this._cardPicked}></hui-card-picker>
      `;
    }

    const cards = this._cards();
    if (this._selected !== undefined && cards[this._selected]) {
      return html`
        ${this._renderBack(HaPlooumGroupCardEditor.label(cards[this._selected]))}
        <hui-card-element-editor .hass=${this.hass} .lovelace=${this.lovelace} .value=${cards[this._selected]}
          @config-changed=${this._cardEdited}></hui-card-element-editor>
      `;
    }

    const { cards: _cards, ...options } = this._config;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${options}
        .schema=${SCHEMA}
        .computeLabel=${(s) => LABELS[s.name] || s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="cards-title">Cards</div>
      ${cards.map((card, index) => html`
        <div class="card-row">
          <span class="card-label">${HaPlooumGroupCardEditor.label(card)}</span>
          <ha-icon-button .path=${'M7,15L12,10L17,15H7Z'} label="Move up" ?disabled=${index === 0}
            @click=${() => this._moveCard(index, -1)}></ha-icon-button>
          <ha-icon-button .path=${'M7,10L12,15L17,10H7Z'} label="Move down" ?disabled=${index === cards.length - 1}
            @click=${() => this._moveCard(index, 1)}></ha-icon-button>
          <ha-icon-button .path=${'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z'} label="Edit"
            @click=${() => { this._selected = index; }}></ha-icon-button>
          <ha-icon-button .path=${'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z'} label="Remove"
            @click=${() => this._removeCard(index)}></ha-icon-button>
        </div>
      `)}
      <button class="add" @click=${() => { this._adding = true; }}>+ Add a card</button>
      <div class="hint">The glass blurs the dashboard's background behind the group. Set <code>plooum-group-color</code> in a theme to give every group the same color.</div>
    `;
  }

  static get styles() {
    return css`
      .nav {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        font-weight: 500;
      }
      .cards-title {
        margin: 16px 0 8px;
        font-weight: 500;
      }
      .card-row {
        display: flex;
        align-items: center;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 0 4px 0 12px;
        margin-bottom: 6px;
        --mdc-icon-button-size: 36px;
      }
      .card-label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .add {
        width: 100%;
        padding: 8px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-color);
        cursor: pointer;
        font: inherit;
      }
      .hint {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        padding-top: 8px;
      }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get('ha-plooum-group-card')) {
  customElements.define('ha-plooum-group-card', HaPlooumGroupCard);
}
if (!customElements.get('ha-plooum-group-card-editor')) {
  customElements.define('ha-plooum-group-card-editor', HaPlooumGroupCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-group-card')) {
  window.customCards.push({
    type: 'ha-plooum-group-card',
    name: 'Ha Plooum Group Card',
    description: 'A group of cards on a pane of frosted glass: a title, then the cards in a grid, over a blurred and tinted background.',
    preview: true,
  });
}
