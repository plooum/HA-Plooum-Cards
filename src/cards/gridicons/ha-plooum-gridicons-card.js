import { LitElement, html, css } from "lit";

/* ==========================================================================
   MAIN CARD : ha-plooum-gridicons-card
   ========================================================================== */
class HaPlooumGridIconsCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-gridicons-card-editor");
  }

  static getStubConfig() {
    return {
      icon_size: "31px",
      alignment: "space-around",
      padding: "12px",
      icons: [
        {
          entity: "",
          icon: "",
          active_color: "#66bb6a",
          inactive_color: "#ffffff",
          tap_action: { action: "toggle" },
          hold_action: { action: "none" },
          new_row: false,
        },
        {
          entity: "",
          icon: "mdi:pump",
          active_color: "#00bcd4",
          inactive_color: "#ffffff",
          tap_action: { action: "toggle" },
          hold_action: { action: "none" },
          new_row: false,
        }
      ]
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = { ...config };
    if (!this.config.icons) {
      this.config.icons = [];
    }
  }

  // --- Utility to normalize action configs (New standard vs Legacy) ---
  _getActionConfig(iconConf, actionPrefix) {
    if (!iconConf) return { action: "none" };

    const actionValue = iconConf[actionPrefix];
    if (actionValue && typeof actionValue === "object") {
      return actionValue;
    }

    // Convert legacy flat properties to standard action object
    const legacyType = iconConf[`${actionPrefix}_type`];
    if (!legacyType || legacyType === "none") {
      return { action: "none" };
    }

    if (legacyType === "toggle") {
      return {
        action: "toggle",
        target: iconConf.entity ? { entity_id: iconConf.entity } : undefined,
      };
    }

    if (legacyType === "navigate") {
      return {
        action: "navigate",
        navigation_path: iconConf[`${actionPrefix}_path`] || "",
      };
    }

    if (legacyType === "execute_script") {
      const scriptEntity = iconConf[`${actionPrefix}_script`];
      const performAction = scriptEntity
        ? (scriptEntity.startsWith("script.") ? scriptEntity : `script.${scriptEntity}`)
        : "";
      return {
        action: "perform-action",
        perform_action: performAction,
      };
    }

    if (legacyType === "perform-action" || legacyType === "call-service") {
      const performAction = iconConf[`${actionPrefix}_perform_action`] || iconConf[`${actionPrefix}_service`] || "";
      const targetEntity = iconConf[`${actionPrefix}_target`] || iconConf.entity || "";
      let data = {};
      const rawData = iconConf[`${actionPrefix}_data`];
      if (rawData) {
        if (typeof rawData === "string") {
          try {
            data = JSON.parse(rawData);
          } catch (e) {
            data = { option: rawData };
          }
        } else if (typeof rawData === "object") {
          data = rawData;
        }
      }

      return {
        action: "perform-action",
        perform_action: performAction,
        target: targetEntity ? { entity_id: targetEntity } : undefined,
        data: data,
      };
    }

    return { action: "none" };
  }

  // --- Confirmation (optional, per action) ---
  // Returns the message to display, or null if no confirmation is required.
  _getConfirmationMessage(iconConf, actionPrefix, actionConfig) {
    const short = actionPrefix === "tap_action" ? "tap" : "hold";
    const defaultMessage = "Are you sure?";

    if (iconConf[`${short}_confirmation`] === true) {
      return iconConf[`${short}_confirmation_text`] || defaultMessage;
    }

    // Also honor the standard Home Assistant `confirmation` key inside the action
    const std = actionConfig && actionConfig.confirmation;
    if (std === true) return defaultMessage;
    if (std && typeof std === "object") return std.text || defaultMessage;

    return null;
  }

  _showConfirmation(message, onConfirm) {
    if (this._confirmOverlay) return; // a dialog is already open

    const openedAt = Date.now();
    const overlay = document.createElement("div");
    overlay.style.cssText = [
      "position:fixed", "inset:0", "z-index:99999",
      "display:flex", "align-items:center", "justify-content:center",
      "background:rgba(0,0,0,0.5)", "padding:16px", "box-sizing:border-box",
    ].join(";");

    const dialog = document.createElement("div");
    dialog.style.cssText = [
      "background:var(--card-background-color, #fff)",
      "color:var(--primary-text-color, #000)",
      "border-radius:var(--ha-card-border-radius, 16px)",
      "padding:20px 20px 12px 20px", "max-width:400px", "width:100%",
      "box-sizing:border-box", "box-shadow:0 8px 32px rgba(0,0,0,0.4)",
      "font-family:var(--paper-font-body1_-_font-family, inherit)",
    ].join(";");

    const text = document.createElement("div");
    text.textContent = message;
    text.style.cssText = "font-size:16px;line-height:1.4;white-space:pre-wrap;margin-bottom:16px;";

    const buttons = document.createElement("div");
    buttons.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";

    const makeButton = (label, primary) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.style.cssText = [
        "background:transparent", "border:none", "cursor:pointer",
        "padding:10px 16px", "border-radius:8px", "font-size:14px",
        "font-weight:500", "text-transform:uppercase",
        `color:${primary ? "var(--primary-color, #03a9f4)" : "var(--secondary-text-color, #727272)"}`,
      ].join(";");
      return btn;
    };

    const cancelBtn = makeButton("Cancel", false);
    const okBtn = makeButton("OK", true);

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };

    const close = () => {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      this._confirmOverlay = null;
    };

    // Ignore clicks right after opening (avoids ghost clicks from the touch that opened the dialog)
    const guarded = (fn) => (e) => {
      e.stopPropagation();
      if (Date.now() - openedAt < 350) return;
      fn();
    };

    cancelBtn.addEventListener("click", guarded(close));
    okBtn.addEventListener("click", guarded(() => {
      close();
      onConfirm();
    }));
    // Click outside the dialog = cancel
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) guarded(close)(e);
    });
    dialog.addEventListener("click", (e) => e.stopPropagation());

    buttons.append(cancelBtn, okBtn);
    dialog.append(text, buttons);
    overlay.append(dialog);
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(overlay);
    this._confirmOverlay = { close };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._holdTimer);
    if (this._confirmOverlay) this._confirmOverlay.close();
  }

  // --- Action Handler ---
  _handleAction(iconConf, actionPrefix) {
    const actionConfig = this._getActionConfig(iconConf, actionPrefix);
    if (!actionConfig) return;

    const action = actionConfig.action || "none";
    if (action === "none") return;

    const message = this._getConfirmationMessage(iconConf, actionPrefix, actionConfig);
    if (message) {
      this._showConfirmation(message, () => this._executeAction(iconConf, actionConfig));
    } else {
      this._executeAction(iconConf, actionConfig);
    }
  }

  _executeAction(iconConf, actionConfig) {
    const action = actionConfig.action || "none";
    if (action === "none") return;

    if (action === "toggle") {
      const entityId = actionConfig.target?.entity_id || iconConf.entity;
      if (entityId) {
        // Use the native universal service (handles all domains)
        this.hass.callService("homeassistant", "toggle", { entity_id: entityId });
      }
    } 
    else if (action === "navigate") {
      const path = actionConfig.navigation_path || actionConfig.path;
      if (path) {
        window.history.pushState(null, "", path);
        window.dispatchEvent(new CustomEvent("location-changed"));
      }
    } 
    else if (action === "more-info") {
      let entityId = actionConfig.target?.entity_id || iconConf.entity;
      if (Array.isArray(entityId)) entityId = entityId[0];
      if (entityId) {
        const event = new CustomEvent("hass-more-info", {
          detail: { entityId },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }
    }
    else if (action === "perform-action" || action === "call-service") {
      const performAction = actionConfig.perform_action || actionConfig.service;
      if (performAction) {
        const parts = performAction.split(".");
        const domain = parts[0];
        const service = parts.slice(1).join(".");
        
        let target = actionConfig.target;
        if (!target && iconConf.entity) {
          target = { entity_id: iconConf.entity };
        } else if (typeof target === "string") {
          target = { entity_id: target };
        }
        
        const data = actionConfig.data || {};
        
        this.hass.callService(domain, service, data, target);
      }
    }
  }

  // --- Tap / Hold Events ---
  _startTimer(e, iconConf) {
    // Guard against touch+mouse double clicks on mobile
    if (e.type === "mousedown" && this._isTouch) return;
    if (e.type === "touchstart") this._isTouch = true;

    e.stopPropagation();
    this._longPress = false;
    clearTimeout(this._holdTimer);
    this._holdTimer = setTimeout(() => {
      this._longPress = true;
      this._handleAction(iconConf, "hold_action");
    }, 500);
  }

  _stopTimer(e, iconConf) {
    // Guard against touch+mouse double clicks on mobile
    if (e.type === "mouseup" && this._isTouch) return;

    e.stopPropagation();
    clearTimeout(this._holdTimer);
    if (!this._longPress) {
      this._handleAction(iconConf, "tap_action");
    }

    if (e.type === "touchend") {
      // Disable the touch guard after a short delay
      setTimeout(() => { this._isTouch = false; }, 300);
    }
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const iconSize = this.config.icon_size || "31px";
    const alignment = this.config.alignment || "space-around";
    const padding = this.config.padding || "12px";
    const icons = Array.isArray(this.config.icons) ? this.config.icons : [];

    return html`
      <ha-card class="plooum-grid-card" style="padding: ${padding};">
        <div class="grid-container" style="justify-content: ${alignment};">
          ${icons.map((iconConf, index) => {
            const stateObj = iconConf && iconConf.entity ? this.hass.states[iconConf.entity] : undefined;
            const isActive = stateObj && stateObj.state !== "off" && stateObj.state !== "unavailable";
            const color = isActive 
              ? (iconConf.active_color || "#FFC107") 
              : (iconConf.inactive_color || "#FFFFFF");

            return html`
              ${iconConf.new_row && index > 0 ? html`<div class="flex-break"></div>` : ""}
              <div 
                class="icon-wrapper" 
                @mousedown="${(e) => this._startTimer(e, iconConf)}"
                @mouseup="${(e) => this._stopTimer(e, iconConf)}"
                @touchstart="${(e) => this._startTimer(e, iconConf)}"
                @touchend="${(e) => this._stopTimer(e, iconConf)}"
                @contextmenu="${(e) => { e.preventDefault(); e.stopPropagation(); }}"
              >
                ${iconConf.icon 
                  ? html`<ha-icon icon="${iconConf.icon}" style="color: ${color}; --mdc-icon-size:${iconSize}; width: ${iconSize}; height:${iconSize};"></ha-icon>`
                  : (stateObj 
                      ? html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj} style="color: ${color}; --mdc-icon-size:${iconSize}; width: ${iconSize}; height:${iconSize};"></ha-state-icon>`
                      : html`<ha-icon icon="mdi:help-circle" style="color: ${color}; --mdc-icon-size:${iconSize}; width: ${iconSize}; height:${iconSize};"></ha-icon>`
                    )
                }
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .plooum-grid-card {
        background: rgba(0, 0, 0, 0.35);
        border-radius: 20px;
        box-sizing: border-box;
        box-shadow: none;
        border: none;
        min-height: 56px;
        display: flex;
        align-items: center;
      }
      .grid-container {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 12px 8px;
        align-items: center;
      }
      .flex-break {
        flex-basis: 100%;
        height: 0;
      }
      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        transition: transform 0.1s ease;
      }
      .icon-wrapper:active {
        transform: scale(0.9);
      }
    `;
  }
}

/* ==========================================================================
   CARD EDITOR
   ========================================================================== */
class HaPlooumGridIconsCardEditor extends LitElement {
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
    this._config = { icons: [], ...config };
  }

  _fireConfigChange(newConfig) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }

  _valueChanged(ev, key) {
    if (!this._config || !this.hass) return;
    let val = ev.detail?.value !== undefined ? ev.detail.value : ev.target?.value;
    if (this._config[key] === val) return;
    this._fireConfigChange({ ...this._config, [key]: val });
  }

  _iconValueChanged(ev, index, key) {
    if (!this._config || !this.hass) return;
    let val = ev.detail?.value !== undefined ? ev.detail.value : ev.target?.value;
    
    const newIcons = [...this._config.icons];
    if (newIcons[index][key] === val) return;

    newIcons[index] = { ...newIcons[index], [key]: val };
    this._fireConfigChange({ ...this._config, icons: newIcons });
  }

  _iconCheckboxChanged(ev, index, key) {
    if (!this._config || !this.hass) return;
    const val = ev.target.checked;
    
    const newIcons = [...this._config.icons];
    if (newIcons[index][key] === val) return;

    newIcons[index] = { ...newIcons[index], [key]: val };
    this._fireConfigChange({ ...this._config, icons: newIcons });
  }

  _actionValueChanged(ev, index, actionPrefix) {
    if (!this._config || !this.hass) return;
    const val = ev.detail?.value;
    
    const newIcons = [...this._config.icons];
    newIcons[index] = { ...newIcons[index], [actionPrefix]: val };
    this._fireConfigChange({ ...this._config, icons: newIcons });
  }

  _getActionConfig(iconConf, actionPrefix) {
    if (!iconConf) return { action: "none" };

    const actionValue = iconConf[actionPrefix];
    if (actionValue && typeof actionValue === "object") {
      return actionValue;
    }

    const legacyType = iconConf[`${actionPrefix}_type`];
    if (!legacyType || legacyType === "none") {
      return { action: "none" };
    }

    if (legacyType === "toggle") {
      return {
        action: "toggle",
        target: iconConf.entity ? { entity_id: iconConf.entity } : undefined,
      };
    }

    if (legacyType === "navigate") {
      return {
        action: "navigate",
        navigation_path: iconConf[`${actionPrefix}_path`] || "",
      };
    }

    if (legacyType === "execute_script") {
      const scriptEntity = iconConf[`${actionPrefix}_script`];
      const performAction = scriptEntity
        ? (scriptEntity.startsWith("script.") ? scriptEntity : `script.${scriptEntity}`)
        : "";
      return {
        action: "perform-action",
        perform_action: performAction,
      };
    }

    if (legacyType === "perform-action" || legacyType === "call-service") {
      const performAction = iconConf[`${actionPrefix}_perform_action`] || iconConf[`${actionPrefix}_service`] || "";
      const targetEntity = iconConf[`${actionPrefix}_target`] || iconConf.entity || "";
      let data = {};
      const rawData = iconConf[`${actionPrefix}_data`];
      if (rawData) {
        if (typeof rawData === "string") {
          try {
            data = JSON.parse(rawData);
          } catch (e) {
            data = { option: rawData };
          }
        } else if (typeof rawData === "object") {
          data = rawData;
        }
      }

      return {
        action: "perform-action",
        perform_action: performAction,
        target: targetEntity ? { entity_id: targetEntity } : undefined,
        data: data,
      };
    }

    return { action: "none" };
  }

  // --- Copy / Paste Logic ---
  _copyIcon(index, ev) {
    const iconConf = this._config.icons[index];
    localStorage.setItem("ha_plooum_icon_clipboard", JSON.stringify(iconConf));
    
    // Visual feedback
    if (ev && ev.target) {
      const btn = ev.target;
      const oldText = btn.innerHTML;
      btn.innerHTML = "✔ Copied";
      setTimeout(() => { btn.innerHTML = oldText; }, 1000);
    }
  }

  _pasteIcon(index) {
    const clipboard = localStorage.getItem("ha_plooum_icon_clipboard");
    if (!clipboard) {
      alert("Clipboard is empty. Copy an icon first.");
      return;
    }
    try {
      const pastedIcon = JSON.parse(clipboard);
      const newIcons = [...this._config.icons];
      newIcons[index] = { ...pastedIcon };
      this._fireConfigChange({ ...this._config, icons: newIcons });
    } catch (e) {
      console.error("Paste failed", e);
    }
  }

  _pasteNewIcon() {
    const clipboard = localStorage.getItem("ha_plooum_icon_clipboard");
    if (!clipboard) {
      alert("Clipboard is empty. Copy an icon first.");
      return;
    }
    try {
      const pastedIcon = JSON.parse(clipboard);
      const newIcons = [...(this._config.icons || [])];
      newIcons.push({ ...pastedIcon });
      this._fireConfigChange({ ...this._config, icons: newIcons });
    } catch (e) {
      console.error("Paste new failed", e);
    }
  }

  _addIcon() {
    const newIcons = [...(this._config.icons || [])];
    newIcons.push({
      entity: "",
      icon: "",
      active_color: "#FFC107",
      inactive_color: "#FFFFFF",
      tap_action: { action: "toggle" },
      hold_action: { action: "none" },
      new_row: false
    });
    this._fireConfigChange({ ...this._config, icons: newIcons });
  }

  _removeIcon(index) {
    const newIcons = [...this._config.icons];
    newIcons.splice(index, 1);
    this._fireConfigChange({ ...this._config, icons: newIcons });
  }

  _moveIcon(index, direction) {
    const newIcons = [...this._config.icons];
    if (direction === "up" && index > 0) {
      [newIcons[index - 1], newIcons[index]] = [newIcons[index], newIcons[index - 1]];
    } else if (direction === "down" && index < newIcons.length - 1) {
      [newIcons[index + 1], newIcons[index]] = [newIcons[index], newIcons[index + 1]];
    }
    this._fireConfigChange({ ...this._config, icons: newIcons });
  }

  _renderColorPicker(labelTitle, index, key, defaultColor) {
    const iconConf = (this._config && this._config.icons && this._config.icons[index]) ? this._config.icons[index] : {};
    const val = iconConf[key] !== undefined ? iconConf[key] : defaultColor;
    let hexColor = "#000000";

    if (typeof val === "string" && val.length === 7 && val.startsWith("#")) {
      hexColor = val;
    } else if (typeof val === "string" && val.length === 4 && val.startsWith("#")) {
      hexColor = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
    }

    return html`
      <div class="input-field color-field">
        <label>${labelTitle}</label>
        <div class="color-input-group">
          <input type="color" .value=${hexColor} @input=${(e) => this._iconValueChanged(e, index, key)} />
          <input type="text" .value=${val} placeholder=${defaultColor} @input=${(e) => this._iconValueChanged(e, index, key)} />
        </div>
      </div>
    `;
  }

  _renderConfirmationConfig(index, actionPrefix) {
    const iconConf = (this._config && this._config.icons && this._config.icons[index]) ? this._config.icons[index] : {};
    const short = actionPrefix === "tap_action" ? "tap" : "hold";
    const enabled = Boolean(iconConf[`${short}_confirmation`]);
    const text = iconConf[`${short}_confirmation_text`] || "";

    return html`
      <div class="confirm-group">
        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${enabled}
              @change=${(e) => this._iconCheckboxChanged(e, index, `${short}_confirmation`)}
            />
            Ask for confirmation
          </label>
        </div>
        ${enabled ? html`
          <div class="input-field">
            <label>Confirmation message</label>
            <input
              type="text"
              placeholder="Are you sure?"
              .value=${text}
              @input=${(e) => this._iconValueChanged(e, index, `${short}_confirmation_text`)}
            />
          </div>
        ` : ""}
      </div>
    `;
  }

  _renderActionConfig(index, actionPrefix, labelTitle) {
    const iconConf = (this._config && this._config.icons && this._config.icons[index]) ? this._config.icons[index] : {};
    const actionValue = this._getActionConfig(iconConf, actionPrefix);

    return html`
      <div class="action-group">
        <label class="action-label">${labelTitle}</label>
        <ha-selector
          .hass=${this.hass}
          .selector=${{ ui_action: {} }}
          .value=${actionValue}
          .label=${labelTitle}
          @value-changed=${(e) => this._actionValueChanged(e, index, actionPrefix)}
        ></ha-selector>
        ${this._renderConfirmationConfig(index, actionPrefix)}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const icons = this._config.icons || [];

    return html`
      <div class="card-config">
        <h3>Global Settings</h3>
        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Icon size</label>
            <input type="text" placeholder="31px" .value=${this._config.icon_size || "31px"} @input=${(e) => this._valueChanged(e, "icon_size")} />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Padding</label>
            <input type="text" placeholder="12px" .value=${this._config.padding || "12px"} @input=${(e) => this._valueChanged(e, "padding")} />
          </div>
        </div>
        <div class="input-field" style="margin-top: 8px;">
          <label>Alignment</label>
          <select .value=${this._config.alignment || "space-around"} @change=${(e) => this._valueChanged(e, "alignment")}>
            <option value="space-around">Space Around</option>
            <option value="space-between">Space Between</option>
            <option value="center">Center</option>
            <option value="flex-start">Left</option>
            <option value="flex-end">Right</option>
          </select>
        </div>

        <hr />
        <h3>Icons (${icons.length})</h3>

        <div class="icons-list">
          ${icons.map((iconConf, index) => html`
            <div class="icon-config-block">
              <div class="icon-header">
                <strong>Icon #${index + 1}</strong>
                <div class="icon-actions">
                  <button class="icon-btn copy-btn" title="Copy this icon" @click=${(e) => this._copyIcon(index, e)}>Copy</button>
                  <button class="icon-btn paste-btn" title="Replace with the copied icon" @click=${() => this._pasteIcon(index)}>Paste</button>
                  <button class="icon-btn" title="Move up" @click=${() => this._moveIcon(index, "up")} ?disabled=${index === 0}>&#9650;</button>
                  <button class="icon-btn" title="Move down" @click=${() => this._moveIcon(index, "down")} ?disabled=${index === icons.length - 1}>&#9660;</button>
                  <button class="icon-btn remove-btn" title="Delete" @click=${() => this._removeIcon(index)}>&#10006;</button>
                </div>
              </div>

              <ha-entity-picker
                .label=${"Entity"}
                .hass=${this.hass}
                .value=${iconConf.entity || ""}
                @value-changed=${(e) => this._iconValueChanged(e, index, "entity")}
                allow-custom-entity
              ></ha-entity-picker>

              <ha-icon-picker
                .label=${"Icon (leave empty to use the entity's default icon)"}
                .hass=${this.hass}
                .value=${iconConf.icon || ""}
                @value-changed=${(e) => this._iconValueChanged(e, index, "icon")}
              ></ha-icon-picker>

              <div style="display: flex; gap: 8px;">
                ${this._renderColorPicker("Active Color", index, "active_color", "#FFC107")}
                ${this._renderColorPicker("Inactive Color", index, "inactive_color", "#FFFFFF")}
              </div>

              ${index > 0 ? html`
                <div class="checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      .checked=${Boolean(iconConf.new_row)}
                      @change=${(e) => this._iconCheckboxChanged(e, index, "new_row")}
                    />
                    Start on a new row
                  </label>
                </div>
              ` : ""}

              <div class="actions-container">
                ${this._renderActionConfig(index, "tap_action", "Tap Action (Short press)")}
                ${this._renderActionConfig(index, "hold_action", "Hold Action (Long press)")}
              </div>
            </div>
          `)}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button class="add-btn" style="flex: 1;" @click=${this._addIcon}>+ Add an icon</button>
          <button class="add-btn" style="flex: 1; border-style: solid;" @click=${this._pasteNewIcon}>📋 Paste as a new icon</button>
        </div>
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
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .input-field label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      input[type="text"], select {
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
        margin-top: 4px;
      }
      .action-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 6px;
      }
      .action-label {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        font-weight: 500;
      }
      .color-field {
        flex: 1;
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
      .color-input-group input[type="text"] {
        flex-grow: 1;
      }
      .checkbox-field {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0;
      }
      .checkbox-field label {
        font-size: 0.9em;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      
      hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 8px 0;
      }
      
      .icons-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .icon-config-block {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(127, 127, 127, 0.05);
      }
      .icon-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 8px;
        margin-bottom: 4px;
      }
      .icon-actions {
        display: flex;
        gap: 4px;
      }
      .icon-btn {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        padding: 4px 8px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .copy-btn {
        color: var(--info-color, #2196f3);
      }
      .paste-btn {
        color: var(--success-color, #4caf50);
      }
      .remove-btn {
        color: var(--error-color, #f44336);
      }
      .actions-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-left: 3px solid var(--primary-color);
        padding-left: 10px;
        margin-top: 4px;
      }
      .confirm-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;
      }
      .add-btn {
        padding: 10px;
        border-radius: 4px;
        border: 2px dashed var(--primary-color);
        background: transparent;
        color: var(--primary-color);
        font-weight: bold;
        cursor: pointer;
        text-align: center;
        transition: background 0.2s;
      }
      .add-btn:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get("ha-plooum-gridicons-card")) {
  customElements.define("ha-plooum-gridicons-card", HaPlooumGridIconsCard);
}
if (!customElements.get("ha-plooum-gridicons-card-editor")) {
  customElements.define("ha-plooum-gridicons-card-editor", HaPlooumGridIconsCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === "ha-plooum-gridicons-card")) {
  window.customCards.push({
    type: "ha-plooum-gridicons-card",
    name: "Ha Plooum GridIcons Card",
    description: "A custom card to display multiple entity icons side by side within a single pill.",
    preview: true,
  });
}