import { LitElement, html, css, nothing, render as litRender } from "lit";

const CARD_VERSION = '1.0.0';

/*
 * A single button for a computer run by the Plooum PC agent (SiteWeb, pcagent): a tap opens a dialog
 * with the actions the computer's state allows, "Turn on" (Wake on LAN) when it is off, "Restart" and
 * "Shut down" (the agent's buttons) when it is on.
 *
 * The agent announces, through MQTT discovery, a device with a connectivity binary sensor ("online",
 * attributes = its JSON state, `pending` = "shutdown" / "reboot" while an order runs) and two buttons whose
 * unique ids end with `_shutdown` and `_reboot`. The card only needs the sensor: it finds both buttons on
 * the sensor's device (shutdown_entity / reboot_entity override them).
 */

const DEFAULTS = {
  icon: 'mdi:desktop-tower-monitor',
  on_color: '#FFC107',
  off_color: '#9E9E9E',
  pending_color: '#03A9F4',
  timeout: 120,
};

// Status -> label shown under the name in the dialog.
const STATUS_LABELS = {
  on: 'On',
  off: 'Off',
  starting: 'Starting…',
  stopping: 'Shutting down…',
  restarting: 'Restarting…',
  unavailable: 'Unavailable',
  missing: 'Entity not found',
};

const SHUTDOWN_RE = /(^|_)(shutdown|shut_down|power_off|turn_off|eteindre|arreter)($|_)/;
const REBOOT_RE = /(^|_)(reboot|restart|redemarrer)($|_)/;

/* ==========================================================================
   MAIN CARD : ha-plooum-pc-card
   ========================================================================== */
class HaPlooumPcCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _open: { state: true },
      _buttons: { state: true },
      _local: { state: true },
      _error: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-pc-card-editor");
  }

  static getStubConfig(hass) {
    const sensor = hass && Object.values(hass.states).find(
      (s) => s.entity_id.startsWith('binary_sensor.') && s.attributes.device_class === 'connectivity'
        && 'online' in s.attributes,
    );
    return { entity: sensor ? sensor.entity_id : '' };
  }

  constructor() {
    super();
    this._open = false;
    this._buttons = { shutdown: null, reboot: null };
    this._local = null;
    this._error = '';
    this._discoveredFor = undefined;
    this._onKey = (e) => { if (e.key === 'Escape') this._close(); };
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-PC-CARD %c ${CARD_VERSION} `,
      'color: white; background: #03a9f4; font-weight: 700;',
      'color: #03a9f4; background: white; font-weight: 700;'
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._close();
    clearTimeout(this._timer);
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this.config = { ...config };
    this._discoveredFor = undefined;
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 3, rows: 1, min_columns: 2, min_rows: 1 };
  }

  // --- State ---

  /** The computer's status: on, off, starting, stopping, restarting, unavailable or missing. */
  get _status() {
    const stateObj = this.hass && this.config.entity ? this.hass.states[this.config.entity] : undefined;
    if (!stateObj) return 'missing';
    if (stateObj.state === 'unavailable' || stateObj.state === 'unknown') return 'unavailable';
    const pending = stateObj.attributes.pending;
    if (pending === 'shutdown') return 'stopping';
    if (pending === 'reboot') return 'restarting';
    if (this._local) {
      return { wake: 'starting', shutdown: 'stopping', reboot: 'restarting' }[this._local.action];
    }
    return stateObj.state === 'on' ? 'on' : 'off';
  }

  // Ends the transient state the card shows after an order once the sensor confirms it, or after timeout.
  _checkLocal() {
    const local = this._local;
    if (!local) return;
    const stateObj = this.hass && this.hass.states[this.config.entity];
    const online = stateObj && stateObj.state === 'on';
    const timeout = Number(this.config.timeout) > 0 ? Number(this.config.timeout) : DEFAULTS.timeout;
    let done = Date.now() - local.t > timeout * 1000;
    if (local.action === 'wake' && online) done = true;
    if (local.action === 'shutdown' && stateObj && !online) done = true;
    if (local.action === 'reboot') {
      if (stateObj && !online && !local.sawOff) this._local = { ...local, sawOff: true };
      if (local.sawOff && online) done = true;
    }
    if (done) {
      this._local = null;
      clearTimeout(this._timer);
    }
  }

  _startLocal(action) {
    this._local = { action, t: Date.now(), sawOff: false };
    const timeout = Number(this.config.timeout) > 0 ? Number(this.config.timeout) : DEFAULTS.timeout;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => { this._checkLocal(); this.requestUpdate(); }, timeout * 1000 + 50);
  }

  // Finds the agent's shutdown / reboot buttons on the sensor's device: by unique id (`_shutdown`,
  // `_reboot`, as the agent announces them), else by entity id.
  async _discover() {
    const entity = this.config.entity;
    this._discoveredFor = entity;
    const found = { shutdown: null, reboot: null };
    const entry = this.hass.entities && this.hass.entities[entity];
    if (entry && entry.device_id) {
      const ids = Object.values(this.hass.entities)
        .filter((e) => e.device_id === entry.device_id && e.entity_id.startsWith('button.'))
        .map((e) => e.entity_id);
      let uniques = {};
      if (ids.length) {
        try {
          const res = await this.hass.callWS({ type: 'config/entity_registry/get_entries', entity_ids: ids });
          for (const id of ids) uniques[id] = res && res[id] ? res[id].unique_id || '' : '';
        } catch (_e) {
          uniques = {};
        }
      }
      for (const id of ids) {
        const unique = String(uniques[id] || '');
        if (!found.shutdown && unique.endsWith('_shutdown')) found.shutdown = id;
        if (!found.reboot && unique.endsWith('_reboot')) found.reboot = id;
      }
      for (const id of ids) {
        const object = id.split('.')[1];
        if (!found.shutdown && SHUTDOWN_RE.test(object)) found.shutdown = id;
        if (!found.reboot && REBOOT_RE.test(object)) found.reboot = id;
      }
    }
    if (this._discoveredFor === entity) this._buttons = found;
  }

  get _shutdownEntity() {
    return this.config.shutdown_entity || this._buttons.shutdown;
  }

  get _rebootEntity() {
    return this.config.reboot_entity || this._buttons.reboot;
  }

  get _canWake() {
    return !!(this.config.wol_entity || this.config.mac);
  }

  willUpdate(changed) {
    if (changed.has('hass') && this.hass && this.config) this._checkLocal();
  }

  updated(changed) {
    super.updated(changed);
    if (!this.hass || !this.config) return;
    if (this._discoveredFor !== this.config.entity && this.config.entity) this._discover();
    if (this._open) this._renderDialog();
  }

  // --- Actions ---

  async _run(action) {
    this._error = '';
    try {
      if (action === 'wake') {
        const wol = this.config.wol_entity;
        if (wol) {
          const domain = wol.split('.')[0];
          const service = { button: 'press', input_button: 'press', script: 'turn_on' }[domain] || 'turn_on';
          await this.hass.callService(domain, service, { entity_id: wol });
        } else {
          const data = { mac: this.config.mac };
          if (this.config.broadcast_address) data.broadcast_address = this.config.broadcast_address;
          if (this.config.broadcast_port) data.broadcast_port = Number(this.config.broadcast_port);
          await this.hass.callService('wake_on_lan', 'send_magic_packet', data);
        }
      } else {
        const target = action === 'shutdown' ? this._shutdownEntity : this._rebootEntity;
        await this.hass.callService('button', 'press', { entity_id: target });
      }
      this._startLocal(action);
    } catch (e) {
      this._error = (e && e.message) || String(e);
    }
    if (this._open) this._renderDialog();
  }

  // --- Dialog (rendered in a container on document.body, so no card ancestor can clip or trap it) ---

  _openDialog() {
    if (this._open) return;
    this._error = '';
    this._open = true;
    const host = document.createElement('div');
    host.setAttribute('data-plooum-pc-dialog', '');
    const root = host.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [DIALOG_STYLES.styleSheet];
    document.body.appendChild(host);
    this._dialogHost = host;
    window.addEventListener('keydown', this._onKey);
    this._renderDialog();
    const first = root.querySelector('.action') || root.querySelector('.close');
    if (first) first.focus();
  }

  _close() {
    if (!this._dialogHost) return;
    window.removeEventListener('keydown', this._onKey);
    this._dialogHost.remove();
    this._dialogHost = null;
    this._open = false;
  }

  /** The dialog's shadow root while it is open (for tests). */
  get dialogRoot() {
    return this._dialogHost ? this._dialogHost.shadowRoot : null;
  }

  _renderDialog() {
    if (this._dialogHost) litRender(this._dialogTemplate(), this._dialogHost.shadowRoot, { host: this });
  }

  _subtitle(status) {
    const stateObj = this.hass.states[this.config.entity];
    const label = STATUS_LABELS[status];
    if (status !== 'on' || !stateObj) return label;
    const parts = [label];
    const since = Date.parse(stateObj.attributes.since);
    if (!Number.isNaN(since)) {
      const min = Math.max(0, Math.floor((Date.now() - since) / 60000));
      parts.push(min < 60 ? `up ${min} min` : `up ${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`);
    }
    if (stateObj.attributes.hostname) parts.push(stateObj.attributes.hostname);
    return parts.join(' · ');
  }

  _action(action, icon, label, detail, cls = '') {
    return html`
      <button class="action ${cls}" data-action=${action} @click=${() => this._run(action)}>
        <ha-icon icon=${icon}></ha-icon>
        <span class="text"><span>${label}</span><span class="detail">${detail}</span></span>
      </button>
    `;
  }

  _dialogTemplate() {
    const status = this._status;
    const name = this._name;
    let body;
    if (status === 'on') {
      const reboot = this._rebootEntity;
      const shutdown = this._shutdownEntity;
      body = reboot || shutdown
        ? html`
            ${reboot ? this._action('reboot', 'mdi:restart', 'Restart', 'Through the PC agent') : nothing}
            ${shutdown ? this._action('shutdown', 'mdi:power', 'Shut down', 'Through the PC agent', 'danger') : nothing}
          `
        : html`<div class="info">No restart or shutdown button found on this device: set them in the card's options.</div>`;
    } else if (status === 'off') {
      body = this._canWake
        ? this._action('wake', 'mdi:power', 'Turn on', this.config.wol_entity ? 'Wake on LAN' : `Wake on LAN · ${this.config.mac}`, 'success')
        : html`<div class="info">No Wake on LAN set: add a MAC address or a Wake on LAN entity in the card's options.</div>`;
    } else if (status === 'unavailable' || status === 'missing') {
      body = html`<div class="info">${status === 'missing' ? `${this.config.entity || 'No entity'} doesn't exist.` : 'The PC agent state is unavailable.'}</div>`;
    } else {
      body = html`<div class="info">Waiting for the computer. No action until it answers.</div>`;
    }
    return html`
      <div class="backdrop" @click=${() => this._close()}></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-label=${name}>
        <div class="header">
          <ha-icon class="state-icon ${status}" icon=${this._icon} style="color: ${this._color(status)}"></ha-icon>
          <div class="title">
            <div class="name">${name}</div>
            <div class="status ${status}">${this._subtitle(status)}</div>
          </div>
          <button class="close" aria-label="Close" @click=${() => this._close()}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        <div class="body">${body}</div>
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      </div>
    `;
  }

  // --- Card ---

  get _name() {
    const stateObj = this.hass && this.hass.states[this.config.entity];
    if (this.config.name) return this.config.name;
    const device = this.hass && this.hass.entities && this.hass.entities[this.config.entity]
      && this.hass.devices && this.hass.devices[this.hass.entities[this.config.entity].device_id];
    if (device) return device.name_by_user || device.name;
    return stateObj ? stateObj.attributes.friendly_name || this.config.entity : (this.config.entity || 'PC');
  }

  get _icon() {
    return this.config.icon || DEFAULTS.icon;
  }

  _color(status) {
    if (status === 'on') return this.config.on_color || DEFAULTS.on_color;
    if (status === 'starting' || status === 'stopping' || status === 'restarting') {
      return this.config.pending_color || DEFAULTS.pending_color;
    }
    return this.config.off_color || DEFAULTS.off_color;
  }

  render() {
    if (!this.config || !this.hass) return nothing;
    const status = this._status;
    const color = this._color(status);
    const busy = status === 'starting' || status === 'stopping' || status === 'restarting';
    return html`
      <ha-card
        class="pc ${status} ${this.config.show_name ? 'has-name' : ''}"
        tabindex="0"
        role="button"
        aria-label=${`${this._name}: ${STATUS_LABELS[status]}`}
        @click=${() => this._openDialog()}
        @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._openDialog(); } }}
      >
        <ha-icon class="icon ${busy ? 'busy' : ''}" icon=${this._icon} style="color: ${color}"></ha-icon>
        ${status === 'unavailable' || status === 'missing'
          ? html`<ha-icon class="alert" icon="mdi:alert-circle"></ha-icon>`
          : nothing}
        ${this.config.show_name ? html`<div class="name" style="color: ${color}">${this._name}</div>` : nothing}
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .pc {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        min-height: 56px;
        height: 100%;
        box-sizing: border-box;
        padding: 6px 8px;
        background: rgba(0, 0, 0, 0.35);
        border: none;
        border-radius: 20px;
        box-shadow: none;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .pc:focus-visible {
        outline: 2px solid var(--primary-color);
      }
      .icon {
        --mdc-icon-size: 40px;
        width: 40px;
        height: 40px;
        display: flex;
      }
      .pc.has-name .icon {
        --mdc-icon-size: 26px;
        width: 26px;
        height: 26px;
      }
      .pc.unavailable .icon,
      .pc.missing .icon {
        opacity: 0.45;
      }
      .icon.busy {
        animation: pulse 1.2s ease-in-out infinite;
      }
      .alert {
        position: absolute;
        top: 8px;
        right: 12px;
        --mdc-icon-size: 18px;
        color: var(--error-color, #db4437);
      }
      .name {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        text-align: center;
      }
      @keyframes pulse {
        50% { opacity: 0.35; }
      }
    `;
  }
}

const DIALOG_STYLES = css`
  :host {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--ha-font-family-body, Roboto, sans-serif);
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  .dialog {
    position: relative;
    width: min(360px, calc(100vw - 32px));
    box-sizing: border-box;
    padding: 16px;
    border-radius: 24px;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    color: var(--primary-text-color, #212121);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .state-icon {
    --mdc-icon-size: 32px;
    flex: none;
  }
  .title {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 18px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status {
    font-size: 13px;
    color: var(--secondary-text-color, #727272);
  }
  .close {
    flex: none;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--secondary-text-color, #727272);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }
  .action {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-radius: 16px;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 15px;
    text-align: left;
    cursor: pointer;
  }
  .action:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
  }
  .action ha-icon {
    --mdc-icon-size: 24px;
    flex: none;
  }
  .action.danger {
    color: var(--error-color, #db4437);
    border-color: var(--error-color, #db4437);
  }
  .action.success {
    color: var(--success-color, #43a047);
    border-color: var(--success-color, #43a047);
  }
  .text {
    display: flex;
    flex-direction: column;
  }
  .detail {
    font-size: 12px;
    color: var(--secondary-text-color, #727272);
  }
  .info {
    font-size: 14px;
    color: var(--secondary-text-color, #727272);
    padding: 4px 2px;
  }
  .error {
    margin-top: 12px;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 13px;
    color: var(--error-color, #db4437);
    background: rgba(219, 68, 55, 0.12);
  }
`;

/* ==========================================================================
   CARD EDITOR
   ========================================================================== */
const SCHEMA = [
  { name: 'entity', required: true, selector: { entity: { domain: 'binary_sensor' } } },
  {
    type: 'grid', name: '', schema: [
      { name: 'name', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
    ],
  },
  { name: 'show_name', selector: { boolean: {} } },
  {
    type: 'expandable', name: '', title: 'Turn on (Wake on LAN)', icon: 'mdi:power', expanded: true, schema: [
      { name: 'mac', selector: { text: {} } },
      {
        type: 'grid', name: '', schema: [
          { name: 'broadcast_address', selector: { text: {} } },
          { name: 'broadcast_port', selector: { number: { min: 1, max: 65535, mode: 'box' } } },
        ],
      },
      { name: 'wol_entity', selector: { entity: { domain: ['button', 'input_button', 'switch', 'script'] } } },
    ],
  },
  {
    type: 'expandable', name: '', title: 'Restart and shut down', icon: 'mdi:restart', schema: [
      { name: 'reboot_entity', selector: { entity: { domain: 'button' } } },
      { name: 'shutdown_entity', selector: { entity: { domain: 'button' } } },
      { name: 'timeout', selector: { number: { min: 10, max: 900, step: 5, unit_of_measurement: 's', mode: 'box' } } },
    ],
  },
  {
    type: 'expandable', name: '', title: 'Colors', icon: 'mdi:palette', schema: [
      {
        type: 'grid', name: '', schema: [
          { name: 'on_color', selector: { text: {} } },
          { name: 'off_color', selector: { text: {} } },
          { name: 'pending_color', selector: { text: {} } },
        ],
      },
    ],
  },
];

const LABELS = {
  entity: 'PC agent "online" sensor',
  name: 'Name (default: the device name)',
  icon: 'Icon',
  show_name: 'Show the name on the button',
  mac: 'MAC address (wake_on_lan.send_magic_packet)',
  broadcast_address: 'Broadcast address (optional)',
  broadcast_port: 'Broadcast port (optional)',
  wol_entity: 'Or a Wake on LAN entity (button, switch, script)',
  reboot_entity: 'Restart button (default: found on the device)',
  shutdown_entity: 'Shut down button (default: found on the device)',
  timeout: 'Give up waiting after',
  on_color: `Color when on (${DEFAULTS.on_color})`,
  off_color: `Color when off (${DEFAULTS.off_color})`,
  pending_color: `Color while waiting (${DEFAULTS.pending_color})`,
};

class HaPlooumPcCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _valueChanged(ev) {
    const config = { ...ev.detail.value };
    for (const key of Object.keys(config)) {
      if (config[key] === '' || config[key] === undefined || config[key] === null) delete config[key];
    }
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${(s) => LABELS[s.name] || s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="hint">
        The MAC address needs <code>wake_on_lan:</code> in configuration.yaml. The restart and shut down buttons are
        the PC agent's, found on the sensor's device.
      </div>
    `;
  }

  static get styles() {
    return css`
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
if (!customElements.get('ha-plooum-pc-card')) {
  customElements.define('ha-plooum-pc-card', HaPlooumPcCard);
}
if (!customElements.get('ha-plooum-pc-card-editor')) {
  customElements.define('ha-plooum-pc-card-editor', HaPlooumPcCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-pc-card')) {
  window.customCards.push({
    type: 'ha-plooum-pc-card',
    name: 'Ha Plooum PC Card',
    description: 'A button for a computer run by the Plooum PC agent: turn it on (Wake on LAN), restart it or shut it down.',
    preview: true,
  });
}
