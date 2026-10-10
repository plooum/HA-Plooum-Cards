import { LitElement, html, css } from "lit";

/* ==========================================================================
   MAIN CARD : ha-plooum-temp-humidity-card
   ========================================================================== */
class HaPlooumTempHumidityCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _titleAsBadge: { state: true },
    };
  }

  connectedCallback() {
    super.connectedCallback();
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
    return Boolean(this.config && this.config.condensed);
  }

  // Condensed layout: the title moves into a badge on the top border when it no longer fits
  // between the icon and the values. The hidden .measure span gives the title's natural width,
  // so the decision doesn't depend on the current layout (no flip-flop between the two layouts).
  _fitTitle() {
    const root = this.shadowRoot;
    const row = this._condensed && root && root.querySelector(".condensed-row");
    const measure = row && row.querySelector(".measure");
    if (!row || !measure || !row.clientWidth) {
      if (this._titleAsBadge) this._titleAsBadge = false;
      return;
    }
    const icon = row.querySelector(".main-icon-wrapper");
    const values = row.querySelector(".values-container");
    const needed =
      (icon ? icon.offsetWidth + 10 : 0) + measure.offsetWidth + 10 + (values ? values.offsetWidth : 0);
    const asBadge = needed > row.clientWidth;
    if (asBadge !== this._titleAsBadge) this._titleAsBadge = asBadge;
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-temp-humidity-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Title",
      title_font_size: "15px",
      title_margin_bottom: "3px",
      card_padding: "4px",
      values_gap: "0px",
      icon_text_gap: "0px",
      main_icon: "mdi:sofa",
      main_icon_color: "#FFFFFF",
      main_icon_size: "32px",
      main_icon_offset_x: "3px",
      main_icon_offset_y: "0px",
      temp_entity: "",
      temp_icon: "mdi:thermometer",
      show_temp_icon: true,
      temp_color: "#E57373",
      temp_decimals: 1,
      temp_unit: "",
      temp_font_size: "13px",
      temp_icon_size: "1.2em",
      temp_tap_action: { action: "more-info" },
      temp_hold_action: { action: "none" },
      humidity_entity: "",
      humidity_icon: "mdi:water",
      show_humidity_icon: true,
      humidity_color: "#4FC3F7",
      humidity_decimals: 1,
      humidity_unit: "",
      humidity_font_size: "13px",
      humidity_icon_size: "1.2em",
      humidity_tap_action: { action: "more-info" },
      humidity_hold_action: { action: "none" },
      center_values: true,
      tap_action: { action: "none" },
      hold_action: { action: "none" },
    };
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    if (this._condensed) {
      // One grid row: the height of a button card.
      return { columns: 6, rows: 1, min_columns: 3, min_rows: 1 };
    }
    return {
      columns: 6,
      rows: 2,
      min_columns: 3,
      min_rows: 1,
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = { ...config };
  }

  _formatValue(value, decimals) {
    if (value === undefined || value === null || value === "" || value === "unavailable" || value === "unknown") {
      return value ?? "N/A";
    }
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    if (decimals !== undefined && decimals !== null && decimals !== "") {
      const dec = parseInt(decimals, 10);
      if (!isNaN(dec)) {
        return num.toFixed(dec);
      }
    }
    return num;
  }

  _formatCssUnit(val, defaultVal) {
    if (val === undefined || val === null || String(val).trim() === "") return defaultVal;
    const str = String(val).trim();
    if (/^-?\d+(\.\d+)?$/.test(str)) {
      return `${str}px`;
    }
    return str;
  }

  /* --- Action handling (Tap & Hold per target) --- */
  _handlePointerDown(e, targetKey) {
    e.stopPropagation();
    this._activeTarget = targetKey;
    this._startPos = { x: e.clientX, y: e.clientY };
    this._isHold = false;
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
    }
    this._holdTimer = setTimeout(() => {
      this._isHold = true;
      this._holdTimer = null;
      this._executeAction(this._activeTarget, "hold");
    }, 500);
  }

  _handlePointerMove(e) {
    if (!this._startPos) return;
    const dx = Math.abs(e.clientX - this._startPos.x);
    const dy = Math.abs(e.clientY - this._startPos.y);
    if (dx > 10 || dy > 10) {
      if (this._holdTimer) {
        clearTimeout(this._holdTimer);
        this._holdTimer = null;
      }
    }
  }

  _handlePointerUp(e) {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
      if (!this._isHold && this._activeTarget) {
        this._executeAction(this._activeTarget, "tap");
      }
    }
    this._isHold = false;
    this._startPos = null;
    this._activeTarget = null;
  }

  _handlePointerCancel() {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = null;
    }
    this._isHold = false;
    this._startPos = null;
    this._activeTarget = null;
  }

  _executeAction(targetKey, actionType) {
    let actionConfig = null;
    let entityId = "";

    if (targetKey === "temp") {
      actionConfig =
        this.config[`temp_${actionType}_action`] ||
        (actionType === "tap" ? this.config.tap_action || { action: "more-info" } : this.config.hold_action);
      entityId = this.config.temp_entity;
    } else if (targetKey === "humidity") {
      actionConfig =
        this.config[`humidity_${actionType}_action`] ||
        (actionType === "tap" ? this.config.tap_action || { action: "more-info" } : this.config.hold_action);
      entityId = this.config.humidity_entity;
    } else {
      actionConfig = this.config[`${actionType}_action`];
      entityId = actionConfig?.entity || this.config.temp_entity || this.config.humidity_entity;
    }

    if (!actionConfig || !actionConfig.action || actionConfig.action === "none") return;

    const action = actionConfig.action;

    switch (action) {
      case "more-info": {
        if (entityId) {
          const event = new CustomEvent("hass-more-info", {
            detail: { entityId },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(event);
        }
        break;
      }
      case "toggle": {
        if (entityId) {
          const domain = entityId.split(".")[0];
          this.hass.callService(domain, "toggle", { entity_id: entityId });
        }
        break;
      }
      case "navigate": {
        const path = actionConfig.navigation_path;
        if (path) {
          history.pushState(null, "", path);
          const event = new CustomEvent("location-changed", {
            bubbles: true,
            composed: true,
          });
          window.dispatchEvent(event);
        }
        break;
      }
      case "call-service": {
        const service = actionConfig.service;
        if (service) {
          const parts = service.split(".");
          if (parts.length === 2) {
            this.hass.callService(parts[0], parts[1], actionConfig.service_data || {});
          } else {
            this.hass.callService("script", service, actionConfig.service_data || {});
          }
        }
        break;
      }
    }
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const {
      title = "Title",
      title_font_size = "15px",
      title_margin_bottom = "3px",
      card_padding = "4px",
      values_gap = "0px",
      icon_text_gap = "0px",
      main_icon = "mdi:sofa",
      main_icon_color = "#FFFFFF",
      main_icon_size = "32px",
      main_icon_offset_x = "3px",
      main_icon_offset_y = "0px",
      temp_entity,
      temp_icon = "mdi:thermometer",
      show_temp_icon = true,
      temp_color = "#E57373",
      temp_decimals = 1,
      temp_unit,
      temp_font_size = "13px",
      temp_icon_size = "1.2em",
      humidity_entity,
      humidity_icon = "mdi:water",
      show_humidity_icon = true,
      humidity_color = "#4FC3F7",
      humidity_decimals = 1,
      humidity_unit,
      humidity_font_size = "13px",
      humidity_icon_size = "1.2em",
      center_values = true,
    } = this.config;

    // Temperature
    const tempStateObj = temp_entity ? this.hass.states[temp_entity] : null;
    const tempRawVal = tempStateObj ? tempStateObj.state : undefined;
    const tempFormattedVal = this._formatValue(tempRawVal, temp_decimals);
    const tempUnit =
      temp_unit !== undefined && temp_unit !== null && String(temp_unit).trim() !== ""
        ? temp_unit
        : tempStateObj?.attributes?.unit_of_measurement || "°C";

    // Humidity
    const humStateObj = humidity_entity ? this.hass.states[humidity_entity] : null;
    const humRawVal = humStateObj ? humStateObj.state : undefined;
    const humFormattedVal = this._formatValue(humRawVal, humidity_decimals);
    const humUnit =
      humidity_unit !== undefined && humidity_unit !== null && String(humidity_unit).trim() !== ""
        ? humidity_unit
        : humStateObj?.attributes?.unit_of_measurement || "%";

    const hasMainIcon = Boolean(main_icon && main_icon.trim() !== "");
    const shouldCenter = center_values || !hasMainIcon;

    const formattedPadding = this._formatCssUnit(card_padding, "4px");
    const formattedTitleMarginBottom = this._formatCssUnit(title_margin_bottom, "3px");
    const formattedTitleFontSize = this._formatCssUnit(title_font_size, "15px");
    const formattedValuesGap = this._formatCssUnit(values_gap, "0px");
    const formattedIconTextGap = this._formatCssUnit(icon_text_gap, "0px");
    const offsetX = this._formatCssUnit(main_icon_offset_x, "3px");
    const offsetY = this._formatCssUnit(main_icon_offset_y, "0px");

    const iconTpl = hasMainIcon
      ? html`
          <div
            class="main-icon-wrapper"
            style="transform: translate(${offsetX}, ${offsetY});"
          >
            <ha-icon
              icon="${main_icon}"
              style="--mdc-icon-size: ${main_icon_size}; width: ${main_icon_size}; height: ${main_icon_size}; color: ${main_icon_color};"
            ></ha-icon>
          </div>
        `
      : "";

    const valuesTpl = html`
      <div class="values-container" style="gap: ${formattedValuesGap};">
        <!-- Temperature row -->
        <div
          class="value-row clickable"
          style="color: ${temp_color}; font-size:${this._formatCssUnit(temp_font_size, "13px")}; gap: ${formattedIconTextGap};"
          @pointerdown=${(e) => this._handlePointerDown(e, "temp")}
          @pointermove=${this._handlePointerMove}
          @pointerup=${this._handlePointerUp}
          @pointercancel=${this._handlePointerCancel}
        >
          ${show_temp_icon && temp_icon
            ? html`<ha-icon
                class="val-icon"
                icon="${temp_icon}"
                style="--mdc-icon-size: ${temp_icon_size}; width: ${temp_icon_size}; height: ${temp_icon_size};"
              ></ha-icon>`
            : ""}
          <span class="value-text"
            >${tempFormattedVal}<span class="unit">${tempUnit}</span></span
          >
        </div>

        <!-- Humidity row -->
        <div
          class="value-row clickable"
          style="color: ${humidity_color}; font-size:${this._formatCssUnit(humidity_font_size, "13px")}; gap: ${formattedIconTextGap};"
          @pointerdown=${(e) => this._handlePointerDown(e, "humidity")}
          @pointermove=${this._handlePointerMove}
          @pointerup=${this._handlePointerUp}
          @pointercancel=${this._handlePointerCancel}
        >
          ${show_humidity_icon && humidity_icon
            ? html`<ha-icon
                class="val-icon"
                icon="${humidity_icon}"
                style="--mdc-icon-size: ${humidity_icon_size}; width: ${humidity_icon_size}; height: ${humidity_icon_size};"
              ></ha-icon>`
            : ""}
          <span class="value-text"
            >${humFormattedVal}<span class="unit">${humUnit}</span></span
          >
        </div>
      </div>
    `;

    const pointerHandlers = (e) => this._handlePointerDown(e, "card");
    const hasTitle = Boolean(title && title.trim() !== "");

    if (this._condensed) {
      const badgeClass = this._titleAsBadge
        ? `badge-title ${this.config.badge_position === "right" ? "badge-right" : ""}`
        : "";
      return html`
        <ha-card
          class="plooum-th-card condensed ${badgeClass}"
          style="padding: 4px 12px;"
          title=${this._titleAsBadge ? title : ""}
          @pointerdown=${pointerHandlers}
          @pointermove=${this._handlePointerMove}
          @pointerup=${this._handlePointerUp}
          @pointercancel=${this._handlePointerCancel}
        >
          <div class="condensed-row ${hasMainIcon ? "" : "no-icon"}">
            ${iconTpl}
            ${hasTitle
              ? html`<div class="card-title" style="font-size: ${formattedTitleFontSize};">${title}</div>
                  <span class="card-title measure" aria-hidden="true" style="font-size: ${formattedTitleFontSize};"
                    >${title}</span
                  >`
              : ""}
            ${valuesTpl}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card
        class="plooum-th-card"
        style="padding: ${formattedPadding};"
        @pointerdown=${pointerHandlers}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @pointercancel=${this._handlePointerCancel}
      >
        ${hasTitle
          ? html`<div
              class="card-title"
              style="font-size: ${formattedTitleFontSize}; margin-bottom: ${formattedTitleMarginBottom};"
            >
              ${title}
            </div>`
          : ""}

        <div class="card-body ${shouldCenter ? "centered" : ""}">
          ${iconTpl}
          ${valuesTpl}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .plooum-th-card {
        background: rgba(0, 0, 0, 0.35);
        border-radius: 20px;
        box-sizing: border-box;
        box-shadow: none;
        border: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .card-title {
        text-align: center;
        font-weight: 700;
        color: var(--primary-text-color, #ffffff);
        line-height: 1.2;
      }
      .card-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      .card-body.centered {
        justify-content: center;
      }
      .main-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }
      .values-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .card-body.centered .values-container {
        align-items: center;
      }
      .value-row {
        display: flex;
        align-items: center;
        font-weight: 700;
        line-height: 1.1;
        padding: 2px 6px;
        border-radius: 8px;
        transition: background-color 0.15s ease;
      }
      .value-row.clickable {
        cursor: pointer;
      }
      .value-row.clickable:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }
      .value-row.clickable:active {
        background-color: rgba(255, 255, 255, 0.15);
      }
      .val-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .value-text {
        letter-spacing: 0.5px;
      }
      .unit {
        font-size: 0.8em;
        margin-left: 1px;
      }
      /* Condensed: icon, title and values on one line, the height of a button card (56px). */
      .plooum-th-card.condensed {
        position: relative;
        min-height: 56px;
        height: 100%;
      }
      /* No position here: the badge and the measure are placed against the card. */
      .condensed-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .condensed-row .card-title {
        flex: 1 1 auto;
        min-width: 0;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .condensed-row .measure {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        flex: none;
        overflow: visible;
      }
      .condensed-row .values-container {
        flex: none;
        margin-left: auto;
        align-items: flex-end;
      }
      .condensed-row .value-row {
        padding: 1px 6px;
      }
      /* Not enough room: icon and values keep the line, the title becomes a tab on the top border. */
      .badge-title .condensed-row .values-container {
        margin-left: auto;
      }
      .badge-title .condensed-row.no-icon .values-container {
        margin-right: auto;
        align-items: center;
      }
      .badge-title .card-title:not(.measure) {
        position: absolute;
        top: -8px;
        left: 14px;
        max-width: calc(100% - 28px);
        box-sizing: border-box;
        padding: 0 7px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.6);
        font-size: 10px !important;
        line-height: 16px;
        font-weight: 500;
        letter-spacing: 0.3px;
      }
      .badge-title.badge-right .card-title:not(.measure) {
        left: auto;
        right: 14px;
      }
    `;
  }
}

/* ==========================================================================
   CARD EDITOR : ha-plooum-temp-humidity-card-editor
   ========================================================================== */
class HaPlooumTempHumidityCardEditor extends LitElement {
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
    if (customElements.get("ha-entity-picker")) return;
    if (window.loadCardHelpers) {
      const helpers = await window.loadCardHelpers();
      if (helpers) {
        await helpers.createCardElement({ type: "button" });
        this.requestUpdate();
      }
    }
  }

  setConfig(config) {
    this._config = { ...config };
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

  _checkboxChanged(ev, key) {
    if (!this._config || !this.hass) return;
    const val = ev.target.checked;
    if (this._config[key] === val) return;
    this._fireConfigChange({ ...this._config, [key]: val });
  }

  _actionChanged(ev, actionKey, field) {
    if (!this._config || !this.hass) return;
    const val = ev.detail?.value !== undefined ? ev.detail.value : ev.target?.value;
    const currentActionObj = this._config[actionKey] || { action: "none" };
    const updatedActionObj = { ...currentActionObj, [field]: val };
    this._fireConfigChange({ ...this._config, [actionKey]: updatedActionObj });
  }

  _renderColorPicker(labelTitle, key, defaultColor) {
    const val = this._config && this._config[key] !== undefined ? this._config[key] : defaultColor;
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
          <input type="color" .value=${hexColor} @input=${(e) => this._valueChanged(e, key)} />
          <input type="text" .value=${val} placeholder=${defaultColor} @input=${(e) => this._valueChanged(e, key)} />
        </div>
      </div>
    `;
  }

  _renderActionBlock(title, actionKey, defaultEntityLabel, hideEntityPicker = false) {
    const actionObj = this._config[actionKey] || { action: "none" };
    const selectedAction = actionObj.action || "none";

    return html`
      <div class="action-block">
        <span class="action-block-title">${title}</span>
        <div class="input-field">
          <select
            .value=${selectedAction}
            @change=${(e) => this._actionChanged(e, actionKey, "action")}
          >
            <option value="none">No action</option>
            <option value="more-info">Show more info (more-info)</option>
            <option value="toggle">Toggle the entity</option>
            <option value="navigate">Navigate</option>
            <option value="call-service">Run a script / service</option>
          </select>
        </div>

        ${!hideEntityPicker && (selectedAction === "more-info" || selectedAction === "toggle")
          ? html`
              <ha-entity-picker
                .label=${defaultEntityLabel || "Target entity (leave empty for the default entity)"}
                .hass=${this.hass}
                .value=${actionObj.entity || ""}
                @value-changed=${(e) => this._actionChanged(e, actionKey, "entity")}
                allow-custom-entity
              ></ha-entity-picker>
            `
          : ""}
        ${selectedAction === "navigate"
          ? html`
              <div class="input-field">
                <label>Navigation path (e.g. /lovelace/living-room)</label>
                <input
                  type="text"
                  placeholder="/lovelace/1"
                  .value=${actionObj.navigation_path || ""}
                  @input=${(e) => this._actionChanged(e, actionKey, "navigation_path")}
                />
              </div>
            `
          : ""}
        ${selectedAction === "call-service"
          ? html`
              <div class="input-field">
                <label>Script / Service (e.g. script.my_script or light.turn_on)</label>
                <input
                  type="text"
                  placeholder="script.script_name"
                  .value=${actionObj.service || ""}
                  @input=${(e) => this._actionChanged(e, actionKey, "service")}
                />
              </div>
            `
          : ""}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="card-config">
        <!-- General Settings -->
        <h3>General Settings</h3>
        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 2;">
            <label>Title (leave empty to hide)</label>
            <input
              type="text"
              placeholder="Title"
              .value=${this._config.title !== undefined ? this._config.title : "Title"}
              @input=${(e) => this._valueChanged(e, "title")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Title size</label>
            <input
              type="text"
              placeholder="15px"
              .value=${this._config.title_font_size || "15px"}
              @input=${(e) => this._valueChanged(e, "title_font_size")}
            />
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>Title bottom margin</label>
            <input
              type="text"
              placeholder="3px"
              .value=${this._config.title_margin_bottom || "3px"}
              @input=${(e) => this._valueChanged(e, "title_margin_bottom")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Card padding</label>
            <input
              type="text"
              placeholder="4px"
              .value=${this._config.card_padding || "4px"}
              @input=${(e) => this._valueChanged(e, "card_padding")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Values spacing (gap)</label>
            <input
              type="text"
              placeholder="0px"
              .value=${this._config.values_gap || "0px"}
              @input=${(e) => this._valueChanged(e, "values_gap")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Icon/text spacing (gap)</label>
            <input
              type="text"
              placeholder="0px"
              .value=${this._config.icon_text_gap || "0px"}
              @input=${(e) => this._valueChanged(e, "icon_text_gap")}
            />
          </div>
        </div>

        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${this._config.center_values !== undefined ? Boolean(this._config.center_values) : true}
              @change=${(e) => this._checkboxChanged(e, "center_values")}
            />
            Center values horizontally
          </label>
        </div>

        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${Boolean(this._config.condensed)}
              @change=${(e) => this._checkboxChanged(e, "condensed")}
            />
            Condensed (icon, title and values on one line)
          </label>
        </div>

        ${this._config.condensed
          ? html`
              <div class="input-field">
                <label>Title badge position (when the line is too narrow)</label>
                <select
                  .value=${this._config.badge_position || "left"}
                  @change=${(e) => this._valueChanged(e, "badge_position")}
                >
                  <option value="left">Top left</option>
                  <option value="right">Top right</option>
                </select>
              </div>
            `
          : ""}

        <hr />

        <!-- Card Fallback Actions -->
        <h3>Global card actions (Background / Title)</h3>
        ${this._renderActionBlock("Tap Action (Card short press)", "tap_action", "Default target entity", false)}
        ${this._renderActionBlock("Hold Action (Card long press)", "hold_action", "Default target entity", false)}

        <hr />

        <!-- Main Icon (Left) -->
        <h3>Main Icon (Left)</h3>
        <ha-icon-picker
          .label=${"Main icon (leave empty to hide)"}
          .hass=${this.hass}
          .value=${this._config.main_icon !== undefined ? this._config.main_icon : "mdi:sofa"}
          @value-changed=${(e) => this._valueChanged(e, "main_icon")}
        ></ha-icon-picker>

        <div style="display: flex; gap: 8px;">
          ${this._renderColorPicker("Icon color", "main_icon_color", "#FFFFFF")}
          <div class="input-field" style="flex: 1;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="32px"
              .value=${this._config.main_icon_size || "32px"}
              @input=${(e) => this._valueChanged(e, "main_icon_size")}
            />
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <div class="input-field" style="flex: 1;">
            <label>X offset (e.g. 5px, -10px)</label>
            <input
              type="text"
              placeholder="3px"
              .value=${this._config.main_icon_offset_x || "3px"}
              @input=${(e) => this._valueChanged(e, "main_icon_offset_x")}
            />
          </div>
          <div class="input-field" style="flex: 1;">
            <label>Y offset (e.g. 5px, -10px)</label>
            <input
              type="text"
              placeholder="0px"
              .value=${this._config.main_icon_offset_y || "0px"}
              @input=${(e) => this._valueChanged(e, "main_icon_offset_y")}
            />
          </div>
        </div>

        <hr />

        <!-- Temperature Section -->
        <h3>Temperature Settings</h3>
        <ha-entity-picker
          .label=${"Temperature entity"}
          .hass=${this.hass}
          .value=${this._config.temp_entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "temp_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${this._config.show_temp_icon !== false}
              @change=${(e) => this._checkboxChanged(e, "show_temp_icon")}
            />
            Show temperature icon
          </label>
        </div>

        ${this._config.show_temp_icon !== false
          ? html`
              <ha-icon-picker
                .label=${"Temperature icon"}
                .hass=${this.hass}
                .value=${this._config.temp_icon || "mdi:thermometer"}
                @value-changed=${(e) => this._valueChanged(e, "temp_icon")}
              ></ha-icon-picker>
            `
          : ""}

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${this._renderColorPicker("Color", "temp_color", "#E57373")}
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Text size</label>
            <input
              type="text"
              placeholder="13px"
              .value=${this._config.temp_font_size || "13px"}
              @input=${(e) => this._valueChanged(e, "temp_font_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="1.2em"
              .value=${this._config.temp_icon_size || "1.2em"}
              @input=${(e) => this._valueChanged(e, "temp_icon_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Decimals</label>
            <input
              type="number"
              min="0"
              max="5"
              placeholder="1"
              .value=${this._config.temp_decimals !== undefined ? this._config.temp_decimals : 1}
              @input=${(e) => this._valueChanged(e, "temp_decimals")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Unit (e.g. °C, °F)</label>
            <input
              type="text"
              placeholder="Auto (°C)"
              .value=${this._config.temp_unit !== undefined ? this._config.temp_unit : ""}
              @input=${(e) => this._valueChanged(e, "temp_unit")}
            />
          </div>
        </div>

        ${this._renderActionBlock("Tap Action (Temperature)", "temp_tap_action", "", true)}
        ${this._renderActionBlock("Hold Action (Temperature)", "temp_hold_action", "", true)}

        <hr />

        <!-- Humidity Section -->
        <h3>Humidity Settings</h3>
        <ha-entity-picker
          .label=${"Humidity entity"}
          .hass=${this.hass}
          .value=${this._config.humidity_entity || ""}
          @value-changed=${(e) => this._valueChanged(e, "humidity_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${this._config.show_humidity_icon !== false}
              @change=${(e) => this._checkboxChanged(e, "show_humidity_icon")}
            />
            Show humidity icon
          </label>
        </div>

        ${this._config.show_humidity_icon !== false
          ? html`
              <ha-icon-picker
                .label=${"Humidity icon"}
                .hass=${this.hass}
                .value=${this._config.humidity_icon || "mdi:water"}
                @value-changed=${(e) => this._valueChanged(e, "humidity_icon")}
              ></ha-icon-picker>
            `
          : ""}

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${this._renderColorPicker("Color", "humidity_color", "#4FC3F7")}
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Text size</label>
            <input
              type="text"
              placeholder="13px"
              .value=${this._config.humidity_font_size || "13px"}
              @input=${(e) => this._valueChanged(e, "humidity_font_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 80px;">
            <label>Icon size</label>
            <input
              type="text"
              placeholder="1.2em"
              .value=${this._config.humidity_icon_size || "1.2em"}
              @input=${(e) => this._valueChanged(e, "humidity_icon_size")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Decimals</label>
            <input
              type="number"
              min="0"
              max="5"
              placeholder="1"
              .value=${this._config.humidity_decimals !== undefined ? this._config.humidity_decimals : 1}
              @input=${(e) => this._valueChanged(e, "humidity_decimals")}
            />
          </div>
          <div class="input-field" style="flex: 1; min-width: 70px;">
            <label>Unit (e.g. %)</label>
            <input
              type="text"
              placeholder="Auto (%)"
              .value=${this._config.humidity_unit !== undefined ? this._config.humidity_unit : ""}
              @input=${(e) => this._valueChanged(e, "humidity_unit")}
            />
          </div>
        </div>

        ${this._renderActionBlock("Tap Action (Humidity)", "humidity_tap_action", "", true)}
        ${this._renderActionBlock("Hold Action (Humidity)", "humidity_hold_action", "", true)}
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
      .action-block {
        background: rgba(0, 0, 0, 0.03);
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--divider-color, #eee);
        margin-top: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .action-block-title {
        font-weight: 600;
        font-size: 0.85em;
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
      input[type="text"],
      input[type="number"],
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
      ha-icon-picker {
        width: 100%;
        display: block;
        margin-top: 4px;
      }
      .color-field {
        flex: 1;
        min-width: 110px;
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
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get("ha-plooum-temp-humidity-card")) {
  customElements.define("ha-plooum-temp-humidity-card", HaPlooumTempHumidityCard);
}
if (!customElements.get("ha-plooum-temp-humidity-card-editor")) {
  customElements.define("ha-plooum-temp-humidity-card-editor", HaPlooumTempHumidityCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "ha-plooum-temp-humidity-card")) {
  window.customCards.push({
    type: "ha-plooum-temp-humidity-card",
    name: "Ha Plooum Room Temp & Humidity Card",
    description: "Display room temperature and humidity with customizable layout, padding, font sizes, units, and individual tap/hold actions.",
    preview: true,
  });
}