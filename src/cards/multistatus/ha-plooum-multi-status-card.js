import { LitElement, html, css } from 'lit';

const CARD_VERSION = '1.3.0';

// States treated as "unavailable" (on top of an entity that doesn't exist).
const UNAVAILABLE_STATES = ['unavailable', 'unknown'];
const DEFAULT_COLOR_ON = '#66bb6a';
const DEFAULT_COLOR_OFF = '#757575';
const DEFAULT_COLOR_UNAVAILABLE = '#ef5350';

class HaPlooumMultiStatusCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _titleAsBadge: { state: true },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-MULTI-STATUS-CARD %c ${CARD_VERSION} `,
      'color: white; background: #03a9f4; font-weight: 700;',
      'color: #03a9f4; background: white; font-weight: 700;'
    );
    this._resizeObserver = new ResizeObserver(() => this._fitTitle());
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) this._resizeObserver.disconnect();
  }

  updated() {
    this._fitTitle();
  }

  get _condensed() {
    return !!(this.config && this.config.condensed && this.config.show_temp !== false);
  }

  // Condensed layout: the title moves into a badge on the top border when it no longer fits
  // beside the main value. The hidden .measure span gives the title's natural width, so the
  // decision doesn't depend on the current layout (no flip-flop between the two layouts).
  _fitTitle() {
    if (!this._condensed) {
      if (this._titleAsBadge) this._titleAsBadge = false;
      return;
    }
    const root = this.shadowRoot;
    const head = root && root.querySelector('.head');
    const measure = root && root.querySelector('.measure');
    const temp = root && root.querySelector('.temp');
    if (!head || !measure || !temp || !head.clientWidth) return;
    const needed = measure.offsetWidth + 8 + temp.offsetWidth;
    const asBadge = needed > head.clientWidth;
    if (asBadge !== this._titleAsBadge) this._titleAsBadge = asBadge;
  }

  setConfig(config) {
    if (!config || !config.title) {
      throw new Error('Please define a title (title)');
    }
    this.config = config;
  }

  getCardSize() {
    return 1;
  }

  static getStubConfig() {
    return { 
      title: 'My Device', 
      tap_action_type: 'navigate',
      navigation_path: '/dashboard-maison', 
      temp_entity: 'sensor.temperature',
      temp_unit: '°C',
      show_temp: true,
      status_items: []
    };
  }

  static getConfigElement() {
    return document.createElement('ha-plooum-multi-status-card-editor');
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const title = this.config.title || '';
    const tempEntityId = this.config.temp_entity;
    const tempUnit = this.config.temp_unit || '°C';
    const showTemp = this.config.show_temp !== false;
    const statusItems = this.config.status_items || [];
    
    // Tap action handling
    const actionType = this.config.tap_action_type || 'navigate';
    const cursorStyle = actionType === 'none' ? 'default' : 'pointer';

    let tempString = '-- ' + tempUnit;
    if (tempEntityId && this.hass.states && this.hass.states[tempEntityId]) {
      let t = parseFloat(this.hass.states[tempEntityId].state);
      if (!isNaN(t)) {
        tempString = t.toFixed(1) + ' ' + tempUnit;
      }
    }

    const condensed = this._condensed;
    const gridStyle = condensed
      ? ''
      : showTemp
        ? 'grid-template-areas: "title" "temp" "status"; grid-template-rows: auto auto auto;'
        : 'grid-template-areas: "title" "status"; grid-template-rows: auto auto;';
    const cardClass = condensed
      ? `condensed ${this._titleAsBadge ? 'badge-title' : ''} ${this.config.badge_position === 'right' ? 'badge-right' : ''}`
      : showTemp ? '' : 'compact';

    return html`
      <div 
        class="card ${cardClass}" 
        style="${gridStyle} cursor:${cursorStyle};" 
        title="${condensed && this._titleAsBadge ? title : ''}"
        @click="${this._handleAction}"
      >
        ${condensed
          ? html`
              <div class="head">
                <div class="title">${title}</div>
                <div class="temp">${tempString}</div>
                <span class="title measure" aria-hidden="true">${title}</span>
              </div>`
          : html`<div class="title">${title}</div>${showTemp ? html`<div class="temp">${tempString}</div>` : ''}`}
        <div class="status">
          ${statusItems.map(item => {
            const entState = this.hass.states ? this.hass.states[item.entity] : null;
            const isUnavailable = !entState || UNAVAILABLE_STATES.includes(entState.state);
            const isOn = !isUnavailable && entState.state === 'on';
            let color;
            if (isUnavailable) {
              color = item.color_unavailable || DEFAULT_COLOR_UNAVAILABLE;
            } else {
              color = isOn ? (item.color_on || DEFAULT_COLOR_ON) : (item.color_off || DEFAULT_COLOR_OFF);
            }
            const tooltip = this._itemTooltip(item, entState);
            
            if (item.type === 'svg') {
              let evaluatedSvg = '';
              
              if (item.svg_content) {
                let rawSvg = item.svg_content;
                rawSvg = rawSvg.replace(/^[\s\S]*?=>\s*`?/, '').replace(/`?\s*$/, '');
                evaluatedSvg = rawSvg.replace(/\$\{color\}/g, color);
              } else {
                evaluatedSvg = `
                  <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: ${color};">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" opacity="0.3" />
                  </svg>
                `;
              }
              
              return html`<div style="display: flex; align-items: center;" title="${tooltip}" .innerHTML="${evaluatedSvg}"></div>`;
            } else {
              const icon = isOn ? (item.icon_on || 'mdi:power') : (item.icon_off || 'mdi:power-off');
              return html`
                <ha-icon 
                  icon="${icon}" 
                  title="${tooltip}"
                  style="color: ${color}; --mdc-icon-size: ${item.size || '20px'};">
                </ha-icon>
              `;
            }
          })}
        </div>
      </div>
    `;
  }

  _itemTooltip(item, entState) {
    if (!entState) {
      return `${item.entity || '?'}: entity not found`;
    }
    const name = entState.attributes.friendly_name || item.entity;
    // formatEntityState translates the state into the user's language (e.g. "Unavailable").
    const state = this.hass.formatEntityState ? this.hass.formatEntityState(entState) : entState.state;
    return `${name}: ${state}`;
  }

  _handleAction() {
    if (!this.config || !this.hass) return;

    const actionType = this.config.tap_action_type || 'navigate';

    switch (actionType) {
      case 'navigate':
        if (this.config.navigation_path) {
          history.pushState(null, '', this.config.navigation_path);
          window.dispatchEvent(new CustomEvent('location-changed', {
            detail: { replace: false },
            bubbles: true,
            composed: true,
          }));
        }
        break;

      case 'toggle':
        if (this.config.tap_action_entity) {
          // Use the generic homeassistant.toggle service
          this.hass.callService('homeassistant', 'toggle', {
            entity_id: this.config.tap_action_entity
          });
        }
        break;

      case 'script':
        if (this.config.tap_action_script) {
          const scriptId = this.config.tap_action_script;
          const domain = scriptId.split('.')[0];
          this.hass.callService(domain, 'turn_on', {
            entity_id: scriptId
          });
        }
        break;

      case 'none':
      default:
        // Do nothing
        break;
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .card {
        padding: 8px 12px;
        border-radius: 20px;
        background-color: rgba(0, 0, 0, 0.35);
        box-shadow: none;
        border: none;
        display: grid;
        row-gap: 4px;
        box-sizing: border-box;
      }
      /* Without the main value line, match the height of the other button cards (56px). */
      .card.compact {
        min-height: 56px;
        padding: 4px 12px;
        row-gap: 2px;
        align-content: center;
      }
      .title {
        justify-self: center;
        align-self: center;
        font-size: 13px;
        font-weight: 500;
        color: #ffffff;
        letter-spacing: 0.5px;
      }
      .temp {
        justify-self: center;
        align-self: center;
        font-size: 16px;
        font-weight: normal;
        color: rgba(255, 255, 255, 0.8);
      }
      /* Condensed: title and value on one line, same height as the other button cards (56px). */
      .card.condensed {
        position: relative;
        height: 56px;
        padding: 4px 14px;
        row-gap: 2px;
        align-content: center;
      }
      .head {
        position: relative;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
      }
      .head .title,
      .head .temp {
        flex: none;
        white-space: nowrap;
        line-height: 20px;
      }
      .head .measure {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
      }
      /* Not enough room for both: the value takes the line, the title becomes a tab on the top border. */
      .badge-title .head {
        justify-content: center;
      }
      .badge-title .head .title:not(.measure) {
        position: absolute;
        top: -14px;
        left: 4px;
        max-width: calc(100% - 8px);
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        padding: 0 7px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.6);
        font-size: 10px;
        line-height: 16px;
        letter-spacing: 0.3px;
      }
      .badge-right .head .title:not(.measure) {
        left: auto;
        right: 4px;
      }
      .status {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    `;
  }
}

// -------------------------------------------------------------------------
// Visual editor
// -------------------------------------------------------------------------
class HaPlooumMultiStatusCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  setConfig(config) {
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const actionType = this.config.tap_action_type || 'navigate';

    // Build the editor schema dynamically
    const schema = [
      { name: 'title', label: 'Card title', selector: { text: {} } },
      { 
        name: 'tap_action_type', 
        label: 'Action when the card is tapped', 
        selector: { 
          select: { 
            options: [
              { value: 'navigate', label: 'Navigate to another page' },
              { value: 'toggle', label: 'Toggle an entity' },
              { value: 'script', label: 'Run a script' },
              { value: 'none', label: 'No action' }
            ] 
          } 
        } 
      }
    ];

    // Conditional fields depending on the chosen action
    if (actionType === 'navigate') {
      schema.push({ name: 'navigation_path', label: 'Navigation path (e.g. /dashboard/view1)', selector: { text: {} } });
    } else if (actionType === 'toggle') {
      schema.push({ name: 'tap_action_entity', label: 'Entity to toggle (switch, light...)', selector: { entity: {} } });
    } else if (actionType === 'script') {
      schema.push({ name: 'tap_action_script', label: 'Script to run', selector: { entity: { domain: 'script' } } });
    }

    schema.push({ name: 'show_temp', label: 'Show the main value line', selector: { boolean: {} } });

    if (this.config.show_temp !== false) {
      schema.push(
        { name: 'condensed', label: 'Condensed (title and value on one line)', selector: { boolean: {} } },
        ...(this.config.condensed ? [{
          name: 'badge_position',
          label: 'Title badge position (when the line is too narrow)',
          selector: { select: { mode: 'dropdown', options: [
            { value: 'left', label: 'Top left' },
            { value: 'right', label: 'Top right' }
          ] } }
        }] : []),
        { 
          name: 'temp_entity', 
          label: 'Main entity (e.g. temperature)', 
          selector: { entity: { domain: 'sensor' } } 
        },
        { name: 'temp_unit', label: 'Unit (e.g. °C)', selector: { text: {} } }
      );
    }

    const statusItems = this.config.status_items || [];

    return html`
      <div class="editor">
        <ha-form
          .hass="${this.hass}"
          .data="${this.config}"
          .schema="${schema}"
          .computeLabel=${(s) => s.label || s.name}
          @value-changed="${this._formChanged}"
        ></ha-form>

        <hr class="divider" />

        <div class="section-header">
          <h3>Status items (Devices)</h3>
          <button class="btn-add" @click="${this._addItem}">+ Add a device</button>
        </div>

        <div class="items-container">
          ${statusItems.map((item, index) => {
            const isSvg = item.type === 'svg';
            
            const itemSchema = [
              { name: 'entity', label: 'Entity (e.g. switch, light...)', selector: { entity: {} } },
              { 
                name: 'type', 
                label: "Display type", 
                selector: { 
                  select: { 
                    options: [
                      { value: 'icon', label: 'Standard icon (MDI)' },
                      { value: 'svg', label: 'Custom SVG' }
                    ] 
                  } 
                } 
              },
            ];

            if (isSvg) {
              itemSchema.push(
                { 
                  name: 'svg_content', 
                  label: 'Raw SVG code (e.g. <svg ...>${color}</svg>)', 
                  selector: { text: { multiline: true } } 
                }
              );
            } else {
              itemSchema.push(
                { name: 'icon_on', label: 'Icon (On)', selector: { icon: {} } },
                { name: 'icon_off', label: 'Icon (Off)', selector: { icon: {} } }
              );
            }

            return html`
              <div class="item-card">
                <div class="item-header">
                  <span>Device #${index + 1} (${item.type || 'icon'})</span>
                  <button class="btn-delete" @click="${() => this._deleteItem(index)}">Delete</button>
                </div>

                <ha-form
                  .hass="${this.hass}"
                  .data="${item}"
                  .schema="${itemSchema}"
                  .computeLabel=${(s) => s.label || s.name}
                  @value-changed="${e => this._itemFormChanged(index, e)}"
                ></ha-form>

                <div class="color-pickers-row">
                  <div class="color-field">
                    <label>Color (On)</label>
                    <div class="color-picker-wrapper">
                      <input 
                        type="color" 
                        .value="${item.color_on || '#66bb6a'}" 
                        @input="${e => this._updateColor(index, 'color_on', e.target.value)}"
                      />
                      <span>${item.color_on || '#66bb6a'}</span>
                    </div>
                  </div>

                  <div class="color-field">
                    <label>Color (Off)</label>
                    <div class="color-picker-wrapper">
                      <input 
                        type="color" 
                        .value="${item.color_off || '#757575'}" 
                        @input="${e => this._updateColor(index, 'color_off', e.target.value)}"
                      />
                      <span>${item.color_off || '#757575'}</span>
                    </div>
                  </div>

                  <div class="color-field">
                    <label>Color (Unavailable)</label>
                    <div class="color-picker-wrapper">
                      <input 
                        type="color" 
                        .value="${item.color_unavailable || DEFAULT_COLOR_UNAVAILABLE}" 
                        @input="${e => this._updateColor(index, 'color_unavailable', e.target.value)}"
                      />
                      <span>${item.color_unavailable || DEFAULT_COLOR_UNAVAILABLE}</span>
                    </div>
                  </div>
                </div>

              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _formChanged(ev) {
    if (!this.config || !this.hass) return;
    const newConfig = {
      ...this.config,
      ...ev.detail.value,
    };
    this.config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _itemFormChanged(index, ev) {
    if (!this.config || !this.hass) return;
    const statusItems = [...(this.config.status_items || [])];
    statusItems[index] = {
      ...statusItems[index],
      ...ev.detail.value,
    };
    const newConfig = {
      ...this.config,
      status_items: statusItems,
    };
    this.config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _updateColor(index, colorKey, value) {
    if (!this.config || !this.hass) return;
    const statusItems = [...(this.config.status_items || [])];
    statusItems[index] = {
      ...statusItems[index],
      [colorKey]: value,
    };
    const newConfig = {
      ...this.config,
      status_items: statusItems,
    };
    this.config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _addItem() {
    if (!this.config || !this.hass) return;
    const statusItems = [...(this.config.status_items || [])];
    statusItems.push({
      entity: '',
      type: 'icon',
      icon_on: 'mdi:power',
      icon_off: 'mdi:power-off',
      svg_content: '',
      color_on: '#66bb6a',
      color_off: '#757575',
      color_unavailable: DEFAULT_COLOR_UNAVAILABLE
    });
    const newConfig = {
      ...this.config,
      status_items: statusItems,
    };
    this.config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _deleteItem(index) {
    if (!this.config || !this.hass) return;
    const statusItems = [...(this.config.status_items || [])];
    statusItems.splice(index, 1);
    const newConfig = {
      ...this.config,
      status_items: statusItems,
    };
    this.config = newConfig;
    this._fireConfigChanged(newConfig);
  }

  _fireConfigChanged(newConfig) {
    const customEvent = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
  }

  static get styles() {
    return css`
      .editor {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 4px 0;
      }
      .divider {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 8px 0;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .section-header h3 {
        margin: 0;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .btn-add {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      }
      .items-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .item-card {
        background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.03);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: 12px;
        color: var(--primary-text-color);
      }
      .btn-delete {
        background: transparent;
        color: var(--error-color, #db4437);
        border: none;
        cursor: pointer;     
        font-size: 12px;
      }
      .color-pickers-row {
        display: flex;
        gap: 16px;
        margin-top: 4px;
      }
      .color-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      .color-field label {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .color-picker-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--secondary-background-color);
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
      }
      .color-picker-wrapper input[type="color"] {
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        background: transparent;
        padding: 0;
      }
      .color-picker-wrapper span {
        font-size: 12px;
        font-family: monospace;
        color: var(--primary-text-color);
      }
    `;
  }
}

if (!customElements.get('ha-plooum-multi-status-card')) {
  customElements.define('ha-plooum-multi-status-card', HaPlooumMultiStatusCard);
}
if (!customElements.get('ha-plooum-multi-status-card-editor')) {
  customElements.define('ha-plooum-multi-status-card-editor', HaPlooumMultiStatusCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-multi-status-card')) {
  window.customCards.push({
    type: 'ha-plooum-multi-status-card',
    name: 'Ha Plooum Multi Status Card',
    description: 'A custom card to display several statuses and icons.',
    preview: false,
  });
}