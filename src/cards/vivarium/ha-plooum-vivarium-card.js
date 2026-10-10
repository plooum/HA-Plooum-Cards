import { LitElement, html, css, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';

const CARD_VERSION = '1.0.0';

const UNAVAILABLE_STATES = ['unavailable', 'unknown'];
const OFF_STATES = ['off', 'closed', 'idle'];
const HOLD_DELAY = 500; // ms before a press on a chip or a measure runs its hold action
const DEFAULT_FOLD_WIDTH = 240; // px: in `fold: auto`, the card folds below this width
const FOLD_KEY_PREFIX = 'ha-plooum-vivarium-fold:'; // localStorage key prefix of a card's fold override
const RANGE_PAD = 0.6; // space shown on each side of a target range on its bar, as a ratio of the range width

// Severity levels, from the least to the most severe.
const LEVELS = ['ok', 'info', 'warn', 'alert'];
const LEVEL_ICONS = {
  info: 'mdi:information-outline',
  warn: 'mdi:alert-outline',
  alert: 'mdi:alert-octagon-outline',
};

const MEASURE_DOMAINS = ['sensor', 'input_number', 'number'];
const SWITCH_DOMAINS = ['switch', 'input_boolean', 'light', 'fan'];
// Domains toggled through homeassistant.toggle (light uses light.toggle).
const TOGGLE_DOMAINS = ['switch', 'input_boolean', 'fan', 'climate', 'humidifier', 'siren', 'valve', 'automation'];
// Domains a "trigger" role (feeder) runs instead of toggling: they are never "off".
const TRIGGER_SERVICES = {
  button: 'button.press',
  input_button: 'input_button.press',
  script: 'script.turn_on',
  scene: 'scene.turn_on',
};

/* ==========================================================================
   ROLE REGISTRY
   Adding a sensor or equipment type = one entry here. Rendering, severity,
   editor choices, default icons and ranges all read from this table.
   ========================================================================== */
const ROLES = {
  temperature: {
    kind: 'measure',
    label: 'Temperature',
    icon: 'mdi:thermometer',
    color: 'var(--orange-color, #ff9800)',
    domains: MEASURE_DOMAINS,
    device_class: 'temperature',
    match: /temp/,
    unit: '°C',
    decimals: 1,
    warn_margin: 0.5,
    words: { high: 'Too warm', low: 'Too cold' },
    ranges: { aquarium: [24, 26], pond: [12, 22], terrarium: [24, 30], paludarium: [24, 28] },
  },
  humidity: {
    kind: 'measure',
    label: 'Humidity',
    icon: 'mdi:water-percent',
    color: 'var(--blue-color, #2196f3)',
    domains: MEASURE_DOMAINS,
    device_class: 'humidity',
    match: /humid/,
    unit: '%',
    decimals: 0,
    warn_margin: 3,
    words: { high: 'Too humid', low: 'Too dry' },
    ranges: { terrarium: [60, 80], paludarium: [70, 90] },
  },
  ph: {
    kind: 'measure',
    label: 'pH',
    icon: 'mdi:ph',
    color: 'var(--purple-color, #9c27b0)',
    domains: MEASURE_DOMAINS,
    device_class: 'ph',
    match: /(^|[._ ])ph($|[._ ])/,
    unit: '',
    decimals: 1,
    warn_margin: 0.2,
    words: { high: 'pH too high', low: 'pH too low' },
    ranges: { aquarium: [6.5, 7.5], pond: [7, 8.5], paludarium: [6.5, 7.5] },
  },
  conductivity: {
    kind: 'measure',
    label: 'Conductivity',
    icon: 'mdi:flash-outline',
    color: 'var(--brown-color, #795548)',
    domains: MEASURE_DOMAINS,
    device_class: 'conductivity',
    match: /conduct|tds/,
    unit: 'µS/cm',
    decimals: 0,
    words: { high: 'Conductivity high', low: 'Conductivity low' },
  },
  water_level: {
    kind: 'measure',
    label: 'Water level',
    icon: 'mdi:waves-arrow-up',
    color: 'var(--light-blue-color, #03a9f4)',
    domains: MEASURE_DOMAINS,
    match: /level/,
    words: { high: 'Level high', low: 'Level low' },
  },
  light: {
    kind: 'actuator',
    label: 'Light',
    icon: 'mdi:lightbulb',
    color: 'var(--amber-color, #ffc107)',
    domains: ['light', 'switch', 'input_boolean', 'number', 'input_number', 'sensor'],
    match: /light|lamp/,
    dimmable: true, // shows its % when the entity provides one
    night: true, // off and nothing worse: info "Night"
  },
  co2: {
    kind: 'actuator',
    label: 'CO2',
    icon: 'mdi:molecule-co2',
    color: 'var(--teal-color, #009688)',
    domains: SWITCH_DOMAINS,
    match: /co2/,
  },
  air: {
    kind: 'actuator',
    label: 'Air',
    icon: 'mdi:chart-bubble',
    color: 'var(--blue-color, #2196f3)',
    domains: SWITCH_DOMAINS,
    match: /air|bubbl|oxygen/,
  },
  filter: {
    kind: 'actuator',
    label: 'Filter',
    icon: 'mdi:air-filter',
    color: 'var(--blue-grey-color, #607d8b)',
    domains: SWITCH_DOMAINS,
    match: /filter/,
  },
  uv: {
    kind: 'actuator',
    label: 'UV',
    icon: 'mdi:sun-wireless',
    color: 'var(--deep-purple-color, #7e57c2)',
    domains: SWITCH_DOMAINS,
    match: /uv/,
  },
  heater: {
    kind: 'actuator',
    label: 'Heater',
    icon: 'mdi:heating-coil',
    color: 'var(--deep-orange-color, #ff5722)',
    domains: [...SWITCH_DOMAINS, 'climate'],
    match: /heat|basking/,
  },
  cooling: {
    kind: 'actuator',
    label: 'Cooling',
    icon: 'mdi:snowflake',
    color: 'var(--light-blue-color, #03a9f4)',
    domains: [...SWITCH_DOMAINS, 'climate'],
    match: /fan|cool|chill/,
  },
  mister: {
    kind: 'actuator',
    label: 'Mister',
    icon: 'mdi:weather-fog',
    color: 'var(--cyan-color, #00bcd4)',
    domains: SWITCH_DOMAINS,
    match: /mist|fog/,
  },
  pump: {
    kind: 'actuator',
    label: 'Pump',
    icon: 'mdi:pump',
    color: 'var(--indigo-color, #3f51b5)',
    domains: SWITCH_DOMAINS,
    match: /pump/,
  },
  feeder: {
    kind: 'actuator',
    label: 'Feeder',
    icon: 'mdi:shaker-outline',
    color: 'var(--brown-color, #795548)',
    domains: ['button', 'input_button', 'script', ...SWITCH_DOMAINS],
    match: /feed/,
    trigger: true, // a button/script is "ready", never "off"; a tap runs it
  },
  custom: {
    kind: null, // from the item's `kind`
    label: 'Custom',
    icon: 'mdi:flask-outline',
    color: 'var(--primary-color, #03a9f4)',
    domains: null, // any entity
  },
};

// Vivarium types: default icon, and the roles the editor suggests first. They don't restrict anything.
const VIVARIUM_TYPES = {
  aquarium: {
    label: 'Aquarium',
    icon: 'mdi:fishbowl-outline',
    suggested: ['temperature', 'light', 'co2', 'air', 'filter', 'heater', 'ph', 'feeder'],
  },
  pond: {
    label: 'Pond',
    icon: 'mdi:waves',
    suggested: ['temperature', 'uv', 'pump', 'filter', 'air', 'water_level', 'feeder'],
  },
  terrarium: {
    label: 'Terrarium',
    icon: 'mdi:turtle',
    suggested: ['temperature', 'humidity', 'heater', 'uv', 'light', 'mister', 'cooling'],
  },
  paludarium: {
    label: 'Paludarium',
    icon: 'mdi:sprout',
    suggested: ['temperature', 'humidity', 'light', 'mister', 'pump', 'filter', 'heater'],
  },
};

const STRIP_STYLES = ['quiet', 'tinted', 'solid'];
const FOLD_MODES = ['auto', 'folded', 'unfolded'];
const ITEM_ACTIONS = ['toggle', 'more-info', 'none'];

function toNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function itemKind(item) {
  const role = ROLES[item.role];
  if (!role) return 'measure';
  return role.kind || (item.kind === 'actuator' ? 'actuator' : 'measure');
}

// Merges an item's config over its role defaults.
function resolveItem(item, index, vivariumType) {
  const role = ROLES[item.role];
  const range = (role.ranges && role.ranges[vivariumType]) || [];
  const min = toNumber(item.min);
  const max = toNumber(item.max);
  return {
    index,
    config: item,
    role: item.role,
    kind: itemKind(item),
    entity: item.entity,
    label: item.name || role.label,
    icon: item.icon || role.icon,
    color: item.color || role.color,
    // An item that sets one limit doesn't inherit the other one.
    min: min !== undefined || max !== undefined ? min : range[0],
    max: min !== undefined || max !== undefined ? max : range[1],
    warnMargin: toNumber(item.warn_margin) ?? role.warn_margin ?? 0,
    critical: item.critical === true,
    main: item.main === true,
    dimmable: !!role.dimmable,
    night: !!role.night,
    trigger: !!role.trigger,
    words: role.words,
    decimals: role.decimals,
    unit: item.unit,
    roleUnit: role.unit,
  };
}

function levelRank(level) {
  return LEVELS.indexOf(level);
}

// The fold override chosen with the strip's chevron, kept per card on this device.
function readFoldOverride(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function writeFoldOverride(key, value) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch (err) {
    // localStorage unavailable: the override only lasts for this page.
  }
}

/* ==========================================================================
   MAIN CARD : ha-plooum-vivarium-card
   ========================================================================== */
class HaPlooumVivariumCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      layout: { attribute: false },
      _autoFolded: { state: true },
      _override: { state: true },
    };
  }

  constructor() {
    super();
    this._autoFolded = false;
    this._override = null;
    this._levelSince = new Map(); // item key -> { level, since }: when an item entered its current level
    this._naturalHeight = 0; // px height of the unfolded card, measured while unfolded
    this._size = null;
  }

  static getConfigElement() {
    return document.createElement('ha-plooum-vivarium-card-editor');
  }

  static getStubConfig(hass) {
    const states = Object.values((hass && hass.states) || {});
    const pick = (test) =>
      states.find((s) => test(s) && /aquar/.test(s.entity_id)) || states.find((s) => test(s));
    const temperature = pick(
      (s) => s.entity_id.startsWith('sensor.') && s.attributes.device_class === 'temperature'
    );
    const light = pick((s) => s.entity_id.startsWith('light.'));
    const items = [];
    items.push({ role: 'temperature', entity: temperature ? temperature.entity_id : 'sensor.aquarium_temperature' });
    if (light) items.push({ role: 'light', entity: light.entity_id });
    return { name: 'Aquarium', vivarium_type: 'aquarium', items };
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    if (config.vivarium_type !== undefined && !VIVARIUM_TYPES[config.vivarium_type]) {
      throw new Error(`Unknown vivarium_type "${config.vivarium_type}" (use ${Object.keys(VIVARIUM_TYPES).join(', ')})`);
    }
    if (config.strip_style !== undefined && !STRIP_STYLES.includes(config.strip_style)) {
      throw new Error(`Unknown strip_style "${config.strip_style}" (use ${STRIP_STYLES.join(', ')})`);
    }
    if (config.fold !== undefined && !FOLD_MODES.includes(config.fold)) {
      throw new Error(`Unknown fold "${config.fold}" (use ${FOLD_MODES.join(', ')})`);
    }
    const items = config.items || [];
    if (!Array.isArray(items)) throw new Error('items must be a list');
    items.forEach((item, i) => {
      if (!item || typeof item !== 'object') throw new Error(`Item ${i + 1}: invalid item`);
      if (!item.role) throw new Error(`Item ${i + 1}: missing role`);
      if (!ROLES[item.role]) {
        throw new Error(`Item ${i + 1}: unknown role "${item.role}" (use ${Object.keys(ROLES).join(', ')})`);
      }
      if (!item.entity) throw new Error(`Item ${i + 1} (${item.name || ROLES[item.role].label}): missing entity`);
    });
    this.config = config;
    this._levelSince = new Map();
    this._override = this._foldMode === 'auto' ? readFoldOverride(this._foldKey) : null;
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-VIVARIUM-CARD %c ${CARD_VERSION} `,
      'color: white; background: #03a9f4; font-weight: 700;',
      'color: #03a9f4; background: white; font-weight: 700;'
    );
    this._resizeObserver = new ResizeObserver((entries) => this._onResize(entries[0].contentRect));
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._clearHold();
  }

  /* --- Size and folding --- */

  get _vivariumType() {
    return (this.config && this.config.vivarium_type) || 'aquarium';
  }

  get _foldMode() {
    return (this.config && this.config.fold) || 'auto';
  }

  // Resolved items; the main measure (`main: true`, else the first measure) gets `main` set.
  get _specs() {
    const specs = (this.config.items || []).map((item, i) => resolveItem(item, i, this._vivariumType));
    const measures = specs.filter((s) => s.kind === 'measure');
    const main = measures.find((s) => s.main) || measures[0];
    specs.forEach((s) => (s.main = s === main));
    return specs;
  }

  _mainSpec(specs) {
    return specs.find((s) => s.main);
  }

  get _foldKey() {
    const specs = this._specs;
    const main = this._mainSpec(specs) || specs[0];
    return `${FOLD_KEY_PREFIX}${this.config.name || ''}|${main ? main.entity : ''}`;
  }

  get _folded() {
    const mode = this._foldMode;
    if (mode !== 'auto') return this._override ? this._override.folded : mode === 'folded';
    // An override only holds while the automatic choice is the one it overrode.
    if (this._override && this._override.auto === this._autoFolded) return this._override.folded;
    return this._autoFolded;
  }

  _toggleFold() {
    const folded = !this._folded;
    if (this._foldMode === 'auto') {
      this._override = folded === this._autoFolded ? null : { auto: this._autoFolded, folded };
      writeFoldOverride(this._foldKey, this._override);
    } else {
      this._override = { folded }; // fixed mode: only for this page
    }
  }

  _onResize(rect) {
    if (!this.config) return;
    this._size = rect;
    if (!this._folded) this._measureNatural();
    const threshold = toNumber(this.config.fold_below_width) ?? DEFAULT_FOLD_WIDTH;
    const narrow = rect.width > 0 && rect.width < threshold;
    // In a sections grid with fixed rows, the cell's height is given by the grid, not by the
    // content: fold when the unfolded layout doesn't fit. Elsewhere the height follows the content.
    // By default the rows are "auto" (see getGridOptions): only rows set in the config fix the height.
    const rows = this.config.grid_options && this.config.grid_options.rows;
    const fixedHeight = this.layout === 'grid' && typeof rows === 'number';
    const short = fixedHeight && this._naturalHeight > 0 && rect.height + 1 < this._naturalHeight;
    const autoFolded = narrow || short;
    if (autoFolded !== this._autoFolded) this._autoFolded = autoFolded;
  }

  // Height of the unfolded content, independent of the height the parent gives the card.
  _measureNatural() {
    const strip = this.renderRoot && this.renderRoot.querySelector('.strip');
    const body = this.renderRoot && this.renderRoot.querySelector('.body');
    if (!strip || !body) return;
    this._naturalHeight = strip.offsetHeight + body.offsetHeight + 2; // + card borders
  }

  updated(changed) {
    super.updated(changed);
    if (!this._folded) {
      this._measureNatural();
      // Re-check a grid cell once the unfolded height is known.
      if (this._size && changed.has('config')) this._onResize(this._size);
    }
  }

  // Estimated unfolded height, in px, from the config alone (before anything is measured).
  _estimatedHeight() {
    const specs = this._specs;
    const measures = specs.filter((s) => s.kind === 'measure').length;
    const actuators = specs.length - measures;
    let height = 46; // strip
    if (measures || actuators) height += 22; // body padding
    if (measures) height += 58;
    if (actuators) height += Math.ceil(actuators / 4) * 34 + (measures ? 10 : 0);
    return height;
  }

  getCardSize() {
    if (!this.config || this._foldMode === 'folded') return 1;
    return Math.max(1, Math.ceil(this._estimatedHeight() / 50));
  }

  getGridOptions() {
    if (!this.config || this._foldMode === 'folded') {
      return { columns: 6, rows: 1, min_columns: 3, min_rows: 1 };
    }
    // Unfolded, the height follows the content (chips wrap with the width). Setting `rows` in
    // grid_options fixes it, and the card then folds when the unfolded layout doesn't fit.
    return { columns: 6, rows: 'auto', min_columns: 3, min_rows: 1 };
  }

  /* --- Reading states --- */

  _evaluate(spec) {
    const stateObj = this.hass.states[spec.entity];
    const result = { spec, stateObj, level: 'ok', message: '', icon: null, status: 'on', value: undefined };
    const unavailable = !stateObj || UNAVAILABLE_STATES.includes(stateObj.state);
    if (spec.kind === 'measure') {
      const value = unavailable || stateObj.state === '' ? undefined : toNumber(stateObj.state);
      result.value = value;
      result.status = value === undefined ? 'na' : 'value';
      if (value === undefined) {
        this._setLevel(result, spec.critical ? 'alert' : 'warn', `${spec.label} unavailable`);
      } else if (spec.max !== undefined && value > spec.max) {
        result.out = true;
        this._setLevel(result, 'alert', this._word(spec, 'high'));
      } else if (spec.min !== undefined && value < spec.min) {
        result.out = true;
        this._setLevel(result, 'alert', this._word(spec, 'low'));
      } else if (
        spec.warnMargin > 0 &&
        ((spec.max !== undefined && spec.max - value < spec.warnMargin) ||
          (spec.min !== undefined && value - spec.min < spec.warnMargin))
      ) {
        result.near = true;
        this._setLevel(result, 'warn', spec.main ? 'Close to limit' : `${spec.label} close to limit`);
        result.noSince = true; // drifting is not an event
      }
    } else {
      const domain = spec.entity.split('.')[0];
      if (unavailable) {
        result.status = 'na';
        this._setLevel(result, spec.critical ? 'alert' : 'warn', `${spec.label} unavailable`);
      } else if (spec.trigger && TRIGGER_SERVICES[domain]) {
        result.status = 'ready';
      } else {
        const level = this._dimLevel(spec, stateObj);
        const on = level !== undefined ? level > 0 : !OFF_STATES.includes(stateObj.state);
        result.status = on ? 'on' : 'off';
        if (on && level !== undefined && spec.dimmable) result.percent = level;
        if (!on && spec.critical) {
          this._setLevel(result, 'alert', `${spec.label} off`);
        } else if (!on && spec.night) {
          this._setLevel(result, 'info', 'Night');
          result.icon = 'mdi:weather-night';
          result.noSince = true;
        }
      }
    }
    const key = `${spec.index}:${spec.entity}`;
    const prev = this._levelSince.get(key);
    if (!prev || prev.level !== result.level) {
      const since = stateObj ? new Date(stateObj.last_changed) : null;
      this._levelSince.set(key, { level: result.level, since });
      result.since = since;
    } else {
      result.since = prev.since;
    }
    return result;
  }

  _setLevel(result, level, message) {
    result.level = level;
    result.message = message;
  }

  _word(spec, side) {
    if (spec.words && spec.words[side]) return spec.words[side];
    return `${spec.label} ${side}`;
  }

  // Dimmable level in %, or undefined when the entity doesn't provide one.
  _dimLevel(spec, stateObj) {
    if (!spec.dimmable) return undefined;
    const domain = spec.entity.split('.')[0];
    if (domain === 'light') {
      if (stateObj.state !== 'on') return undefined;
      const brightness = toNumber(stateObj.attributes.brightness);
      return brightness === undefined ? undefined : Math.round((brightness / 255) * 100);
    }
    if (['number', 'input_number', 'sensor'].includes(domain)) {
      const value = toNumber(stateObj.state);
      return value === undefined ? undefined : Math.round(value);
    }
    return undefined;
  }

  // The card's level and message: the most severe cause, ties broken by item order.
  _summary(results) {
    const causes = results
      .filter((r) => r.level !== 'ok')
      .sort((a, b) => levelRank(b.level) - levelRank(a.level) || a.spec.index - b.spec.index);
    const top = causes[0];
    if (!top) {
      const actuators = results.filter((r) => r.spec.kind === 'actuator' && r.status !== 'ready');
      const measures = results.filter((r) => r.spec.kind === 'measure');
      if (!measures.length && actuators.length && actuators.every((r) => r.status === 'off')) {
        return { level: 'info', icon: 'mdi:power', message: 'Off' };
      }
      return { level: 'ok', icon: null, message: results.length ? 'All good' : 'No items' };
    }
    let message = top.message;
    if (top.since && !top.noSince && levelRank(top.level) >= levelRank('warn')) {
      message += ` · since ${this._formatSince(top.since)}`;
    }
    const others = causes.length - 1 - causes.filter((r) => r !== top && r.level === 'info').length;
    if (others > 0) message += ` · +${others}`;
    return { level: top.level, icon: top.icon, message, cause: top };
  }

  /* --- Formatting --- */

  get _language() {
    const locale = this.hass.locale || {};
    return locale.language || this.hass.language || navigator.language;
  }

  get _timeZone() {
    const locale = this.hass.locale || {};
    return locale.time_zone === 'server' && this.hass.config ? this.hass.config.time_zone : undefined;
  }

  _formatSince(date) {
    try {
      const locale = this.hass.locale || {};
      const timeZone = this._timeZone;
      const day = (d) => new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' }).format(d);
      if (day(date) !== day(new Date())) {
        return new Intl.DateTimeFormat(this._language, { timeZone, day: 'numeric', month: 'short' }).format(date);
      }
      const lang = locale.time_format === 'system' ? undefined : this._language;
      let hour12 = locale.time_format === '12' ? true : locale.time_format === '24' ? false : undefined;
      if (hour12 === undefined) hour12 = new Intl.DateTimeFormat(lang, { hour: 'numeric' }).resolvedOptions().hour12;
      // 24-hour times keep two digits (09:12), 12-hour times don't (9:12 AM).
      const hour = hour12 ? 'numeric' : '2-digit';
      return new Intl.DateTimeFormat(lang, { timeZone, hour, minute: '2-digit', hour12 }).format(date);
    } catch (err) {
      return date.toLocaleTimeString();
    }
  }

  get _numberLocale() {
    const format = (this.hass.locale || {}).number_format;
    const locales = { comma_decimal: 'en-US', decimal_comma: 'de', space_comma: 'fr', system: undefined };
    return format in locales ? locales[format] : this._language;
  }

  _formatNumber(value, decimals) {
    const options =
      decimals !== undefined
        ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
        : { maximumFractionDigits: 2 };
    try {
      return new Intl.NumberFormat(this._numberLocale, options).format(value);
    } catch (err) {
      return String(value);
    }
  }

  _formatValue(result) {
    const { spec, stateObj, value } = result;
    if (value === undefined) return '?';
    const registry = this.hass.entities && this.hass.entities[spec.entity];
    const decimals = registry && registry.display_precision != null ? registry.display_precision : spec.decimals;
    const unit = spec.unit ?? (stateObj && stateObj.attributes.unit_of_measurement) ?? spec.roleUnit ?? '';
    const text = this._formatNumber(value, decimals);
    if (!unit) return text;
    // Degrees stay attached and drop their scale (25.9°), like the strip of a thermometer.
    if (unit.startsWith('°')) return `${text}°`;
    return `${text} ${unit}`;
  }

  _formatRange(spec) {
    const n = (v) => this._formatNumber(v);
    if (spec.min !== undefined && spec.max !== undefined) return `${n(spec.min)}–${n(spec.max)}`;
    if (spec.max !== undefined) return `≤ ${n(spec.max)}`;
    if (spec.min !== undefined) return `≥ ${n(spec.min)}`;
    return '';
  }

  _stateText(result) {
    const { stateObj } = result;
    if (!stateObj) return 'Not found';
    if (this.hass.formatEntityState) return this.hass.formatEntityState(stateObj);
    return stateObj.state;
  }

  /* --- Actions --- */

  _actionOf(spec, which) {
    const conf = spec.config[`${which}_action`];
    const action = typeof conf === 'string' ? conf : conf && conf.action;
    if (action) return action;
    if (which === 'hold') return 'more-info';
    return spec.kind === 'actuator' ? 'toggle' : 'more-info';
  }

  _run(spec, which) {
    const action = this._actionOf(spec, which);
    if (action === 'none') return;
    if (action === 'toggle' && this._toggle(spec)) return;
    this._moreInfo(spec.entity);
  }

  // Runs the entity's own on/off (or trigger) service; false when it has none.
  _toggle(spec) {
    const stateObj = this.hass.states[spec.entity];
    if (!stateObj || UNAVAILABLE_STATES.includes(stateObj.state)) return false;
    const domain = spec.entity.split('.')[0];
    let service = TRIGGER_SERVICES[domain];
    if (!service && domain === 'light') service = 'light.toggle';
    if (!service && TOGGLE_DOMAINS.includes(domain)) service = 'homeassistant.toggle';
    if (!service) return false;
    const [svcDomain, svc] = service.split('.');
    this.hass.callService(svcDomain, svc, { entity_id: spec.entity });
    return true;
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
  }

  _pointerDown(ev, spec) {
    if (ev.button !== undefined && ev.button !== 0) return;
    this._clearHold();
    this._held = false;
    this._holdStart = { x: ev.clientX, y: ev.clientY };
    this._holdTimer = setTimeout(() => {
      this._holdTimer = null;
      this._held = true;
      this._run(spec, 'hold');
    }, HOLD_DELAY);
  }

  _pointerMove(ev) {
    if (!this._holdTimer || !this._holdStart) return;
    if (Math.abs(ev.clientX - this._holdStart.x) > 10 || Math.abs(ev.clientY - this._holdStart.y) > 10) {
      this._clearHold();
    }
  }

  _clearHold() {
    if (this._holdTimer) clearTimeout(this._holdTimer);
    this._holdTimer = null;
  }

  _click(ev, spec) {
    ev.stopPropagation();
    this._clearHold();
    if (this._held) {
      this._held = false; // the press already ran its hold action
      return;
    }
    this._run(spec, 'tap');
  }

  _pressHandlers(spec) {
    return {
      down: (ev) => this._pointerDown(ev, spec),
      click: (ev) => this._click(ev, spec),
    };
  }

  /* --- Rendering --- */

  render() {
    if (!this.hass || !this.config) return nothing;
    const specs = this._specs;
    const results = specs.map((spec) => this._evaluate(spec));
    const summary = this._summary(results);
    const mainSpec = this._mainSpec(specs);
    const main = mainSpec ? results[mainSpec.index] : undefined;
    const measures = results.filter((r) => r.spec.kind === 'measure' && r !== main);
    const actuators = results.filter((r) => r.spec.kind === 'actuator');
    const folded = this._folded;
    const style = this.config.strip_style || 'quiet';
    const vivariumType = VIVARIUM_TYPES[this._vivariumType];
    const name = this.config.name || vivariumType.label;
    const icon = summary.icon || (summary.level === 'ok' ? this.config.icon || vivariumType.icon : LEVEL_ICONS[summary.level]);
    const nameTarget = (mainSpec || specs[0] || {}).entity;

    return html`
      <ha-card class="lvl-${summary.level} style-${style} ${folded ? 'folded' : ''}">
        <div class="strip">
          <ha-icon class="sev" .icon=${icon}></ha-icon>
          <button class="name" title=${name} @click=${() => this._moreInfo(nameTarget)}>${name}</button>
          <span class="msg" title=${summary.message}>${summary.message}</span>
          ${folded ? this._renderFoldedTail(main, actuators) : nothing}
          <button
            class="fold"
            aria-label=${folded ? `Unfold ${name}` : `Fold ${name}`}
            aria-expanded=${folded ? 'false' : 'true'}
            @click=${() => this._toggleFold()}
          >
            <ha-icon .icon=${folded ? 'mdi:chevron-down' : 'mdi:chevron-up'}></ha-icon>
          </button>
        </div>
        ${folded || !results.length
          ? nothing
          : html`
              <div class="body">
                ${main || measures.length
                  ? html`<div class="measures">
                      ${main ? this._renderMeasure(main, true) : nothing}
                      ${measures.map((r) => this._renderMeasure(r, false))}
                    </div>`
                  : nothing}
                ${actuators.length
                  ? html`<div class="chips">${actuators.map((r) => this._renderChip(r))}</div>`
                  : nothing}
              </div>
            `}
      </ha-card>
    `;
  }

  _renderFoldedTail(main, actuators) {
    const valueClass = main ? (main.out ? 'out' : main.near || main.status === 'na' ? 'near' : '') : '';
    return html`
      ${main ? html`<span class="fold-value ${valueClass}">${this._formatValue(main)}</span>` : nothing}
      ${actuators.length
        ? html`<span class="dots" aria-hidden="true">
            ${actuators.map((r) => html`<span class="dot ${r.status}" style="--chip-color: ${r.spec.color}"></span>`)}
          </span>`
        : nothing}
    `;
  }

  _renderMeasure(result, isMain) {
    const { spec } = result;
    const press = this._pressHandlers(spec);
    const range = this._formatRange(spec);
    const value = this._formatValue(result);
    const valueClass = result.out ? 'out' : result.status === 'na' ? 'na' : '';
    const label = `${spec.label}: ${result.status === 'na' ? this._stateText(result) : value}${range ? `, target ${range}` : ''}`;
    return html`
      <button
        class="measure ${isMain ? 'main' : 'small'}"
        aria-label=${label}
        title=${label}
        @pointerdown=${press.down}
        @pointermove=${this._pointerMove}
        @pointerup=${this._clearHold}
        @pointercancel=${this._clearHold}
        @pointerleave=${this._clearHold}
        @contextmenu=${(ev) => ev.preventDefault()}
        @click=${press.click}
      >
        <span class="line">
          ${isMain ? nothing : html`<ha-icon class="m-icon" .icon=${spec.icon}></ha-icon>`}
          <span class="value ${valueClass}">${value}</span>
          ${range ? html`<span class="range">${range}</span>` : nothing}
        </span>
        ${this._renderBar(spec, result)}
      </button>
    `;
  }

  _renderBar(spec, result) {
    const { min, max } = spec;
    if (min === undefined && max === undefined) return nothing;
    let lo;
    let hi;
    if (min !== undefined && max !== undefined) {
      const width = max - min || 1;
      lo = min - width * RANGE_PAD;
      hi = max + width * RANGE_PAD;
    } else {
      const limit = min !== undefined ? min : max;
      const d = Math.abs(limit) * 0.5 || 1;
      lo = min !== undefined ? limit - d : limit - 2 * d;
      hi = min !== undefined ? limit + 2 * d : limit + d;
    }
    const pos = (v) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));
    const left = pos(min !== undefined ? min : lo);
    const right = pos(max !== undefined ? max : hi);
    return html`
      <span class="bar">
        <span class="band" style="left: ${left}%; width: ${right - left}%"></span>
        ${result.value !== undefined
          ? html`<span class="marker ${result.out ? 'out' : ''}" style="left: ${pos(result.value)}%"></span>`
          : nothing}
      </span>
    `;
  }

  _renderChip(result) {
    const { spec, status } = result;
    const press = this._pressHandlers(spec);
    const percent = result.percent !== undefined ? ` ${result.percent} %` : '';
    const label = `${spec.label}: ${this._stateText(result)}`;
    return html`
      <button
        class="chip ${status}"
        style="--chip-color: ${spec.color}"
        aria-label=${label}
        title=${label}
        @pointerdown=${press.down}
        @pointermove=${this._pointerMove}
        @pointerup=${this._clearHold}
        @pointercancel=${this._clearHold}
        @pointerleave=${this._clearHold}
        @contextmenu=${(ev) => ev.preventDefault()}
        @click=${press.click}
      >
        ${status === 'na' ? '? ' : nothing}${status === 'ready'
          ? html`<ha-icon class="c-icon" .icon=${spec.icon}></ha-icon>`
          : nothing}${spec.label}${percent}
      </button>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
      }
      ha-card {
        --lvl: var(--success-color, #43a047);
        --lvl-ink: color-mix(in srgb, var(--lvl) 72%, var(--primary-text-color, #212121));
        --warn-ink: color-mix(in srgb, var(--warning-color, #ffa600) 72%, var(--primary-text-color, #212121));
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        container-type: inline-size;
      }
      ha-card.lvl-info {
        --lvl: var(--secondary-text-color, #727272);
        --lvl-ink: var(--secondary-text-color, #727272);
      }
      ha-card.lvl-warn {
        --lvl: var(--warning-color, #ffa600);
      }
      ha-card.lvl-alert {
        --lvl: var(--error-color, #db4437);
      }
      ha-card.lvl-alert:not(.style-solid) {
        --ha-card-border-color: color-mix(in srgb, var(--error-color, #db4437) 60%, transparent);
        border-color: color-mix(in srgb, var(--error-color, #db4437) 60%, transparent);
      }

      button {
        font: inherit;
        color: inherit;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      button:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      /* --- Strip --- */
      .strip {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        padding: 0 4px 0 12px;
        box-sizing: border-box;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      ha-card:not(.folded) .strip {
        border-bottom: 1px solid var(--divider-color);
      }
      ha-card.folded .strip {
        flex: 1 1 auto;
      }
      .sev {
        --mdc-icon-size: 20px;
        flex: none;
        color: var(--lvl-ink);
      }
      ha-card.lvl-ok .sev {
        color: var(--lvl);
      }
      .name {
        flex: 0 1 auto;
        min-width: 0;
        max-width: 55%;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .msg {
        flex: 1 4 auto; /* shrinks faster than the name, but neither one disappears */
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--secondary-text-color);
      }
      ha-card.lvl-warn .name,
      ha-card.lvl-warn .msg,
      ha-card.lvl-alert .name,
      ha-card.lvl-alert .msg {
        color: var(--lvl-ink);
      }
      .fold-value {
        flex: none;
        white-space: nowrap;
      }
      .fold-value.near {
        color: var(--warn-ink);
      }
      .fold-value.out {
        color: var(--error-color, #db4437);
      }
      .dots {
        flex: none;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        box-sizing: border-box;
        background: var(--chip-color);
        border: 1.5px solid var(--chip-color);
      }
      .dot.off {
        background: transparent;
        border-color: var(--secondary-text-color);
      }
      .dot.ready {
        background: transparent;
      }
      .dot.na {
        background: var(--warning-color, #ffa600);
        border-color: var(--warning-color, #ffa600);
      }
      .fold {
        flex: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        --mdc-icon-size: 22px;
      }
      .fold:hover {
        background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
      }

      /* Very narrow (a third of a sections grid on a phone): the folded line keeps the icon,
         the name, the main value, the dots and the toggle; the severity icon still tells the level. */
      @container (max-width: 210px) {
        .strip {
          gap: 4px;
          padding-left: 8px;
        }
        ha-card.folded .msg {
          display: none;
        }
        .name {
          max-width: none;
        }
        .fold {
          width: 28px;
        }
        .dots {
          gap: 3px;
        }
      }

      /* Strip styles: quiet is the default above. */
      ha-card.style-tinted .strip {
        background: color-mix(in srgb, var(--lvl) 14%, var(--card-background-color, #fff));
      }
      ha-card.style-solid .strip {
        background: var(--lvl);
      }
      ha-card.style-solid .strip,
      ha-card.style-solid .sev,
      ha-card.style-solid .name,
      ha-card.style-solid .msg,
      ha-card.style-solid .fold,
      ha-card.style-solid .fold-value {
        color: #fff;
      }
      ha-card.style-solid .dot.off {
        border-color: rgba(255, 255, 255, 0.8);
      }
      ha-card.style-solid .dot {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6);
      }

      /* --- Body --- */
      .body {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 12px 12px;
      }
      .measures {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 8px 20px;
      }
      .measure {
        display: block;
        text-align: left;
        min-width: 0;
        flex: 1 1 110px;
      }
      .measure.main {
        flex: 2 1 150px;
      }
      .line {
        display: flex;
        align-items: baseline;
        gap: 6px;
        white-space: nowrap;
        overflow: hidden;
      }
      .value {
        color: var(--primary-text-color);
      }
      .main .value {
        font-size: 32px;
        line-height: 38px;
        font-weight: 400;
      }
      .small .value {
        font-size: 18px;
        line-height: 24px;
      }
      .m-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        align-self: center;
      }
      .value.out {
        color: var(--error-color, #db4437);
      }
      .value.na {
        color: var(--warn-ink);
      }
      .range {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .bar {
        display: block;
        position: relative;
        height: 6px;
        margin: 6px 2px 4px;
        border-radius: 3px;
        background: var(--divider-color, #e0e0e0);
      }
      .small .bar {
        height: 5px;
      }
      .band {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 3px;
        background: var(--success-color, #43a047);
        opacity: 0.75;
      }
      .marker {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 3px;
        border-radius: 2px;
        transform: translateX(-50%);
        background: var(--primary-text-color);
      }
      .marker.out {
        background: var(--error-color, #db4437);
      }

      /* --- Actuator chips --- */
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 28px;
        padding: 0 12px;
        border-radius: 14px;
        box-sizing: border-box;
        font-size: 13px;
        white-space: nowrap;
        border: 1px solid var(--chip-color);
        background: var(--chip-color);
        color: #fff;
      }
      .chip.off {
        background: transparent;
        border-color: var(--divider-color, #e0e0e0);
        color: var(--secondary-text-color);
      }
      .chip.na {
        background: transparent;
        border-color: var(--warning-color, #ffa600);
        color: var(--warn-ink);
      }
      .chip.ready {
        background: transparent;
        color: var(--chip-color);
      }
      .c-icon {
        --mdc-icon-size: 16px;
      }
    `;
  }
}

/* ==========================================================================
   EDITOR : ha-plooum-vivarium-card-editor
   ========================================================================== */
const TOP_LABELS = {
  name: 'Name',
  vivarium_type: 'Vivarium type',
  icon: 'Icon',
  strip_style: 'Strip style',
  fold: 'Fold',
  fold_below_width: 'Fold below this width (px)',
};

const ITEM_LABELS = {
  role: 'Role',
  entity: 'Entity',
  kind: 'Kind',
  name: 'Name',
  icon: 'Icon',
  color: 'Color (CSS, e.g. #ff9800)',
  unit: 'Unit',
  min: 'Target min',
  max: 'Target max',
  warn_margin: 'Warn margin (close to limit)',
  main: 'Main measure (shown big)',
  critical: 'Critical (off or unavailable is an alert)',
  tap_action: 'Tap action',
  hold_action: 'Hold action',
};

class HaPlooumVivariumCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true },
      _open: { state: true },
    };
  }

  constructor() {
    super();
    this._open = -1;
    this._addKey = 0;
  }

  setConfig(config) {
    this._config = config;
  }

  get _items() {
    return (this._config && this._config.items) || [];
  }

  get _vivariumType() {
    return (this._config && this._config.vivarium_type) || 'aquarium';
  }

  _fire(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  _setItems(items) {
    this._fire({ ...this._config, items });
  }

  // Roles for a select, with the vivarium type's suggested roles first and custom last.
  _roleOptions() {
    const suggested = VIVARIUM_TYPES[this._vivariumType].suggested;
    const rest = Object.keys(ROLES).filter((r) => !suggested.includes(r) && r !== 'custom');
    return [...suggested, ...rest, 'custom'].map((r) => ({
      value: r,
      label: `${ROLES[r].label}${ROLES[r].kind ? ` (${ROLES[r].kind})` : ''}`,
    }));
  }

  _topSchema() {
    const vivariumType = VIVARIUM_TYPES[this._vivariumType];
    const schema = [
      { name: 'name', selector: { text: {} } },
      {
        type: 'grid',
        name: '',
        schema: [
          {
            name: 'vivarium_type',
            required: true,
            selector: {
              select: {
                mode: 'dropdown',
                options: Object.entries(VIVARIUM_TYPES).map(([value, h]) => ({ value, label: h.label })),
              },
            },
          },
          { name: 'icon', selector: { icon: { placeholder: vivariumType.icon } } },
          {
            name: 'strip_style',
            required: true,
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'quiet', label: 'Quiet (only a problem is colored)' },
                  { value: 'tinted', label: 'Tinted' },
                  { value: 'solid', label: 'Solid (wall tablets)' },
                ],
              },
            },
          },
          {
            name: 'fold',
            required: true,
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'auto', label: 'Auto (fold when small)' },
                  { value: 'folded', label: 'Folded' },
                  { value: 'unfolded', label: 'Unfolded' },
                ],
              },
            },
          },
        ],
      },
    ];
    if ((this._config.fold || 'auto') === 'auto') {
      schema.push({ name: 'fold_below_width', selector: { number: { min: 0, max: 1000, step: 10, mode: 'box' } } });
    }
    return schema;
  }

  _itemSchema(item) {
    const role = ROLES[item.role] || ROLES.custom;
    const kind = itemKind(item);
    const isCustom = item.role === 'custom';
    const entity = role.domains ? { filter: { domain: role.domains } } : {};
    const schema = [
      { name: 'role', required: true, selector: { select: { mode: 'dropdown', options: this._roleOptions() } } },
    ];
    if (isCustom) {
      schema.push({
        type: 'grid',
        name: '',
        schema: [
          {
            name: 'kind',
            required: true,
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'measure', label: 'Measure (numeric value)' },
                  { value: 'actuator', label: 'Actuator (on/off)' },
                ],
              },
            },
          },
          { name: 'name', selector: { text: {} } },
        ],
      });
    }
    schema.push({ name: 'entity', required: true, selector: { entity } });

    const advanced = [];
    const display = [];
    if (!isCustom) display.push({ name: 'name', selector: { text: {} } });
    display.push({ name: 'icon', selector: { icon: { placeholder: role.icon } } });
    display.push({ name: 'color', selector: { text: {} } });
    if (kind === 'measure') display.push({ name: 'unit', selector: { text: {} } });
    advanced.push({ type: 'grid', name: '', schema: display });
    if (kind === 'measure') {
      const number = { number: { mode: 'box', step: 'any' } };
      advanced.push({
        type: 'grid',
        name: '',
        schema: [
          { name: 'min', selector: number },
          { name: 'max', selector: number },
          { name: 'warn_margin', selector: { number: { mode: 'box', step: 'any', min: 0 } } },
        ],
      });
      advanced.push({ name: 'main', selector: { boolean: {} } });
    }
    advanced.push({ name: 'critical', selector: { boolean: {} } });
    const actions = {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'toggle', label: 'Toggle / run' },
          { value: 'more-info', label: 'More info' },
          { value: 'none', label: 'Nothing' },
        ],
      },
    };
    advanced.push({
      type: 'grid',
      name: '',
      schema: [
        { name: 'tap_action', selector: actions },
        { name: 'hold_action', selector: actions },
      ],
    });
    schema.push({ type: 'expandable', name: '', flatten: true, title: 'Advanced', schema: advanced });
    return schema;
  }

  // Default values, shown as helpers under the fields left empty.
  _itemHelper(item, field) {
    if (item[field] !== undefined && item[field] !== '') return undefined;
    const role = ROLES[item.role] || ROLES.custom;
    const spec = resolveItem({ ...item, role: ROLES[item.role] ? item.role : 'custom' }, 0, this._vivariumType);
    switch (field) {
      case 'name':
        return item.role === 'custom' ? undefined : `Default: ${role.label}`;
      case 'color':
        return `Default: ${role.color}`;
      case 'unit':
        return role.unit ? `Default: the entity's unit, else ${role.unit}` : "Default: the entity's unit";
      case 'min':
      case 'max':
        return spec[field] !== undefined ? `Default for this vivarium type: ${spec[field]}` : 'Default: none';
      case 'warn_margin':
        return `Default: ${role.warn_margin || 0}`;
      case 'tap_action':
        return `Default: ${spec.kind === 'actuator' ? 'toggle / run' : 'more info'}`;
      case 'hold_action':
        return 'Default: more info';
      default:
        return undefined;
    }
  }

  _topChanged(ev) {
    ev.stopPropagation();
    const config = { ...this._config, ...ev.detail.value };
    for (const key of Object.keys(TOP_LABELS)) {
      if (config[key] === undefined || config[key] === null || config[key] === '') delete config[key];
    }
    // Defaults stay out of the YAML.
    if (config.strip_style === 'quiet') delete config.strip_style;
    if (config.fold === 'auto') delete config.fold;
    if ((config.fold || 'auto') !== 'auto' || config.fold_below_width === DEFAULT_FOLD_WIDTH) delete config.fold_below_width;
    this._fire(config);
  }

  _itemChanged(index, ev) {
    ev.stopPropagation();
    const previous = this._items[index];
    const item = { ...ev.detail.value };
    for (const key of Object.keys(item)) {
      if (item[key] === undefined || item[key] === null || item[key] === '' || item[key] === false) delete item[key];
    }
    if (item.role !== 'custom') delete item.kind;
    else if (!item.kind) item.kind = 'measure';
    if (itemKind(item) !== 'measure') {
      for (const key of ['unit', 'min', 'max', 'warn_margin', 'main']) delete item[key];
    }
    // Switching role: a default entity guess when the current one doesn't fit the new role.
    if (item.role !== previous.role && item.entity && !this._fits(item.role, item.entity)) {
      const guess = this._guessEntity(item.role);
      if (guess) item.entity = guess;
    }
    let items = this._items.map((it, i) => (i === index ? item : it));
    // Only one main measure.
    if (item.main && !previous.main) {
      items = items.map((it, i) => {
        if (i === index || !it.main) return it;
        const { main, ...rest } = it;
        return rest;
      });
    }
    this._setItems(items);
  }

  _fits(role, entityId) {
    const domains = ROLES[role] && ROLES[role].domains;
    return !domains || domains.includes(entityId.split('.')[0]);
  }

  // Best entity for a new item of this role: matching domain, then device class or name, not used yet.
  _guessEntity(role) {
    if (!this.hass) return '';
    const def = ROLES[role];
    const used = new Set(this._items.map((it) => it.entity));
    const words = [this._vivariumType, ...String(this._config.name || '').toLowerCase().split(/\W+/)].filter(
      (w) => w && w.length > 1
    );
    let best = '';
    let bestScore = 0;
    for (const s of Object.values(this.hass.states)) {
      const id = s.entity_id;
      if (used.has(id) || !this._fits(role, id)) continue;
      const text = `${id} ${s.attributes.friendly_name || ''}`.toLowerCase();
      let score = 0;
      if (def.device_class && s.attributes.device_class === def.device_class) score += 3;
      else if (def.match && def.match.test(text)) score += 2;
      if (!score) continue;
      score += words.filter((w) => text.includes(w)).length;
      if (score > bestScore) {
        best = id;
        bestScore = score;
      }
    }
    return best;
  }

  _addItem(ev) {
    ev.stopPropagation();
    const role = ev.detail.value;
    this._addKey += 1; // re-creates the "add" select, so it shows empty again
    if (!role || !ROLES[role]) {
      this.requestUpdate();
      return;
    }
    const item = { role, entity: this._guessEntity(role) };
    if (role === 'custom') item.kind = 'measure';
    if (!item.entity) delete item.entity;
    this._open = this._items.length;
    this._setItems([...this._items, item]);
  }

  _removeItem(ev, index) {
    ev.stopPropagation();
    this._open = this._open === index ? -1 : this._open > index ? this._open - 1 : this._open;
    this._setItems(this._items.filter((_, i) => i !== index));
  }

  _moveItem(ev, index, delta) {
    ev.stopPropagation();
    const target = index + delta;
    if (target < 0 || target >= this._items.length) return;
    const items = [...this._items];
    [items[index], items[target]] = [items[target], items[index]];
    if (this._open === index) this._open = target;
    else if (this._open === target) this._open = index;
    this._setItems(items);
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const data = { vivarium_type: 'aquarium', strip_style: 'quiet', fold: 'auto', ...this._config };
    if (data.fold === 'auto' && data.fold_below_width === undefined) data.fold_below_width = DEFAULT_FOLD_WIDTH;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${this._topSchema()}
        .computeLabel=${(s) => TOP_LABELS[s.name] || s.name}
        @value-changed=${this._topChanged}
      ></ha-form>

      <div class="items-header">Items</div>
      <div class="items">${this._items.map((item, i) => this._renderItem(item, i))}</div>

      <div class="add">
        ${keyed(
          this._addKey,
          html`<ha-selector
            .hass=${this.hass}
            .selector=${{ select: { mode: 'dropdown', options: this._roleOptions() } }}
            .label=${'Add an item'}
            .required=${false}
            .value=${''}
            @value-changed=${this._addItem}
          ></ha-selector>`
        )}
      </div>
    `;
  }

  _renderItem(item, index) {
    const role = ROLES[item.role] || ROLES.custom;
    const open = this._open === index;
    const name = item.name || role.label;
    const stateObj = item.entity && this.hass.states[item.entity];
    const entityText = item.entity
      ? stateObj
        ? `${stateObj.attributes.friendly_name || item.entity} · ${item.entity}`
        : `${item.entity} (not found)`
      : 'No entity: pick one';
    return html`
      <div class="item ${open ? 'open' : ''}">
        <div
          class="item-head"
          role="button"
          tabindex="0"
          aria-expanded=${open ? 'true' : 'false'}
          @click=${() => (this._open = open ? -1 : index)}
          @keydown=${(ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              this._open = open ? -1 : index;
            }
          }}
        >
          <ha-icon class="item-icon" .icon=${item.icon || role.icon} style="color: ${item.color || role.color}"></ha-icon>
          <div class="item-title">
            <span class="item-name">${name}${item.main ? ' · main' : ''}${item.critical ? ' · critical' : ''}</span>
            <span class="item-entity ${item.entity && stateObj ? '' : 'missing'}">${entityText}</span>
          </div>
          <button title="Move up" ?disabled=${index === 0} @click=${(ev) => this._moveItem(ev, index, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button
            title="Move down"
            ?disabled=${index === this._items.length - 1}
            @click=${(ev) => this._moveItem(ev, index, 1)}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <button title="Remove" @click=${(ev) => this._removeItem(ev, index)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
          <ha-icon class="chevron" .icon=${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${open
          ? html`<div class="item-body">
              <ha-form
                .hass=${this.hass}
                .data=${item}
                .schema=${this._itemSchema(item)}
                .computeLabel=${(s) => ITEM_LABELS[s.name] || s.title || s.name}
                .computeHelper=${(s) => this._itemHelper(item, s.name)}
                @value-changed=${(ev) => this._itemChanged(index, ev)}
              ></ha-form>
            </div>`
          : nothing}
      </div>
    `;
  }

  static get styles() {
    return css`
      .items-header {
        margin: 20px 0 8px;
        font-weight: 500;
        font-size: 16px;
      }
      .items {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .item {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
      }
      .item.open {
        border-color: var(--primary-color);
      }
      .item-head {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 6px 12px;
        cursor: pointer;
      }
      .item-head:focus-visible {
        outline: 2px solid var(--primary-color);
        border-radius: 8px;
      }
      .item-icon {
        flex: none;
        --mdc-icon-size: 22px;
      }
      .item-title {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        margin-left: 6px;
      }
      .item-name {
        font-weight: 500;
      }
      .item-entity {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-entity.missing {
        color: var(--warning-color, #ffa600);
      }
      .item-head button {
        flex: none;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 20px;
      }
      .item-head button:hover:not([disabled]) {
        background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
      }
      .item-head button[disabled] {
        opacity: 0.3;
        cursor: default;
      }
      .chevron {
        flex: none;
        color: var(--secondary-text-color);
      }
      .item-body {
        padding: 4px 12px 12px;
      }
      .add {
        margin-top: 12px;
      }
    `;
  }
}

if (!customElements.get('ha-plooum-vivarium-card')) {
  customElements.define('ha-plooum-vivarium-card', HaPlooumVivariumCard);
}
if (!customElements.get('ha-plooum-vivarium-card-editor')) {
  customElements.define('ha-plooum-vivarium-card-editor', HaPlooumVivariumCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'ha-plooum-vivarium-card')) {
  window.customCards.push({
    type: 'ha-plooum-vivarium-card',
    name: 'HA Plooum Vivarium Card',
    description: 'One aquarium, pond or terrarium at a glance: its measures, its equipment and what needs attention.',
    preview: true,
  });
}
