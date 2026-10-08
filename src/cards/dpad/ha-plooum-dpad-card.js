import { LitElement, html, css } from "lit";

/* ==========================================================================
   MAIN CARD : ha-plooum-dpad-card
   ========================================================================== */
class HaPlooumDpadCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-dpad-card-editor");
  }

  static getStubConfig() {
    return {
      theme: "round",
      card_size: "200px",
      icon_size: "44px",
      bg_color: "rgba(0, 0, 0, 0.3)",
      icon_color: "#ffffff",
      card_alignment: "center",
      card_padding: "0",
      
      // Default configurations for the 5 buttons
      up_icon: "mdi:chevron-up",
      up_action_type: "press",
      
      left_icon: "mdi:chevron-left",
      left_action_type: "press",
      
      center_icon: "mdi:checkbox-blank-circle-outline",
      center_action_type: "execute_script",
      
      right_icon: "mdi:chevron-right",
      right_action_type: "press",
      
      down_icon: "mdi:chevron-down",
      down_action_type: "press",
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = { ...config };
  }

  // --- Action Handler ---
  _handleAction(btnKey) {
    const actionType = this.config[`${btnKey}_action_type`] || "none";
    if (actionType === "none") return;

    if (actionType === "toggle") {
      const entity = this.config[`${btnKey}_entity`];
      if (entity) {
        const domain = entity.split(".")[0];
        this.hass.callService(domain, "toggle", { entity_id: entity });
      }
    } 
    else if (actionType === "press") {
      const entity = this.config[`${btnKey}_entity`];
      if (entity) {
        const domain = entity.split(".")[0];
        // Typical service for a button domain is 'press', but we support others dynamically
        const service = domain === "button" ? "press" : "turn_on"; 
        this.hass.callService(domain, service, { entity_id: entity });
      }
    } 
    else if (actionType === "navigate") {
      const path = this.config[`${btnKey}_path`];
      if (path) {
        window.history.pushState(null, "", path);
        window.dispatchEvent(new CustomEvent("location-changed"));
      }
    } 
    else if (actionType === "execute_script") {
      const scriptEntity = this.config[`${btnKey}_script`];
      if (scriptEntity) {
        const scriptId = scriptEntity.replace("script.", "");
        this.hass.callService("script", scriptId);
      }
    }
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const theme = this.config.theme || "round";
    const cardSize = this.config.card_size || "200px";
    const iconSize = this.config.icon_size || "44px";
    const bgColor = this.config.bg_color || "rgba(0, 0, 0, 0.3)";
    const iconColor = this.config.icon_color || "#ffffff";
    const alignment = this.config.card_alignment || "center";
    const cardPadding = this.config.card_padding !== undefined ? this.config.card_padding : "0";

    // Alignment logic for the outer container
    const alignMap = {
      "left": "flex-start",
      "center": "center",
      "right": "flex-end"
    };
    const justifyContent = alignMap[alignment] || "center";

    const renderButton = (btnKey, defaultIcon, gridArea) => {
      const icon = this.config[`${btnKey}_icon`] || defaultIcon;
      return html`
        <div class="remote-btn" style="grid-area: ${gridArea};"
             @pointerup="${(e) => { e.stopPropagation(); this._handleAction(btnKey); }}"
             @contextmenu="${(e) => e.preventDefault()}">
          <ha-icon icon="${icon}" style="--mdc-icon-size: ${iconSize}; color:${iconColor};"></ha-icon>
        </div>
      `;
    };

    return html`
      <ha-card class="plooum-remote-card" style="justify-content: ${justifyContent}; padding:${cardPadding};">
        <div class="remote-container theme-${theme}" 
             style="--card-size: ${cardSize}; --bg-color:${bgColor};">
          ${renderButton("up", "mdi:chevron-up", "up")}
          ${renderButton("left", "mdi:chevron-left", "left")}
          ${renderButton("center", "mdi:checkbox-blank-circle-outline", "center")}
          ${renderButton("right", "mdi:chevron-right", "right")}
          ${renderButton("down", "mdi:chevron-down", "down")}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .plooum-remote-card {
        background: transparent;
        border: none;
        box-shadow: none;
        display: flex;
        width: 100%;
        box-sizing: border-box;
      }
      .remote-container {
        display: grid;
        /* Utilisation de minmax(0, 1fr) pour éviter que les icônes trop grandes ne décalent la grille */
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: repeat(3, minmax(0, 1fr));
        grid-template-areas: 
          ". up ."
          "left center right"
          ". down .";
        width: var(--card-size);
        height: var(--card-size);
        position: relative;
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
      }
      
      /* THEMES */
      .theme-round {
        background-color: var(--bg-color);
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      }
      .theme-square {
        background-color: var(--bg-color);
        border-radius: 16px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      }
      .theme-minimal {
        background-color: transparent;
      }

      /* BUTTONS */
      .remote-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        transition: background-color 0.2s ease;
        /* Optionnel mais sécurise le débordement visuel si l'icône est immense */
        width: 100%;
        height: 100%;
      }
      .remote-btn ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .remote-btn:active {
        background-color: rgba(255, 255, 255, 0.15);
      }
    `;
  }
}

/* ==========================================================================
   CARD EDITOR
   ========================================================================== */
class HaPlooumDpadCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadHAElements();
  }

  async _loadHAElements() {
    if (customElements.get("ha-entity-picker") && customElements.get("ha-selector")) return;
    if (window.loadCardHelpers) {
      const helpers = await window.loadCardHelpers();
      if (helpers) {
        await helpers.createCardElement({ type: "button" });
        this.requestUpdate();
      }
    }
  }

  setConfig(config) {
    this._config = config;
  }

  _valueChanged(ev, key) {
    if (!this._config || !this.hass) return;
    let newValue = ev.detail && ev.detail.value !== undefined ? ev.detail.value : ev.target?.value;
    if (this._config[key] === newValue) return;

    const newConfig = { ...this._config, [key]: newValue };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
  }

  _renderColorPicker(labelTitle, key, defaultColor) {
    const val = this._config[key] !== undefined ? this._config[key] : defaultColor;
    let hexColor = "#000000";
    if (val && val.match(/^#[0-9A-Fa-f]{6}$/)) hexColor = val;
    else if (val && val.match(/^#[0-9A-Fa-f]{3}$/)) hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];

    return html`
      <div class="input-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input type="color" .value=${hexColor} @input=${(e) => this._valueChanged(e, key)} />
          <input type="text" .value=${val} placeholder=${defaultColor} @input=${(e) => this._valueChanged(e, key)} />
        </div>
      </div>
    `;
  }

  _renderButtonSection(btnKey, labelTitle) {
    const typeKey = `${btnKey}_action_type`;
    const entityKey = `${btnKey}_entity`;
    const scriptKey = `${btnKey}_script`;
    const pathKey = `${btnKey}_path`;
    const iconKey = `${btnKey}_icon`;

    const actionType = this._config[typeKey] || "none";

    return html`
      <div class="button-section">
        <h4>${labelTitle}</h4>
        
        <ha-icon-picker
          .label=${"Icon"}
          .hass=${this.hass}
          .value=${this._config[iconKey] || ""}
          @value-changed=${(e) => this._valueChanged(e, iconKey)}
        ></ha-icon-picker>

        <div class="input-field" style="margin-top: 8px;">
          <label>Action type</label>
          <select .value=${actionType} @change=${(e) => this._valueChanged(e, typeKey)}>
            <option value="none">No action</option>
            <option value="press">Press Button (Button / Switch)</option>
            <option value="toggle">Toggle Entity</option>
            <option value="execute_script">Execute a Script</option>
            <option value="navigate">Navigate</option>
          </select>
        </div>

        ${(actionType === "toggle" || actionType === "press") ? html`
          <ha-entity-picker
            style="margin-top: 8px;"
            .label=${"Entity"}
            .hass=${this.hass}
            .value=${this._config[entityKey] || ""}
            @value-changed=${(e) => this._valueChanged(e, entityKey)}
            allow-custom-entity
          ></ha-entity-picker>
        ` : ""}

        ${actionType === "execute_script" ? html`
          <ha-entity-picker
            style="margin-top: 8px;"
            .label=${"Script to execute"}
            .hass=${this.hass}
            .value=${this._config[scriptKey] || ""}
            .includeDomains=${["script"]}
            @value-changed=${(e) => this._valueChanged(e, scriptKey)}
            allow-custom-entity
          ></ha-entity-picker>
        ` : ""}

        ${actionType === "navigate" ? html`
          <div class="input-field" style="margin-top: 8px;">
            <label>Navigation path</label>
            <input type="text" placeholder="/lovelace/home" .value=${this._config[pathKey] || ""} @input=${(e) => this._valueChanged(e, pathKey)} />
          </div>
        ` : ""}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="card-config">
        <h3>Global Settings</h3>
        
        <div class="input-field">
          <label>Theme</label>
          <select .value=${this._config.theme || "round"} @change=${(e) => this._valueChanged(e, "theme")}>
            <option value="round">Round (Default)</option>
            <option value="square">Square</option>
            <option value="minimal">Minimalist (Transparent)</option>
          </select>
        </div>

        <div class="input-field">
          <label>Card alignment</label>
          <select .value=${this._config.card_alignment || "center"} @change=${(e) => this._valueChanged(e, "card_alignment")}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Total card size</label>
            <input type="text" placeholder="200px" .value=${this._config.card_size || "200px"} @input=${(e) => this._valueChanged(e, "card_size")} />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Icons size</label>
            <input type="text" placeholder="44px" .value=${this._config.icon_size || "44px"} @input=${(e) => this._valueChanged(e, "icon_size")} />
          </div>
        </div>

        <div class="input-field">
          <label>Card padding</label>
          <input type="text" placeholder="0" .value=${this._config.card_padding !== undefined ? this._config.card_padding : "0"} @input=${(e) => this._valueChanged(e, "card_padding")} />
        </div>

        ${this._renderColorPicker("Background color (Round/Square)", "bg_color", "rgba(0, 0, 0, 0.3)")}
        ${this._renderColorPicker("Icons color", "icon_color", "#ffffff")}

        <hr />
        <h3>Buttons Configuration</h3>
        
        ${this._renderButtonSection("up", "⬆️ Up Button")}
        ${this._renderButtonSection("left", "⬅️ Left Button")}
        ${this._renderButtonSection("center", "⏺️ Center Button")}
        ${this._renderButtonSection("right", "➡️ Right Button")}
        ${this._renderButtonSection("down", "⬇️ Down Button")}
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 0;
      }
      h3 {
        margin: 12px 0 4px 0;
        font-size: 1.1em;
        color: var(--primary-text-color);
      }
      .button-section {
        border-left: 3px solid var(--primary-color);
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 0 8px 8px 0;
        margin-bottom: 8px;
      }
      .button-section h4 {
        margin: 0 0 12px 0;
        color: var(--primary-text-color);
      }
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
      }
      .input-field label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      .color-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .color-input-group input[type="color"] {
        -webkit-appearance: none;
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
        background: none;
      }
      .color-input-group input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
      .color-input-group input[type="color"]::-webkit-color-swatch {
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
      }
      .color-input-group input[type="text"], input[type="text"], select {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
      ha-entity-picker, ha-icon-picker, ha-selector {
        width: 100%;
        display: block;
      }
      hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 8px 0;
      }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get('ha-plooum-dpad-card')) {
  customElements.define('ha-plooum-dpad-card', HaPlooumDpadCard);
}
if (!customElements.get('ha-plooum-dpad-card-editor')) {
  customElements.define('ha-plooum-dpad-card-editor', HaPlooumDpadCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-dpad-card')) {
  window.customCards.push({
    type: 'ha-plooum-dpad-card',
    name: 'Ha Plooum D-Pad Card',
    description: 'A customizable D-Pad style remote control card for cameras and more.',
    preview: true,
  });
}