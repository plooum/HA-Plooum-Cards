import { LitElement, html, css } from "lit";

/* ==========================================================================
   MAIN CARD : ha-plooum-buttonbadge-card
   ========================================================================== */
class HaPlooumButtonBadgeCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-buttonbadge-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      name: "My Button",
      icon: "mdi:lightbulb",
      font_size: "13px",
      icon_size: "24px",
      badge_icon_size: "20px",
      text_padding_left: "24px",
      icon_padding_left: "-4px",
      icon_align: "flex-start",
      active_color: "#FFC107",
      inactive_color: "#FFFFFF",
      tap_action_type: "toggle",
      hold_action_type: "none",
      badge_tap_action_type: "toggle",
      badge_hold_action_type: "none",
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = { ...config };
  }

  // --- Action Handler ---
  _handleAction(actionPrefix, defaultEntity) {
    const actionType = this.config[`${actionPrefix}_type`] || "toggle";

    if (actionType === "toggle" && defaultEntity) {
      const domain = defaultEntity.split(".")[0];
      this.hass.callService(domain, "toggle", { entity_id: defaultEntity });
    } 
    else if (actionType === "navigate") {
      const path = this.config[`${actionPrefix}_path`];
      if (path) {
        window.history.pushState(null, "", path);
        window.dispatchEvent(new CustomEvent("location-changed"));
      }
    } 
    else if (actionType === "execute_script") {
      const scriptEntity = this.config[`${actionPrefix}_script`];
      if (scriptEntity) {
        const scriptId = scriptEntity.replace("script.", "");
        this.hass.callService("script", scriptId);
      }
    }
  }

  // --- Tap / Hold Events ---
  _startTimer(e, target) {
    this.longPress = false;
    this.timer = setTimeout(() => {
      this.longPress = true;
      const actionPrefix = target === 'badge' ? 'badge_hold_action' : 'hold_action';
      const entity = target === 'badge' ? this.config.badge_entity : this.config.entity;
      this._handleAction(actionPrefix, entity);
    }, 500);
  }

  _stopTimer(e, target) {
    clearTimeout(this.timer);
    if (!this.longPress) {
      const actionPrefix = target === 'badge' ? 'badge_tap_action' : 'tap_action';
      const entity = target === 'badge' ? this.config.badge_entity : this.config.entity;
      this._handleAction(actionPrefix, entity);
    }
  }

  render() {
    if (!this.config || !this.hass) return html``;

    // -- Main Button Calculations --
    const stateObj = this.config.entity ? this.hass.states[this.config.entity] : undefined;
    const isActive = stateObj && stateObj.state !== "off" && stateObj.state !== "unavailable";
    
    const color = isActive 
      ? (this.config.active_color || "#FFC107") 
      : (this.config.inactive_color || "#FFFFFF");

    const showIcon = !!this.config.icon;
    const showName = !!this.config.name;
    const fontSize = this.config.font_size || "13px";
    const iconSize = this.config.icon_size || "24px";
    const badgeIconSize = this.config.badge_icon_size || "20px";
    const textPaddingLeft = this.config.text_padding_left || "24px";
    const iconPaddingLeft = this.config.icon_padding_left !== undefined ? this.config.icon_padding_left : "-4px";
    const iconAlign = this.config.icon_align || "flex-start";

    // -- Badge Calculations --
    const hasBadge = !!(this.config.badge_entity || this.config.badge_icon);
    let badgeHtml = html``;

    if (hasBadge) {
      const badgeStateObj = this.config.badge_entity ? this.hass.states[this.config.badge_entity] : undefined;
      const isBadgeActive = badgeStateObj && badgeStateObj.state !== "off" && badgeStateObj.state !== "unavailable";
      const badgeBgColor = isBadgeActive 
        ? (this.config.badge_active_color || "#FFC107") 
        : (this.config.badge_inactive_color || "rgba(255, 255, 255, 0.25)");

      badgeHtml = html`
        <div class="badge" 
             style="background: ${badgeBgColor};"
             @pointerdown="${(e) => { e.stopPropagation(); this._startTimer(e, 'badge'); }}"
             @pointerup="${(e) => { e.stopPropagation(); this._stopTimer(e, 'badge'); }}"
             @pointercancel="${(e) => { e.stopPropagation(); clearTimeout(this.timer); }}"
             @contextmenu="${(e) => e.preventDefault()}">
          ${this.config.badge_icon ? html`<ha-icon icon="${this.config.badge_icon}" style="--mdc-icon-size: ${badgeIconSize}; width: ${badgeIconSize}; height: ${badgeIconSize};"></ha-icon>` : ""}
        </div>
      `;
    }

    return html`
      <ha-card class="plooum-card ${hasBadge ? 'has-badge' : ''}"
               @pointerdown="${(e) => this._startTimer(e, 'main')}"
               @pointerup="${(e) => this._stopTimer(e, 'main')}"
               @pointercancel="${(e) => clearTimeout(this.timer)}"
               @contextmenu="${(e) => e.preventDefault()}">
        
        <div class="content" style="justify-content: ${iconAlign};">
          ${showIcon ? html`<ha-icon class="main-icon" icon="${this.config.icon}" style="color: ${color}; --mdc-icon-size: ${iconSize}; width: ${iconSize}; height: ${iconSize}; margin-left: ${iconPaddingLeft};"></ha-icon>` : ""}
          ${showName ? html`<span class="main-text" style="color: ${color}; font-size: ${fontSize}; padding-left: ${textPaddingLeft};">${this.config.name}</span>` : ""}
        </div>

        ${badgeHtml}
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .plooum-card {
        background: rgba(0, 0, 0, 0.35);
        border-radius: 20px;
        padding: 6px 8px;
        box-sizing: border-box;
        box-shadow: none;
        border: none;
        position: relative;
        min-height: 56px;
        overflow: visible;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .plooum-card.has-badge {
        padding-right: 20px;
      }
      .content {
        position: relative;
        width: 100%;
        min-height: 44px;
        display: flex;
        align-items: center;
      }
      .main-icon {
        flex-shrink: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .main-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        line-height: 1.2;
        font-weight: 700;
        white-space: normal;
        word-break: normal;
        overflow-wrap: normal;
        z-index: 2;
        pointer-events: none;
      }
      .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        z-index: 3;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        touch-action: manipulation;
      }
      .badge ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      }
    `;
  }
}

/* ==========================================================================
   CARD EDITOR
   ========================================================================== */
class HaPlooumButtonBadgeCardEditor extends LitElement {
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
    
    let newValue;
    if (ev.detail && ev.detail.value !== undefined) {
      newValue = ev.detail.value;
    } else if (ev.target && ev.target.value !== undefined) {
      newValue = ev.target.value;
    }

    if (this._config[key] === newValue) return;

    const newConfig = { ...this._config, [key]: newValue };

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }

  _renderColorPicker(labelTitle, key, defaultColor) {
    const val = this._config[key] !== undefined ? this._config[key] : defaultColor;
    
    let hexColor = "#000000";
    if (val && val.match(/^#[0-9A-Fa-f]{6}$/)) {
      hexColor = val;
    } else if (val && val.match(/^#[0-9A-Fa-f]{3}$/)) {
      hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
    }

    return html`
      <div class="input-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input
            type="color"
            .value=${hexColor}
            @input=${(e) => this._valueChanged(e, key)}
          />
          <input
            type="text"
            .value=${val}
            placeholder=${defaultColor}
            @input=${(e) => this._valueChanged(e, key)}
          />
        </div>
      </div>
    `;
  }

  _renderActionConfig(actionPrefix, labelTitle) {
    const typeKey = `${actionPrefix}_type`;
    const pathKey = `${actionPrefix}_path`;
    const scriptKey = `${actionPrefix}_script`;

    const actionType = this._config[typeKey] || "toggle";

    return html`
      <div class="action-group">
        <h4>${labelTitle}</h4>
        <select
          .value=${actionType}
          @change=${(e) => this._valueChanged(e, typeKey)}
        >
          <option value="toggle">Toggle</option>
          <option value="navigate">Navigate</option>
          <option value="execute_script">Execute a script</option>
          <option value="none">No action</option>
        </select>

        ${actionType === "navigate"
          ? html`
              <div class="input-field" style="margin-top: 6px;">
                <label>Navigation path</label>
                ${customElements.get("ha-selector")
                  ? html`
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{ navigation: {} }}
                        .value=${this._config[pathKey] || ""}
                        @value-changed=${(e) => this._valueChanged(e, pathKey)}
                      ></ha-selector>
                    `
                  : html`
                      <input
                        type="text"
                        placeholder="/lovelace/home"
                        .value=${this._config[pathKey] || ""}
                        @input=${(e) => this._valueChanged(e, pathKey)}
                      />
                    `}
              </div>
            `
          : ""}

        ${actionType === "execute_script"
          ? html`
              <ha-entity-picker
                .label=${"Script to execute"}
                .hass=${this.hass}
                .value=${this._config[scriptKey] || ""}
                .includeDomains=${["script"]}
                @value-changed=${(e) => this._valueChanged(e, scriptKey)}
                allow-custom-entity
              ></ha-entity-picker>
            `
          : ""}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="card-config">
        <h3>Main Button</h3>
        
        <ha-entity-picker
          .label=${"Main entity"}
          .hass=${this.hass}
          .value=${this._config.entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="input-field">
          <label>Button text</label>
          <input
            type="text"
            placeholder="Name displayed on the button"
            .value=${this._config.name || ""}
            @input=${(e) => this._valueChanged(e, "name")}
          />
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Font size</label>
            <input
              type="text"
              placeholder="13px"
              .value=${this._config.font_size || "13px"}
              @input=${(e) => this._valueChanged(e, "font_size")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Text left padding</label>
            <input
              type="text"
              placeholder="24px"
              .value=${this._config.text_padding_left || "24px"}
              @input=${(e) => this._valueChanged(e, "text_padding_left")}
            />
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="24px"
              .value=${this._config.icon_size || "24px"}
              @input=${(e) => this._valueChanged(e, "icon_size")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Icon left offset</label>
            <input
              type="text"
              placeholder="-4px"
              .value=${this._config.icon_padding_left !== undefined ? this._config.icon_padding_left : "-4px"}
              @input=${(e) => this._valueChanged(e, "icon_padding_left")}
            />
          </div>
        </div>

        <div class="input-field">
          <label>Icon alignment</label>
          <select
            .value=${this._config.icon_align || "flex-start"}
            @change=${(e) => this._valueChanged(e, "icon_align")}
          >
            <option value="flex-start">Left (Default)</option>
            <option value="center">Center</option>
          </select>
        </div>

        <ha-icon-picker
          .label=${"Main icon"}
          .hass=${this.hass}
          .value=${this._config.icon || ""}
          @value-changed=${(e) => this._valueChanged(e, "icon")}
        ></ha-icon-picker>

        ${this._renderColorPicker("Active color", "active_color", "#FFC107")}
        ${this._renderColorPicker("Inactive color", "inactive_color", "#FFFFFF")}

        ${this._renderActionConfig("tap_action", "Tap action (Main)")}
        ${this._renderActionConfig("hold_action", "Hold action (Main)")}

        <hr />

        <h3>Badge (Optional)</h3>

        <ha-entity-picker
          .label=${"Badge entity"}
          .hass=${this.hass}
          .value=${this._config.badge_entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "badge_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="input-field">
          <label>Badge icon size</label>
          <input
            type="text"
            placeholder="20px"
            .value=${this._config.badge_icon_size || "20px"}
            @input=${(e) => this._valueChanged(e, "badge_icon_size")}
          />
        </div>

        <ha-icon-picker
          .label=${"Badge icon"}
          .hass=${this.hass}
          .value=${this._config.badge_icon || ""}
          @value-changed=${(e) => this._valueChanged(e, "badge_icon")}
        ></ha-icon-picker>

        ${this._renderColorPicker("Badge active background color", "badge_active_color", "#FFC107")}
        ${this._renderColorPicker("Badge inactive background color", "badge_inactive_color", "rgba(255, 255, 255, 0.25)")}

        ${this._renderActionConfig("badge_tap_action", "Tap action (Badge)")}
        ${this._renderActionConfig("badge_hold_action", "Hold action (Badge)")}
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
      h4 {
        margin: 4px 0;
        font-size: 0.95em;
        color: var(--secondary-text-color);
      }
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
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
      .color-input-group input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      .color-input-group input[type="color"]::-webkit-color-swatch {
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 4px;
      }
      .color-input-group input[type="text"] {
        flex-grow: 1;
      }

      input[type="text"],
      select {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
      ha-entity-picker,
      ha-icon-picker,
      ha-selector {
        width: 100%;
        display: block;
      }
      .action-group {
        border-left: 3px solid var(--primary-color);
        padding-left: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
      }
      hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 16px 0;
      }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get('ha-plooum-buttonbadge-card')) {
  customElements.define('ha-plooum-buttonbadge-card', HaPlooumButtonBadgeCard);
}
if (!customElements.get('ha-plooum-buttonbadge-card-editor')) {
  customElements.define('ha-plooum-buttonbadge-card-editor', HaPlooumButtonBadgeCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-buttonbadge-card')) {
  window.customCards.push({
    type: 'ha-plooum-buttonbadge-card',
    name: 'Ha Plooum Button Badge Card',
    description: 'A custom button card to show a custom badge on it.',
    preview: true,
  });
}