import { LitElement, html, css, nothing, render as litRender } from "lit";

const CARD_VERSION = '1.0.1';

/*
 * A single button for a computer run by the Plooum PC agent (SiteWeb, pcagent): a tap opens a dialog
 * with the actions the computer's state allows, "Turn on" (Wake on LAN) when it is off, "Restart" and
 * "Shut down" (the agent's buttons) when it is on.
 *
 * The agent announces, through MQTT discovery, a device with a connectivity binary sensor ("online",
 * attributes = its JSON state, `pending` = "shutdown" / "reboot" while an order runs) and two buttons whose
 * unique ids end with `_shutdown` and `_reboot`. The card only needs the sensor: it finds both buttons on
 * the sensor's device (shutdown_entity / reboot_entity override them).
 *
 * On Linux the agent also announces one temperature sensor per chip on the same device ("Température CPU",
 * "Température GPU", "Température disque nvme0"…, unique ids ending with `_temp_<key>`). The card finds
 * them too (`temps` overrides them), shows up to `max_temps` of them as badges straddling the tile's edges
 * (the CPU at the top left, the GPU and the hottest disk at the bottom right) and all of them in the dialog.
 */

const DEFAULTS = {
  icon: 'mdi:desktop-tower-monitor',
  on_color: '#FFC107',
  off_color: '#9E9E9E',
  pending_color: '#03A9F4',
  timeout: 120,
  max_temps: 3,
  hot_temp: 80,
  hot_disk_temp: 55,
};

const TEMP_ICONS = {
  cpu: 'mdi:cpu-64-bit',
  gpu: 'mdi:expansion-card',
  disk: 'mdi:harddisk',
  other: 'mdi:thermometer',
};

// Badge order: CPU, GPU, disks, then anything else.
const TEMP_RANK = { cpu: 0, gpu: 1, disk: 2, other: 3 };

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
      _found: { state: true },
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
    this._found = { temps: [], uniques: {} };
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

  // Finds the agent's entities on the sensor's device: the shutdown / reboot buttons by unique id
  // (`_shutdown`, `_reboot`, as the agent announces them), else by entity id, and the temperature sensors
  // (device class `temperature`).
  async _discover() {
    const entity = this.config.entity;
    this._discoveredFor = entity;
    const found = { shutdown: null, reboot: null };
    const temps = [];
    let uniques = {};
    const entry = this.hass.entities && this.hass.entities[entity];
    if (entry && entry.device_id) {
      const onDevice = Object.values(this.hass.entities)
        .filter((e) => e.device_id === entry.device_id).map((e) => e.entity_id);
      const ids = onDevice.filter((id) => id.startsWith('button.'));
      const sensors = onDevice.filter((id) => id.startsWith('sensor.'));
      const entries = {};
      if (ids.length || sensors.length) {
        try {
          const res = await this.hass.callWS({
            type: 'config/entity_registry/get_entries', entity_ids: [...ids, ...sensors],
          });
          for (const id of [...ids, ...sensors]) {
            entries[id] = (res && res[id]) || {};
            uniques[id] = entries[id].unique_id || '';
          }
        } catch (_e) {
          uniques = {};
        }
      }
      for (const id of sensors) {
        const stateObj = this.hass.states[id];
        const deviceClass = (entries[id] && (entries[id].device_class || entries[id].original_device_class))
          || (stateObj && stateObj.attributes.device_class);
        if (deviceClass === 'temperature') temps.push(id);
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
    if (this._discoveredFor === entity) {
      this._buttons = found;
      this._found = { temps, uniques };
    }
  }

  // --- Temperatures ---

  /** Kind (cpu, gpu, disk or other) and short label of a temperature sensor. */
  _tempInfo(id) {
    const unique = String(this._found.uniques[id] || '');
    let key = (unique.match(/_temp_(.+)$/) || [])[1];
    let disk = !!key;
    if (!key) {
      const m = id.split('.')[1].match(/_temperature_(?:(disque|disk)_)?(.+)$/);
      if (m) {
        key = m[2];
        disk = !!m[1];
      }
    }
    if (key === 'cpu') return { kind: 'cpu', label: 'CPU' };
    if (key && /^gpu\d*$/.test(key)) return { kind: 'gpu', label: key.toUpperCase() };
    if (key && disk) return { kind: 'disk', label: key };
    const stateObj = this.hass.states[id];
    return { kind: 'other', label: (stateObj && stateObj.attributes.friendly_name) || id };
  }

  /** Every temperature sensor of the computer, with its value (null when unavailable) and whether it's hot. */
  get _temps() {
    const ids = Array.isArray(this.config.temps) && this.config.temps.length ? this.config.temps : this._found.temps;
    const hot = Number.isFinite(Number(this.config.hot_temp)) && this.config.hot_temp !== undefined
      ? Number(this.config.hot_temp) : DEFAULTS.hot_temp;
    const hotDisk = Number.isFinite(Number(this.config.hot_disk_temp)) && this.config.hot_disk_temp !== undefined
      ? Number(this.config.hot_disk_temp) : DEFAULTS.hot_disk_temp;
    return ids.map((id) => {
      const stateObj = this.hass.states[id];
      const num = stateObj ? Number.parseFloat(stateObj.state) : NaN;
      const value = Number.isFinite(num) ? num : null;
      const info = this._tempInfo(id);
      const limit = info.kind === 'disk' ? hotDisk : hot;
      return { id, ...info, value, hot: value !== null && value >= limit };
    });
  }

  /**
   * The badges of the tile: up to max_temps available sensors, the CPU, the hottest GPU and the hottest disk
   * first, shown in the order CPU, GPUs, disks. None while the computer is off.
   */
  _badgeTemps(temps) {
    const stateObj = this.hass.states[this.config.entity];
    if (!stateObj || stateObj.state !== 'on') return [];
    const max = this.config.max_temps === undefined || this.config.max_temps === null
      || !Number.isFinite(Number(this.config.max_temps))
      ? DEFAULTS.max_temps : Math.max(0, Math.floor(Number(this.config.max_temps)));
    const ok = temps.filter((t) => t.value !== null);
    const of = (kind) => ok.filter((t) => t.kind === kind).sort((a, b) => b.value - a.value);
    const cpus = ok.filter((t) => t.kind === 'cpu');
    const gpus = of('gpu');
    const disks = of('disk');
    const priority = [cpus[0], gpus[0], disks[0], ...cpus.slice(1), ...gpus.slice(1), ...disks.slice(1),
      ...ok.filter((t) => t.kind === 'other')].filter(Boolean);
    const chosen = priority.slice(0, max);
    return chosen.sort((a, b) => TEMP_RANK[a.kind] - TEMP_RANK[b.kind] || priority.indexOf(a) - priority.indexOf(b));
  }

  _badge(t) {
    return html`
      <span class="temp ${t.kind} ${t.hot ? 'hot' : ''}" data-entity=${t.id} title=${`${t.label}: ${t.value} °C`}>
        <ha-icon icon=${TEMP_ICONS[t.kind]}></ha-icon>${Math.round(t.value)}°
      </span>
    `;
  }

  _moreInfo(entityId) {
    this._close();
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }));
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

  // One cell per available temperature sensor; a tap opens its more-info dialog (history).
  _tempsTemplate() {
    const temps = this._temps.filter((t) => t.value !== null)
      .sort((a, b) => TEMP_RANK[a.kind] - TEMP_RANK[b.kind]);
    if (!temps.length) return nothing;
    return html`
      <div class="temps">
        ${temps.map((t) => html`
          <button class="temp ${t.kind} ${t.hot ? 'hot' : ''}" data-entity=${t.id}
            aria-label=${`${t.label}: ${t.value} °C`} @click=${() => this._moreInfo(t.id)}>
            <ha-icon icon=${TEMP_ICONS[t.kind]}></ha-icon>
            <span class="label">${t.label}</span>
            <span class="value">${Math.round(t.value * 10) / 10} °C</span>
          </button>
        `)}
      </div>
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
        ${this._tempsTemplate()}
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
    const [top, ...bottom] = this._badgeTemps(this._temps);
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
        ${top ? html`<div class="temps top">${this._badge(top)}</div>` : nothing}
        ${bottom.length ? html`<div class="temps bottom">${bottom.map((t) => this._badge(t))}</div>` : nothing}
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
        background: var(--plooum-tile-background, rgba(0, 0, 0, 0.35));
        border: none;
        border-radius: 20px;
        box-shadow: none;
        overflow: visible;
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
      /* Temperature badges, straddling the tile's top and bottom edges. */
      .temps {
        position: absolute;
        display: flex;
        gap: 3px;
        z-index: 1;
        pointer-events: none;
      }
      .temps.top {
        top: 0;
        left: 10px;
        transform: translateY(-50%);
      }
      .temps.bottom {
        bottom: 0;
        right: 8px;
        transform: translateY(50%);
      }
      .temp {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        height: 18px;
        padding: 0 5px 0 4px;
        box-sizing: border-box;
        border-radius: 9px;
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        color: var(--plooum-pc-temp-color, var(--primary-text-color, #e1e1e1));
        background: var(--plooum-pc-temp-background, var(--card-background-color, #1c1c1c));
        border: 1px solid var(--plooum-pc-temp-border, rgba(255, 255, 255, 0.14));
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
      }
      .temp ha-icon {
        --mdc-icon-size: 12px;
        width: 12px;
        height: 12px;
        display: flex;
        opacity: 0.75;
      }
      .temp.hot {
        color: #1b1b1b;
        background: var(--plooum-pc-temp-hot-color, #ff9800);
        border-color: var(--plooum-pc-temp-hot-color, #ff9800);
      }
      .temp.hot ha-icon {
        opacity: 1;
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
  .temps {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 8px;
    margin-top: 16px;
  }
  .temp {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas: "icon label" "value value";
    align-items: center;
    column-gap: 6px;
    row-gap: 2px;
    padding: 8px 10px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-radius: 14px;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .temp:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
  }
  .temp ha-icon {
    grid-area: icon;
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color, #727272);
  }
  .temp .label {
    grid-area: label;
    font-size: 12px;
    color: var(--secondary-text-color, #727272);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .temp .value {
    grid-area: value;
    font-size: 17px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .temp.hot {
    border-color: #ff9800;
    background: rgba(255, 152, 0, 0.12);
  }
  .temp.hot ha-icon,
  .temp.hot .value {
    color: #ff9800;
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
    type: 'expandable', name: '', title: 'Temperatures', icon: 'mdi:thermometer', schema: [
      { name: 'temps', selector: { entity: { domain: 'sensor', device_class: 'temperature', multiple: true } } },
      { name: 'max_temps', selector: { number: { min: 0, max: 6, step: 1, mode: 'box' } } },
      {
        type: 'grid', name: '', schema: [
          { name: 'hot_temp', selector: { number: { min: 0, max: 150, step: 1, unit_of_measurement: '°C', mode: 'box' } } },
          { name: 'hot_disk_temp', selector: { number: { min: 0, max: 150, step: 1, unit_of_measurement: '°C', mode: 'box' } } },
        ],
      },
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
  temps: 'Temperature sensors (default: found on the device)',
  max_temps: `Badges on the button (${DEFAULTS.max_temps}, 0 = none)`,
  hot_temp: `CPU / GPU hot from (${DEFAULTS.hot_temp} °C)`,
  hot_disk_temp: `Disk hot from (${DEFAULTS.hot_disk_temp} °C)`,
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
      const empty = config[key] === '' || config[key] === undefined || config[key] === null
        || (Array.isArray(config[key]) && !config[key].length);
      if (empty) delete config[key];
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
        The MAC address needs <code>wake_on_lan:</code> in configuration.yaml. The restart and shut down buttons and
        the temperature sensors are the PC agent's, found on the sensor's device.
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
    description: 'A button for a computer run by the Plooum PC agent: turn it on (Wake on LAN), restart it or shut it down, and see its temperatures.',
    preview: true,
  });
}
