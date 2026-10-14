import { LitElement, html, css, nothing } from "lit";

const CARD_VERSION = '1.0.0';

const COLOR_OPTIONS = [
  { value: 'classic', label: 'Classic (red / yellow)' },
  { value: 'theme', label: 'Theme colors' },
];
const TIME_ZONE_OPTIONS = [
  { value: 'local', label: 'Local (browser)' },
  { value: 'server', label: 'Server (Home Assistant)' },
];

/* ==========================================================================
   MAIN CARD : ha-plooum-berlin-clock-card
   ========================================================================== */
class HaPlooumBerlinClockCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _now: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-berlin-clock-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  // Lit lamps for a time: the seconds lamp (on even seconds) and the four rows
  // (5 hours, 1 hour, 5 minutes, 1 minute).
  static lamps(h, m, s) {
    const row = (n, count) => Array.from({ length: count }, (_, i) => i < n);
    return {
      seconds: s % 2 === 0,
      rows: [
        row(Math.floor(h / 5), 4),
        row(h % 5, 4),
        row(Math.floor(m / 5), 11),
        row(m % 5, 4),
      ],
    };
  }

  constructor() {
    super();
    this._now = new Date();
  }

  setConfig(config) {
    this.config = { colors: 'classic', show_time: false, time_zone: 'local', ...(config || {}) };
  }

  getCardSize() {
    return this.config?.show_time ? 4 : 3;
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-BERLIN-CLOCK-CARD %c ${CARD_VERSION} `,
      'color: white; background: #e53935; font-weight: 700;',
      'color: #e53935; background: white; font-weight: 700;'
    );
    this._now = new Date();
    clearInterval(this._timer);
    this._timer = setInterval(() => { this._now = new Date(); }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
    this._timer = null;
  }

  // Hours, minutes and seconds in the configured time zone.
  _time() {
    const local = { h: this._now.getHours(), m: this._now.getMinutes(), s: this._now.getSeconds() };
    const tz = this.config.time_zone === 'server' ? this.hass?.config?.time_zone : undefined;
    if (!tz) return local;
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz, hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric',
      }).formatToParts(this._now);
      const get = (type) => Number(parts.find((p) => p.type === type).value);
      return { h: get('hour') % 24, m: get('minute'), s: get('second') };
    } catch (e) {
      return local;
    }
  }

  _row(lit, kind, title) {
    return html`<div class="row" title=${title}>
      ${lit.map((on, i) => {
        // Hour lamps are red; in the 5-minute row the quarters (3rd, 6th, 9th) are red too.
        const cls = kind === 'hour' ? 'red' : kind === 'min5' && (i + 1) % 3 === 0 ? 'quarter' : 'yellow';
        return html`<div class="lamp ${cls} ${on ? 'on' : ''}"></div>`;
      })}
    </div>`;
  }

  render() {
    if (!this.config) return nothing;
    const { h, m, s } = this._time();
    const lamps = HaPlooumBerlinClockCard.lamps(h, m, s);
    const [h5, h1, m5, m1] = lamps.rows;
    const count = (r) => r.filter(Boolean).length;
    const pad = (n) => String(n).padStart(2, '0');
    return html`
      <ha-card class="${this.config.colors === 'theme' ? 'theme' : 'classic'}">
        ${this.config.title ? html`<div class="title">${this.config.title}</div>` : nothing}
        <div class="clock">
          <div class="seconds"><div class="lamp round yellow ${lamps.seconds ? 'on' : ''}" title="${s} s"></div></div>
          ${this._row(h5, 'hour', `${count(h5) * 5} h`)}
          ${this._row(h1, 'hour', `${count(h1)} h`)}
          ${this._row(m5, 'min5', `${count(m5) * 5} min`)}
          ${this._row(m1, 'min1', `${count(m1)} min`)}
        </div>
        ${this.config.show_time ? html`<div class="digits">${pad(h)}:${pad(m)}:${pad(s)}</div>` : nothing}
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        padding: 12px;
        --lamp-red: #e53935;
        --lamp-yellow: #fdd835;
        --lamp-quarter: #e53935;
        --lamp-off: rgba(127, 127, 127, 0.25);
        --lamp-off-opacity: 1;
      }
      ha-card.theme {
        --lamp-red: var(--state-active-color, var(--primary-color));
        --lamp-yellow: var(--state-active-color, var(--primary-color));
        --lamp-quarter: var(--error-color);
        --lamp-off: var(--disabled-color);
        --lamp-off-opacity: 0.3;
      }
      .title {
        text-align: center;
        font-size: 1.1em;
        font-weight: 500;
        padding-bottom: 8px;
      }
      .clock {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 420px;
        margin: 0 auto;
      }
      .seconds {
        display: flex;
        justify-content: center;
      }
      .row {
        display: flex;
        gap: 4px;
      }
      .lamp {
        flex: 1;
        min-width: 0;
        height: 28px;
        border-radius: 8px;
        background: var(--lamp-off);
        opacity: var(--lamp-off-opacity);
        transition: background 0.2s, opacity 0.2s;
      }
      .lamp.round {
        flex: none;
        width: 28px;
        border-radius: 50%;
      }
      .lamp.on { opacity: 1; }
      .lamp.red.on { background: var(--lamp-red); }
      .lamp.yellow.on { background: var(--lamp-yellow); }
      .lamp.quarter.on { background: var(--lamp-quarter); }
      .digits {
        text-align: center;
        font-variant-numeric: tabular-nums;
        font-size: 1.3em;
        padding-top: 8px;
        color: var(--secondary-text-color);
      }
    `;
  }
}

/* ==========================================================================
   EDITOR : ha-plooum-berlin-clock-card-editor
   ========================================================================== */
const SCHEMA = [
  { name: 'title', selector: { text: {} } },
  { name: 'colors', selector: { select: { mode: 'dropdown', options: COLOR_OPTIONS } } },
  { name: 'show_time', selector: { boolean: {} } },
  { name: 'time_zone', selector: { select: { mode: 'dropdown', options: TIME_ZONE_OPTIONS } } },
];
const LABELS = {
  title: 'Title',
  colors: 'Colors',
  show_time: 'Show the time in digits',
  time_zone: 'Time zone',
};

class HaPlooumBerlinClockCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { state: true },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _valueChanged(ev) {
    const config = { ...ev.detail.value };
    for (const key of Object.keys(config)) {
      if (config[key] === '' || config[key] === undefined) delete config[key];
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
    const data = { colors: 'classic', show_time: false, time_zone: 'local', ...this._config };
    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${SCHEMA}
          .computeLabel=${(s) => LABELS[s.name] || s.name}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="hint">Hours on the two top rows (5 h and 1 h), minutes on the two bottom rows (5 min and 1 min).</div>
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
if (!customElements.get("ha-plooum-berlin-clock-card")) {
  customElements.define("ha-plooum-berlin-clock-card", HaPlooumBerlinClockCard);
}
if (!customElements.get("ha-plooum-berlin-clock-card-editor")) {
  customElements.define("ha-plooum-berlin-clock-card-editor", HaPlooumBerlinClockCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === "ha-plooum-berlin-clock-card")) {
  window.customCards.push({
    type: "ha-plooum-berlin-clock-card",
    name: "Ha Plooum Berlin Clock Card",
    description: "The time as a Berlin clock (Mengenlehreuhr): 24 lamps read from top to bottom.",
    preview: true,
  });
}
