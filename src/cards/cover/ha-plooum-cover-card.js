// ha-plooum-cover-card.js

// ==========================================
// 1. SAFE LOADING OF LITELEMENT
// ==========================================
const getLit = () => {
  if (window.LitElement) {
    return window.LitElement;
  }
  const elements = ["hui-masonry-view", "ha-panel-lovelace", "hui-view"];
  for (let i = 0; i < elements.length; i++) {
    const ce = customElements.get(elements[i]);
    if (ce) {
      return Object.getPrototypeOf(ce);
    }
  }
  return null;
};

const LitElement = getLit();
let html = window.html;
let css = window.css;
if (LitElement) {
  if (LitElement.prototype.html) {
    html = LitElement.prototype.html;
  }
  if (LitElement.prototype.css) {
    css = LitElement.prototype.css;
  }
}

// ==========================================
// 2. CONFIGURATION UI (EDITOR)
// ==========================================
class PlooumCoverCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._config.covers) {
      this._config.covers = [];
    } else {
      this._config.covers = this._config.covers.map(cover => {
        return Object.assign({
          slider_bg_color: "#222222",
          slider_progress_color: "#888888",
          slider_thumb_color: "#ffffff",
          name_color: "#ffffff"
        }, cover);
      });
    }
  }

  _valueChanged(ev, key) {
    if (!this._config) return;
    if (!this.hass) return;
    const value = ev.detail !== undefined && ev.detail.value !== undefined ? ev.detail.value : ev.target.value;
    if (this._config[key] === value) return;

    const newConfig = Object.assign({}, this._config);
    newConfig[key] = value;
    this._config = newConfig;
    this._fireConfigChanged();
  }

  _coverValueChanged(ev, index, key) {
    if (!this._config) return;
    if (!this.hass) return;
    const value = ev.detail !== undefined && ev.detail.value !== undefined ? ev.detail.value : ev.target.value;
    const covers = Array.from(this._config.covers);
    const updatedCover = Object.assign({}, covers[index]);
    updatedCover[key] = value;
    covers[index] = updatedCover;

    const newConfig = Object.assign({}, this._config);
    newConfig.covers = covers;
    this._config = newConfig;
    this._fireConfigChanged();
  }

  _renderColorPicker(index, labelTitle, key, defaultColor) {
    const cover = this._config.covers[index] || {};
    const val = cover[key] !== undefined ? cover[key] : defaultColor;

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
            @input=${(e) => this._coverValueChanged(e, index, key)}
          />
          <input
            type="text"
            .value=${val}
            placeholder=${defaultColor}
            @input=${(e) => this._coverValueChanged(e, index, key)}
          />
        </div>
      </div>
    `;
  }

  _addCover() {
    let baseCovers = this._config.covers;
    if (!baseCovers) {
      baseCovers = [];
    }
    const covers = Array.from(baseCovers);
    covers.push({
      entity: "",
      show_name: true,
      name_color: "#ffffff",
      name_font_size: 14,
      percentage_font_size: 16,
      slider_width: 54,
      slider_bg_color: "#222222",
      slider_progress_color: "#888888",
      slider_thumb_color: "#ffffff",
      icon_up: "mdi:arrow-up",
      icon_down: "mdi:arrow-down",
      icon_stop: "mdi:square"
    });

    const newConfig = Object.assign({}, this._config);
    newConfig.covers = covers;
    this._config = newConfig;
    this._fireConfigChanged();
  }

  _removeCover(index) {
    const covers = Array.from(this._config.covers);
    covers.splice(index, 1);

    const newConfig = Object.assign({}, this._config);
    newConfig.covers = covers;
    this._config = newConfig;
    this._fireConfigChanged();
  }

  _fireConfigChanged() {
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass) return html``;
    if (!this._config) return html``;

    // The lock is enabled by default
    const lockEnabled = this._config.lock_enabled !== false;

    let lockDuration = Number(this._config.lock_duration);
    if (!isFinite(lockDuration) || lockDuration < 0) {
      lockDuration = 0;
    }

    let lockMsg = this._config.lock_message;
    if (lockMsg === undefined) {
      lockMsg = "Are you sure ?";
    }

    let spacing = this._config.vertical_spacing;
    if (spacing === undefined) {
      spacing = 6;
    }

    let coversList = this._config.covers;
    if (!coversList) {
      coversList = [];
    }

    return html`
      <div class="card-config">
        <h3>General settings</h3>

        <ha-selector
          .hass=${this.hass}
          .selector=${{ boolean: {} }}
          .value=${lockEnabled}
          .label=${"Enable lock"}
          .helper=${"Ask for a confirmation before sending any command."}
          @value-changed=${(ev) => this._valueChanged(ev, "lock_enabled")}
        ></ha-selector>

        ${lockEnabled ? html`
          <ha-selector
            .hass=${this.hass}
            .selector=${{ text: {} }}
            .value=${lockMsg}
            .label=${"Unlock message"}
            @value-changed=${(ev) => this._valueChanged(ev, "lock_message")}
          ></ha-selector>

          <ha-selector
            .hass=${this.hass}
            .selector=${{ number: { min: 0, max: 3600, step: 1, mode: "box", unit_of_measurement: "s" } }}
            .value=${lockDuration}
            .label=${"Unlock duration (seconds)"}
            .helper=${"0 = the card is locked again after each action (confirmation every time)."}
            @value-changed=${(ev) => this._valueChanged(ev, "lock_duration")}
          ></ha-selector>
        ` : ""}

        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { min: 0, max: 50, step: 1, mode: "slider" } }}
          .value=${spacing}
          .label=${"Vertical spacing (px)"}
          @value-changed=${(ev) => this._valueChanged(ev, "vertical_spacing")}
        ></ha-selector>

        <h3>Covers (${coversList.length})</h3>${coversList.map((cover, index) => {
          let coverName = cover.name;
          if (!coverName) coverName = "";

          let showName = cover.show_name;
          if (showName === undefined) showName = true;

          let nameFontSize = cover.name_font_size;
          if (nameFontSize === undefined) nameFontSize = 14;

          let pctFontSize = cover.percentage_font_size;
          if (pctFontSize === undefined) pctFontSize = 16;

          let sliderWidth = cover.slider_width;
          if (sliderWidth === undefined) sliderWidth = 54;

          let iconUp = cover.icon_up;
          if (!iconUp) iconUp = "mdi:arrow-up";

          let iconStop = cover.icon_stop;
          if (!iconStop) iconStop = "mdi:square";

          let iconDown = cover.icon_down;
          if (!iconDown) iconDown = "mdi:arrow-down";

          return html`
            <div class="cover-config">
              <div class="cover-header">
                <span>Cover ${index + 1}</span>
                <ha-icon-button label="Remove" @click=${() => this._removeCover(index)}>
                  <ha-icon icon="mdi:delete"></ha-icon>
                </ha-icon-button>
              </div>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: "cover" } }}
                .value=${cover.entity}
                .label=${"Cover entity"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "entity")}
              ></ha-selector>

              <div class="input-field">
                <label>Custom name (empty = default name)</label>
                <input
                  type="text"
                  .value=${coverName}
                  @input=${(e) => this._coverValueChanged(e, index, "name")}
                />
              </div>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${showName}
                .label=${"Show name"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "show_name")}
              ></ha-selector>

              ${this._renderColorPicker(index, "Name text color", "name_color", "#ffffff")}

              <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { min: 8, max: 32, step: 1, mode: "slider" } }}
                .value=${nameFontSize}
                .label=${"Name text size (px)"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "name_font_size")}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { min: 8, max: 32, step: 1, mode: "slider" } }}
                .value=${pctFontSize}
                .label=${"Percentage text size (px)"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "percentage_font_size")}
              ></ha-selector>

              <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { min: 20, max: 120, step: 1, mode: "slider" } }}
                .value=${sliderWidth}
                .label=${"Slider / column width (px)"}
                @value-changed=${(ev) => this._coverValueChanged(ev, index, "slider_width")}
              ></ha-selector>

              ${this._renderColorPicker(index, "Slider background color", "slider_bg_color", "#222222")}
              ${this._renderColorPicker(index, "Progress bar color", "slider_progress_color", "#888888")}
              ${this._renderColorPicker(index, "Thumb color", "slider_thumb_color", "#ffffff")}

              <div class="icon-column">
                <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${iconUp} .label=${"Up icon"} @value-changed=${(ev) => this._coverValueChanged(ev, index, "icon_up")}></ha-selector>
                <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${iconStop} .label=${"Stop icon"} @value-changed=${(ev) => this._coverValueChanged(ev, index, "icon_stop")}></ha-selector>
                <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${iconDown} .label=${"Down icon"} @value-changed=${(ev) => this._coverValueChanged(ev, index, "icon_down")}></ha-selector>
              </div>
            </div>
          `;
        })}

        <mwc-button raised @click=${this._addCover}>+ Add cover</mwc-button>
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config { display: flex; flex-direction: column; gap: 15px; }
      .cover-config { border: 1px solid var(--divider-color); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
      .cover-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
      .icon-column { display: flex; flex-direction: column; gap: 10px; }
      .input-field { display: flex; flex-direction: column; gap: 4px; }
      .input-field label { font-size: 0.85em; color: var(--secondary-text-color); }
      .color-input-group { display: flex; align-items: center; gap: 8px; }
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
      .color-input-group input[type="color"]::-webkit-color-swatch { border: 1px solid var(--divider-color, #ccc); border-radius: 4px; }
      .color-input-group input[type="text"] { flex-grow: 1; }
      input[type="text"] {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
        font-size: 14px;
      }
    `;
  }
}

// ==========================================
// 3. MAIN CARD
// ==========================================
const SLIDER_LENGTH = 220;   // slider length (height) in px
const THUMB_SIZE = 6;        // thumb thickness in px
const PENDING_TIMEOUT = 5000; // max time to wait for a state confirmation (ms)

class PlooumCoverCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
      _drag: {}
    };
  }

  constructor() {
    super();
    this._unlockedUntil = 0;  // timestamp at which the unlock expires
    this._drag = null;        // { entity, pointerId, value } while dragging
    this._ignorePointerUntil = 0; // ignore stray events right after a dialog
    this._pending = {};       // { [entity]: { value, from, timer } } command sent, state not received yet
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._drag = null;
    Object.keys(this._pending).forEach((id) => this._clearPending(id));
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-cover-card-editor");
  }

  static getStubConfig() {
    return {
      lock_enabled: true,
      lock_duration: 0,
      lock_message: "Are you sure ?",
      vertical_spacing: 6,
      covers: []
    };
  }

  getCardSize() {
    return 6;
  }

  setConfig(config) {
    if (!config.covers) {
      throw new Error("You must define at least one cover.");
    }
    this.config = Object.assign({}, config, {
      covers: config.covers.map(cover => Object.assign({
        slider_bg_color: "#222222",
        slider_progress_color: "#888888",
        slider_thumb_color: "#ffffff",
        name_color: "#ffffff"
      }, cover))
    });
    // A config change resets the unlock state
    this._unlockedUntil = 0;
  }

  // ------------------------------------------
  // Lock
  // ------------------------------------------
  _lockEnabled() {
    // Enabled by default
    return this.config.lock_enabled !== false;
  }

  _lockDurationMs() {
    const seconds = Number(this.config.lock_duration);
    if (!isFinite(seconds) || seconds <= 0) return 0;
    return seconds * 1000;
  }

  // Returns true if the action can be executed
  _checkLock() {
    if (!this._lockEnabled()) return true;

    const duration = this._lockDurationMs();
    if (duration > 0 && Date.now() < this._unlockedUntil) return true;

    let msg = this.config.lock_message;
    if (msg === undefined) {
      msg = "Are you sure ?";
    }
    if (!window.confirm(msg)) return false;

    // Duration 0: nothing is remembered, the next action will require confirmation again
    if (duration > 0) {
      this._unlockedUntil = Date.now() + duration;
    }
    return true;
  }

  // ------------------------------------------
  // Services
  // ------------------------------------------
  _callService(domain, service, entityId, data = {}) {
    if (!this._checkLock()) return;
    const serviceData = Object.assign({ entity_id: entityId }, data);
    return this.hass.callService(domain, service, serviceData);
  }

  // ------------------------------------------
  // Slider synchronisation
  // ------------------------------------------
  _positionOf(stateObj) {
    const p = stateObj.attributes.current_position;
    if (typeof p === "number" && isFinite(p)) {
      return Math.min(100, Math.max(0, Math.round(p)));
    }
    // Cover without position support
    if (stateObj.state === "open") return 100;
    return 0;
  }

  _clearPending(entityId) {
    const pending = this._pending[entityId];
    if (pending) {
      clearTimeout(pending.timer);
      delete this._pending[entityId];
    }
  }

  _setPending(entityId, value, from) {
    this._clearPending(entityId);
    const timer = setTimeout(() => {
      delete this._pending[entityId];
      this.requestUpdate();
    }, PENDING_TIMEOUT);
    this._pending[entityId] = { value: value, from: from, timer: timer };
  }

  // Value to display: drag in progress > pending command > actual state.
  // The display is always derived, so it cannot get stuck on a stale value.
  _displayPosition(entityId, realPosition) {
    if (this._drag && this._drag.entity === entityId) {
      return this._drag.value;
    }
    const pending = this._pending[entityId];
    if (pending) {
      if (pending.from === realPosition) {
        return pending.value; // HA has not answered yet
      }
      this._clearPending(entityId); // the state changed: follow the actual state again
    }
    return realPosition;
  }

  _valueFromPointer(e, el) {
    const rect = el.getBoundingClientRect();
    const inset = THUMB_SIZE / 2;
    const usable = rect.height - 2 * inset;
    if (usable <= 0) return 0;
    const ratio = (rect.bottom - inset - e.clientY) / usable;
    return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  }

  _onSliderDown(e, entityId) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (Date.now() < this._ignorePointerUntil) return; // stray click after the confirmation dialog
    if (this._drag) return; // only one drag at a time
    e.preventDefault();
    // A new gesture cancels any "pending" value from a previous action:
    // if this gesture is cancelled, we must go back to the actual state, not to the old setpoint.
    this._clearPending(entityId);
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    this._drag = {
      entity: entityId,
      pointerId: e.pointerId,
      value: this._valueFromPointer(e, el)
    };
  }

  _onSliderMove(e) {
    if (!this._drag || this._drag.pointerId !== e.pointerId) return;
    if (e.pointerType === "mouse" && e.buttons === 0) {
      this._drag = null; // button released without pointerup: abandon the drag
      return;
    }
    const value = this._valueFromPointer(e, e.currentTarget);
    if (value !== this._drag.value) {
      this._drag = Object.assign({}, this._drag, { value: value });
    }
  }

  _onSliderUp(e) {
    if (!this._drag || this._drag.pointerId !== e.pointerId) return;
    const entityId = this._drag.entity;
    const value = this._valueFromPointer(e, e.currentTarget);
    this._drag = null;
    this._commitPosition(entityId, value);
  }

  _onSliderCancel(e) {
    if (!this._drag || this._drag.pointerId !== e.pointerId) return;
    this._drag = null; // back to the actual state
  }

  _onSliderKey(e, entityId, current) {
    let value = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") value = current + 5;
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") value = current - 5;
    else if (e.key === "PageUp") value = current + 10;
    else if (e.key === "PageDown") value = current - 10;
    else if (e.key === "Home") value = 0;
    else if (e.key === "End") value = 100;
    if (value === null) return;
    e.preventDefault();
    this._commitPosition(entityId, Math.min(100, Math.max(0, value)));
  }

  _commitPosition(entityId, value) {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return;
    const real = this._positionOf(stateObj);
    if (value === real) return;

    // Keep the displayed value during the confirmation
    this._setPending(entityId, value, real);
    this.requestUpdate();

    // The confirmation is opened AFTER the pointer event has ended,
    // so that the dialog does not disturb the gesture in progress.
    setTimeout(() => {
      const allowed = this._checkLock();
      // Ignore stray events that follow the dialog closing
      this._ignorePointerUntil = Date.now() + 500;
      this._drag = null;

      if (!allowed) {
        // Declined: no command, explicit return to the actual state
        this._clearPending(entityId);
        this.requestUpdate();
        return;
      }

      this._setPending(entityId, value, real); // restart the wait timeout
      let result;
      try {
        result = this.hass.callService("cover", "set_cover_position", {
          entity_id: entityId,
          position: value
        });
      } catch (err) {
        this._clearPending(entityId);
        this.requestUpdate();
        return;
      }
      Promise.resolve(result).catch(() => {
        // Service call failed: immediately go back to the actual state
        this._clearPending(entityId);
        this.requestUpdate();
      });
    }, 0);
  }

  // ------------------------------------------
  // Rendering
  // ------------------------------------------
  render() {
    if (!this.config) return html``;
    if (!this.hass) return html``;

    let spacing = this.config.vertical_spacing;
    if (spacing === undefined) {
      spacing = 6;
    }

    return html`
      <ha-card style="--card-spacing: ${spacing}px;">
        <div class="covers-container">
          ${this.config.covers.map((coverConfig) => this._renderCover(coverConfig))}
        </div>
      </ha-card>
    `;
  }

  _renderCover(cover) {
    const stateObj = this.hass.states[cover.entity];
    if (!stateObj) return html`<div class="cover-column">Entity not found</div>`;

    const realPosition = this._positionOf(stateObj);
    const position = this._displayPosition(cover.entity, realPosition);
    const unavailable = stateObj.state === "unavailable";

    let displayName = cover.name;
    if (!displayName) {
      if (stateObj.attributes.friendly_name) {
        displayName = stateObj.attributes.friendly_name;
      } else {
        displayName = cover.entity;
      }
    }

    let sliderWidth = cover.slider_width;
    if (sliderWidth === undefined) sliderWidth = 54;

    let nameFontSize = cover.name_font_size;
    if (nameFontSize === undefined) nameFontSize = 14;

    let percentageFontSize = cover.percentage_font_size;
    if (percentageFontSize === undefined) percentageFontSize = 16;

    let textColor = cover.name_color;
    if (!textColor) {
      textColor = "#ffffff";
    }

    let sliderBgColor = cover.slider_bg_color;
    if (!sliderBgColor) sliderBgColor = "#222222";

    let sliderProgColor = cover.slider_progress_color;
    if (!sliderProgColor) sliderProgColor = "#888888";

    let sliderThumbColor = cover.slider_thumb_color;
    if (!sliderThumbColor) sliderThumbColor = "#ffffff";

    let iconUp = cover.icon_up;
    if (!iconUp) iconUp = "mdi:arrow-up";

    let iconDown = cover.icon_down;
    if (!iconDown) iconDown = "mdi:arrow-down";

    let iconStop = cover.icon_stop;
    if (!iconStop) iconStop = "mdi:square";

    let showName = cover.show_name;
    if (showName === undefined) showName = true;

    return html`
      <div class="cover-column">

        <!-- Position in % -->
        <div class="percentage" style="font-size: ${percentageFontSize}px;">${position}%</div>

        <!-- Up button -->
        <ha-icon
          class="control-icon"
          .icon=${iconUp}
          @click=${() => this._callService('cover', 'open_cover', cover.entity)}>
        </ha-icon>

        <!-- Slider (pointer events, touch-action: none => never scrolls the page) -->
        <div class="slider-wrapper" style="--slider-width: ${sliderWidth}px; --slider-bg: ${sliderBgColor}; --slider-prog: ${sliderProgColor}; --slider-thumb: ${sliderThumbColor};">
          <div
            class="slider ${unavailable ? "disabled" : ""}"
            role="slider"
            tabindex=${unavailable ? "-1" : "0"}
            aria-label=${displayName}
            aria-orientation="vertical"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow=${position}
            @pointerdown=${(e) => this._onSliderDown(e, cover.entity)}
            @pointermove=${(e) => this._onSliderMove(e)}
            @pointerup=${(e) => this._onSliderUp(e)}
            @pointercancel=${(e) => this._onSliderCancel(e)}
            @keydown=${(e) => this._onSliderKey(e, cover.entity, position)}
          >
            <div class="slider-fill" style="height: calc((100% - ${THUMB_SIZE}px) * ${position} / 100 + ${THUMB_SIZE / 2}px);"></div>
            <div class="slider-thumb" style="bottom: calc((100% - ${THUMB_SIZE}px) * ${position} / 100);"></div>
          </div>
        </div>

        <!-- Down button -->
        <ha-icon
          class="control-icon"
          .icon=${iconDown}
          @click=${() => this._callService('cover', 'close_cover', cover.entity)}>
        </ha-icon>

        <!-- Stop button -->
        <ha-icon
          class="control-icon stop-icon"
          .icon=${iconStop}
          @click=${() => this._callService('cover', 'stop_cover', cover.entity)}>
        </ha-icon>

        <!-- Cover name -->
        ${showName ? html`
          <div class="cover-name" style="color: ${textColor}; font-size:${nameFontSize}px;">
            ${displayName}
          </div>
        ` : ""}
      </div>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        padding: 20px 10px;
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: 16px;
      }
      .covers-container {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        width: 100%;
      }
      .cover-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--card-spacing);
      }
      .percentage {
        color: #4fc3f7;
        font-weight: bold;
      }
      .control-icon {
        color: var(--primary-text-color, white);
        cursor: pointer;
        --mdc-icon-size: 28px;
      }
      .stop-icon {
        --mdc-icon-size: 16px;
      }

      .slider-wrapper {
        position: relative;
        width: var(--slider-width, 54px);
        height: ${SLIDER_LENGTH}px;
        touch-action: none;
      }

      .slider {
        position: relative;
        width: 100%;
        height: 100%;
        background: var(--slider-bg, #222222);
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        outline: none;
        /* Prevent any scroll / zoom / selection during the gesture */
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      .slider:focus-visible {
        box-shadow: 0 0 0 2px var(--primary-color, #03a9f4);
      }
      .slider.disabled {
        opacity: 0.4;
        pointer-events: none;
      }
      .slider-fill {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--slider-prog, #888888);
        pointer-events: none;
      }
      .slider-thumb {
        position: absolute;
        left: 0;
        right: 0;
        height: ${THUMB_SIZE}px;
        background: var(--slider-thumb, #ffffff);
        pointer-events: none;
      }

      .cover-name {
        font-weight: bold;
        text-align: center;
        max-width: 120px;
        word-wrap: break-word;
      }
    `;
  }
}

// ==========================================
// 4. SAFE REGISTRATION
// ==========================================
if (LitElement) {
  if (!customElements.get("ha-plooum-cover-card-editor")) {
    customElements.define("ha-plooum-cover-card-editor", PlooumCoverCardEditor);
  }
  if (!customElements.get("ha-plooum-cover-card")) {
    customElements.define("ha-plooum-cover-card", PlooumCoverCard);
  }
}

// Lovelace registration
if (!window.customCards) {
  window.customCards = [];
}
let cardExists = false;
for (let i = 0; i < window.customCards.length; i++) {
  if (window.customCards[i].type === "ha-plooum-cover-card") {
    cardExists = true;
    break;
  }
}

if (!cardExists) {
  window.customCards.push({
    type: "ha-plooum-cover-card",
    name: "Plooum Cover Card",
    preview: true,
    description: "Customizable card to control several roller shutters."
  });
}