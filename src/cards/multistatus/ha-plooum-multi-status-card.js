import { LitElement, html, css } from 'lit';

const CARD_VERSION = '1.1.0';

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
    };
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-MULTI-STATUS-CARD %c ${CARD_VERSION} `,
      'color: white; background: #03a9f4; font-weight: 700;',
      'color: #03a9f4; background: white; font-weight: 700;'
    );
  }

  setConfig(config) {
    if (!config || !config.title) {
      throw new Error('Veuillez définir un titre (title)');
    }
    this.config = config;
  }

  getCardSize() {
    return 1;
  }

  static getStubConfig() {
    return { 
      title: 'Mon Équipement', 
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
    
    // Gestion de l'action au clic
    const actionType = this.config.tap_action_type || 'navigate';
    const cursorStyle = actionType === 'none' ? 'default' : 'pointer';

    let tempString = '-- ' + tempUnit;
    if (tempEntityId && this.hass.states && this.hass.states[tempEntityId]) {
      let t = parseFloat(this.hass.states[tempEntityId].state);
      if (!isNaN(t)) {
        tempString = t.toFixed(1) + ' ' + tempUnit;
      }
    }

    const gridStyle = showTemp 
      ? 'grid-template-areas: "title" "temp" "status"; grid-template-rows: auto auto auto;'
      : 'grid-template-areas: "title" "status"; grid-template-rows: auto auto;';

    return html`
      <div 
        class="card" 
        style="${gridStyle} cursor:${cursorStyle};" 
        @click="${this._handleAction}"
      >
        <div class="title">${title}</div>${showTemp ? html`<div class="temp">${tempString}</div>` : ''}
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
          // Utilisation du service générique homeassistant.toggle
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
        // Ne rien faire
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
// Éditeur visuel
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

    // Construction dynamique du schéma de l'éditeur
    const schema = [
      { name: 'title', label: 'Titre de la carte', selector: { text: {} } },
      { 
        name: 'tap_action_type', 
        label: 'Action au clic sur la carte', 
        selector: { 
          select: { 
            options: [
              { value: 'navigate', label: 'Navigation vers une autre page' },
              { value: 'toggle', label: 'Basculer une entité (Toggle)' },
              { value: 'script', label: 'Exécuter un script' },
              { value: 'none', label: 'Aucune action' }
            ] 
          } 
        } 
      }
    ];

    // Champs conditionnels selon l'action choisie
    if (actionType === 'navigate') {
      schema.push({ name: 'navigation_path', label: 'Chemin de navigation (ex: /dashboard/vue1)', selector: { text: {} } });
    } else if (actionType === 'toggle') {
      schema.push({ name: 'tap_action_entity', label: 'Entité à basculer (switch, light...)', selector: { entity: {} } });
    } else if (actionType === 'script') {
      schema.push({ name: 'tap_action_script', label: 'Script à exécuter', selector: { entity: { domain: 'script' } } });
    }

    schema.push({ name: 'show_temp', label: 'Afficher la ligne de valeur principale', selector: { boolean: {} } });

    if (this.config.show_temp !== false) {
      schema.push(
        { 
          name: 'temp_entity', 
          label: 'Entité principale (ex: température)', 
          selector: { entity: { domain: 'sensor' } } 
        },
        { name: 'temp_unit', label: 'Unité (ex: °C)', selector: { text: {} } }
      );
    }

    const statusItems = this.config.status_items || [];

    return html`
      <div class="editor">
        <ha-form
          .hass="${this.hass}"
          .data="${this.config}"
          .schema="${schema}"
          @value-changed="${this._formChanged}"
        ></ha-form>

        <hr class="divider" />

        <div class="section-header">
          <h3>Éléments de statut (Équipements)</h3>
          <button class="btn-add" @click="${this._addItem}">+ Ajouter un équipement</button>
        </div>

        <div class="items-container">
          ${statusItems.map((item, index) => {
            const isSvg = item.type === 'svg';
            
            const itemSchema = [
              { name: 'entity', label: 'Entité (ex: switch, light...)', selector: { entity: {} } },
              { 
                name: 'type', 
                label: "Type d'affichage", 
                selector: { 
                  select: { 
                    options: [
                      { value: 'icon', label: 'Icône classique (MDI)' },
                      { value: 'svg', label: 'SVG personnalisé' }
                    ] 
                  } 
                } 
              },
            ];

            if (isSvg) {
              itemSchema.push(
                { 
                  name: 'svg_content', 
                  label: 'Code SVG brut (ex: <svg ...>${color}</svg>)', 
                  selector: { text: { multiline: true } } 
                }
              );
            } else {
              itemSchema.push(
                { name: 'icon_on', label: 'Icône (Allumé)', selector: { icon: {} } },
                { name: 'icon_off', label: 'Icône (Éteint)', selector: { icon: {} } }
              );
            }

            return html`
              <div class="item-card">
                <div class="item-header">
                  <span>Équipement #${index + 1} (${item.type || 'icon'})</span>
                  <button class="btn-delete" @click="${() => this._deleteItem(index)}">Supprimer</button>
                </div>

                <ha-form
                  .hass="${this.hass}"
                  .data="${item}"
                  .schema="${itemSchema}"
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
    description: 'Une carte personnalisée pour afficher plusieurs statuts et icônes.',
    preview: false,
  });
}