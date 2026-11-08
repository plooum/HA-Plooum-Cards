import { LitElement, html, svg, css, nothing, render as litRender } from "lit";

const CARD_VERSION = '1.0.0';

/*
 * Every room's temperature and humidity in one band:
 * - the band's color glides from room to room with the temperature (cold blue to hot coral);
 * - a "water table" rises inside it with the humidity, one smooth curve across the rooms, darker
 *   towards the bottom;
 * - a humidity above the threshold pulses in red (only the value, the band stays calm).
 * Too narrow for every room on one line (a phone), the band splits into two lines: the first half of
 * the rooms on top, the rest centered under them, with the same room width.
 * A tap on a room opens its history: the temperature as a line, the humidity as the same water table, the
 * alert threshold, over 6 h, 24 h, 7 days or 30 days.
 */

const DEFAULTS = {
  threshold: 60,
  humidity_min: 30,
  humidity_max: 90,
  min_room_width: 80,
  temp_decimals: 1,
  pulse: true,
};

// Temperature -> color, from cold to hot: the first stop whose `below` is above the value.
const TEMP_COLORS = [
  { below: 12, color: '#378ADD' },
  { below: 18, color: '#85B7EB' },
  { below: 20, color: '#9FE1CB' },
  { below: 22, color: '#EF9F27' },
  { below: Infinity, color: '#D85A30' },
];
const NO_VALUE_COLOR = '#888780';

// History periods: the last 6 h and 24 h come from the recorder's states, 7 and 30 days from its hourly
// statistics (lighter, and kept longer than the states).
const PERIODS = [
  { key: '6h', label: '6 h', hours: 6, source: 'history' },
  { key: '24h', label: '24 h', hours: 24, source: 'history' },
  { key: '7d', label: '7 d', hours: 24 * 7, source: 'statistics' },
  { key: '30d', label: '30 d', hours: 24 * 30, source: 'statistics' },
];
const MAX_POINTS = 300;

const ONE_LINE_HEIGHT = 44;
const STACKED_HEIGHT = 52;
const LINE_GAP = 6;

/* ==========================================================================
   MAIN CARD : ha-plooum-climate-band-card
   ========================================================================== */
class HaPlooumClimateBandCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _width: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-climate-band-card-editor");
  }

  static getStubConfig(hass) {
    const states = hass ? Object.values(hass.states) : [];
    const temps = states.filter((s) => s.entity_id.startsWith('sensor.') && s.attributes.device_class === 'temperature');
    const hums = states.filter((s) => s.entity_id.startsWith('sensor.') && s.attributes.device_class === 'humidity');
    const rooms = temps.slice(0, 3).map((t) => {
      const prefix = t.entity_id.replace(/_temperature$/, '');
      const hum = hums.find((h) => h.entity_id.replace(/_humidity$/, '') === prefix);
      const room = { name: (t.attributes.friendly_name || t.entity_id).replace(/ temperature$/i, ''), temperature: t.entity_id };
      if (hum) room.humidity = hum.entity_id;
      return room;
    });
    return { rooms: rooms.length ? rooms : [{ name: 'Room' }] };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    if (config.rooms !== undefined && !Array.isArray(config.rooms)) throw new Error("rooms must be a list");
    this.config = { ...config };
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 'full', min_columns: 3 };
  }

  connectedCallback() {
    super.connectedCallback();
    if (!HaPlooumClimateBandCard._logged) {
      HaPlooumClimateBandCard._logged = true;
      console.info(
        `%c HA-PLOOUM-CLIMATE-BAND-CARD %c ${CARD_VERSION} `,
        'color: white; background: #03a9f4; font-weight: 700;',
        'color: #03a9f4; background: white; font-weight: 700;'
      );
    }
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = Math.floor(entries[0].contentRect.width);
      if (width !== this._width) this._width = width;
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._closeHistory();
  }

  updated() {
    // Live values in the dialog's header follow the card's states.
    if (this._dialogHost) this._renderDialog();
  }

  _opt(key) {
    const v = this.config[key];
    return v === undefined || v === null || v === '' ? DEFAULTS[key] : v;
  }

  static tempColor(t) {
    if (t === null) return NO_VALUE_COLOR;
    return TEMP_COLORS.find((s) => t < s.below).color;
  }

  // A state as a number, or null when it isn't one (unavailable, unknown, missing, text).
  _number(entityId) {
    const st = entityId && this.hass.states[entityId];
    if (!st) return null;
    const n = parseFloat(st.state);
    return Number.isFinite(n) ? n : null;
  }

  _rooms() {
    const decimals = Number(this._opt('temp_decimals'));
    return (this.config.rooms || []).map((r, index) => {
      const room = typeof r === 'string' ? { temperature: r } : r || {};
      const temp = this._number(room.temperature);
      const hum = this._number(room.humidity);
      const st = room.temperature && this.hass.states[room.temperature];
      const name = room.name || (st && st.attributes.friendly_name) || room.temperature || '';
      return {
        index,
        name,
        tempEntity: room.temperature,
        humEntity: room.humidity,
        temp,
        hum,
        tempText: temp === null ? '—' : `${temp.toFixed(decimals)}°`,
        humText: room.humidity ? (hum === null ? '—' : `${Math.round(hum)}%`) : '',
      };
    });
  }

  // Splits the rooms into lines: one when every room gets min_room_width, otherwise two, the first one
  // holding the larger half. Every room keeps the same width, so the shorter line is centered.
  static layout(count, width, minRoomWidth) {
    if (!count || !width) return { lines: [], roomWidth: 0, stacked: false };
    if (count === 1 || width / count >= minRoomWidth) {
      return { lines: [count], roomWidth: width / count, stacked: false };
    }
    const first = Math.ceil(count / 2);
    return { lines: [first, count - first], roomWidth: width / first, stacked: true };
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }));
  }

  // --- History dialog (rendered in a container on document.body, so no card ancestor can clip it) ---

  _openHistory(ev, roomIndex) {
    ev.stopPropagation();
    if (this._dialogHost) this._closeHistory();
    this._history = { room: roomIndex, period: this._history ? this._history.period : '24h', data: null, error: '', cursor: null };
    const host = document.createElement('div');
    host.setAttribute('data-plooum-climate-band-dialog', '');
    const root = host.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [DIALOG_STYLES.styleSheet];
    document.body.appendChild(host);
    this._dialogHost = host;
    this._onKey = (e) => { if (e.key === 'Escape') this._closeHistory(); };
    this._onResize = () => this._renderDialog();
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('resize', this._onResize);
    this._renderDialog();
    this._loadHistory();
  }

  _closeHistory() {
    if (!this._dialogHost) return;
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('resize', this._onResize);
    this._dialogHost.remove();
    this._dialogHost = null;
  }

  /** The history dialog's shadow root while it is open (for tests). */
  get dialogRoot() {
    return this._dialogHost ? this._dialogHost.shadowRoot : null;
  }

  _renderDialog() {
    if (this._dialogHost) litRender(this._dialogTemplate(), this._dialogHost.shadowRoot, { host: this });
  }

  _setPeriod(key) {
    if (this._history.period === key) return;
    this._history = { ...this._history, period: key, data: null, error: '', cursor: null };
    this._renderDialog();
    this._loadHistory();
  }

  async _loadHistory() {
    const request = this._history;
    const room = this._rooms()[request.room];
    const period = PERIODS.find((p) => p.key === request.period);
    const end = new Date();
    const start = new Date(end.getTime() - period.hours * 3600 * 1000);
    const ids = [room.tempEntity, room.humEntity].filter(Boolean);
    let data;
    try {
      data = period.source === 'statistics'
        ? await this._fetchStatistics(ids, start, end)
        : await this._fetchHistory(ids, start, end);
    } catch (e) {
      if (this._history === request) {
        this._history = { ...request, error: (e && e.message) || String(e) };
        this._renderDialog();
      }
      return;
    }
    if (this._history !== request) return; // another period or room was asked meanwhile
    this._history = {
      ...request,
      data: {
        start: start.getTime(),
        end: end.getTime(),
        temp: HaPlooumClimateBandCard.downsample(data[room.tempEntity] || []),
        hum: HaPlooumClimateBandCard.downsample(data[room.humEntity] || []),
      },
    };
    this._renderDialog();
  }

  // { entity_id: [[time ms, value]...] } from the recorder's states.
  async _fetchHistory(ids, start, end) {
    if (!ids.length) return {};
    const res = await this.hass.callWS({
      type: 'history/history_during_period',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: ids,
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    });
    const out = {};
    for (const id of ids) {
      out[id] = (res[id] || [])
        .map((p) => [((p.lu !== undefined ? p.lu : p.lc) || 0) * 1000, parseFloat(p.s)])
        .filter(([t, v]) => Number.isFinite(v) && t > 0)
        .map(([t, v]) => [Math.max(t, start.getTime()), v]);
    }
    return out;
  }

  // { entity_id: [[time ms, value]...] } from the recorder's hourly means; the states when a sensor has
  // no statistics (no state_class).
  async _fetchStatistics(ids, start, end) {
    if (!ids.length) return {};
    const res = await this.hass.callWS({
      type: 'recorder/statistics_during_period',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      statistic_ids: ids,
      period: 'hour',
      types: ['mean'],
    });
    const out = {};
    const missing = [];
    for (const id of ids) {
      const rows = (res[id] || [])
        .map((p) => [typeof p.start === 'number' ? p.start : Date.parse(p.start), p.mean])
        .filter(([t, v]) => Number.isFinite(v) && Number.isFinite(t));
      if (rows.length) out[id] = rows;
      else missing.push(id);
    }
    if (missing.length) Object.assign(out, await this._fetchHistory(missing, start, end));
    return out;
  }

  // At most MAX_POINTS points: the mean of each slice of the series.
  static downsample(points) {
    if (points.length <= MAX_POINTS) return points;
    const out = [];
    const size = points.length / MAX_POINTS;
    for (let i = 0; i < MAX_POINTS; i++) {
      const slice = points.slice(Math.floor(i * size), Math.floor((i + 1) * size));
      if (!slice.length) continue;
      const t = slice.reduce((a, p) => a + p[0], 0) / slice.length;
      const v = slice.reduce((a, p) => a + p[1], 0) / slice.length;
      out.push([t, v]);
    }
    return out;
  }

  // Round tick values covering [min, max], at most `count` of them.
  static ticks(min, max, count = 4) {
    const span = max - min || 1;
    const step = [0.5, 1, 2, 5, 10, 20].find((s) => span / s <= count) || 50;
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 10) / 10);
    return out;
  }

  _timeLabel(t, period) {
    const locale = (this.hass.locale && this.hass.locale.language) || this.hass.language || undefined;
    const d = new Date(t);
    if (period.hours <= 24) return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    if (period.hours <= 24 * 7) return d.toLocaleDateString(locale, { weekday: 'short' });
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }

  _onChartMove(ev, geo) {
    const svgEl = ev.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * geo.width;
    const t = geo.tAt(x);
    if (t < geo.start || t > geo.end) return;
    this._history = { ...this._history, cursor: t };
    this._renderDialog();
  }

  _onChartLeave() {
    if (this._history.cursor === null) return;
    this._history = { ...this._history, cursor: null };
    this._renderDialog();
  }

  static valueAt(points, t) {
    let best = null;
    for (const p of points) {
      if (p[0] <= t) best = p;
      else break;
    }
    return best ? best[1] : null;
  }

  _chartTemplate(data, period, width) {
    const height = 190;
    const m = { left: 34, right: 36, top: 10, bottom: 20 };
    const plotW = width - m.left - m.right;
    const plotH = height - m.top - m.bottom;
    const span = data.end - data.start;
    const x = (t) => m.left + ((t - data.start) / span) * plotW;
    const threshold = Number(this._opt('threshold'));
    const hMin = Number(this._opt('humidity_min'));
    const hMax = Number(this._opt('humidity_max'));
    const yH = (h) => m.top + plotH - (Math.min(hMax, Math.max(hMin, h)) - hMin) / (hMax - hMin || 1) * plotH;

    const temps = data.temp.map((p) => p[1]);
    let tMin = temps.length ? Math.min(...temps) : 15;
    let tMax = temps.length ? Math.max(...temps) : 25;
    if (tMax - tMin < 2) {
      const mid = (tMin + tMax) / 2;
      tMin = mid - 1;
      tMax = mid + 1;
    }
    // Room above and below the curve, so it never runs along the time axis or the top edge.
    const pad = Math.max(0.3, (tMax - tMin) * 0.12);
    tMin -= pad;
    tMax += pad;
    const yT = (t) => m.top + plotH - ((t - tMin) / (tMax - tMin)) * plotH;

    // Each series is a step line: a value holds until the next one, and the last one until now.
    const steps = (points) => {
      if (!points.length) return [];
      const out = [];
      points.forEach((p, i) => {
        if (i) out.push([p[0], points[i - 1][1]]);
        out.push(p);
      });
      out.push([data.end, points[points.length - 1][1]]);
      return out;
    };
    const smooth = period.source === 'statistics';
    const line = (points, y) => (smooth ? [...points, [data.end, points[points.length - 1][1]]] : steps(points))
      .map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(' ');

    const humLine = data.hum.length ? line(data.hum, yH) : '';
    const humArea = humLine
      ? `${humLine} L${x(data.end).toFixed(1)} ${m.top + plotH} L${x(data.hum[0][0]).toFixed(1)} ${m.top + plotH}Z`
      : '';
    const tempLine = data.temp.length ? line(data.temp, yT) : '';
    // The temperature line takes the band's colors: a vertical gradient mapping each height to its color.
    const tempStops = [];
    for (let i = 0; i <= 10; i++) {
      const t = tMax - ((tMax - tMin) * i) / 10;
      tempStops.push(svg`<stop offset=${`${i * 10}%`} stop-color=${HaPlooumClimateBandCard.tempColor(t)}></stop>`);
    }
    const timeTicks = [];
    const stepH = period.hours <= 6 ? 1 : period.hours <= 24 ? 6 : 24 * Math.ceil(period.hours / 24 / 7);
    const first = new Date(data.start);
    if (period.hours <= 24) first.setMinutes(0, 0, 0);
    else first.setHours(0, 0, 0, 0);
    // Within a day, walk hour by hour and keep the round ones (every stepH hours); beyond, day by day.
    // Days are walked on the calendar, so a daylight saving change keeps the ticks at midnight.
    for (const d = first; d.getTime() <= data.end;) {
      const t = d.getTime();
      if (t >= data.start && (period.hours > 24 || d.getHours() % stepH === 0)) timeTicks.push(t);
      if (period.hours <= 24) d.setHours(d.getHours() + 1);
      else d.setDate(d.getDate() + stepH / 24);
    }
    const geo = {
      width,
      start: data.start,
      end: data.end,
      tAt: (px) => data.start + ((px - m.left) / plotW) * span,
    };
    const cursor = this._history.cursor;

    return html`
      <svg class="chart" width=${width} height=${height} viewBox="0 0 ${width} ${height}"
        @pointermove=${(e) => this._onChartMove(e, geo)} @pointerdown=${(e) => this._onChartMove(e, geo)}
        @pointerleave=${() => this._onChartLeave()}>
        <defs>
          <linearGradient id="depth" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#85B7EB" stop-opacity="0.5"></stop>
            <stop offset="1" stop-color="#185FA5" stop-opacity="0.9"></stop>
          </linearGradient>
          <linearGradient id="temp" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1=${m.top} y2=${m.top + plotH}>
            ${tempStops}
          </linearGradient>
        </defs>
        ${humArea ? svg`<path class="hum-area" d=${humArea} fill="url(#depth)"></path>
          <path class="hum-line" d=${humLine}></path>` : nothing}
        ${data.hum.length && threshold > hMin && threshold < hMax ? svg`
          <line class="threshold" x1=${m.left} x2=${m.left + plotW} y1=${yH(threshold)} y2=${yH(threshold)}></line>` : nothing}
        ${tempLine ? svg`<path class="temp-halo" d=${tempLine}></path>
          <path class="temp-line" d=${tempLine} stroke="url(#temp)"></path>` : nothing}
        ${data.temp.length ? HaPlooumClimateBandCard.ticks(tMin, tMax).map((v) => svg`
          <text class="axis temp-axis" x=${m.left - 5} y=${yT(v) + 4}>${v}°</text>`) : nothing}
        ${data.hum.length ? HaPlooumClimateBandCard.ticks(hMin, hMax, 3).map((v) => svg`
          <text class="axis hum-axis ${v > threshold ? 'alert' : ''}" x=${m.left + plotW + 5} y=${yH(v) + 4}>${v}%</text>`) : nothing}
        ${timeTicks.map((t) => svg`<text class="axis time-axis" x=${x(t)} y=${height - 4}>${this._timeLabel(t, period)}</text>`)}
        ${cursor !== null ? svg`<line class="cursor" x1=${x(cursor)} x2=${x(cursor)} y1=${m.top} y2=${m.top + plotH}></line>` : nothing}
      </svg>
      <div class="legend">
        ${data.temp.length ? html`<span><i class="swatch temp"></i>Temperature</span>` : nothing}
        ${data.hum.length ? html`<span><i class="swatch hum"></i>Humidity</span>` : nothing}
        ${data.hum.length ? html`<span><i class="swatch threshold"></i>Alert above ${threshold} %</span>` : nothing}
      </div>
    `;
  }

  _dialogTemplate() {
    const h = this._history;
    const room = this._rooms()[h.room];
    if (!room) return nothing;
    const period = PERIODS.find((p) => p.key === h.period);
    const threshold = Number(this._opt('threshold'));
    const width = Math.min(640, window.innerWidth - 32) - 32;
    const decimals = Number(this._opt('temp_decimals'));
    let temp = room.temp;
    let hum = room.hum;
    let when = '';
    if (h.cursor !== null && h.data) {
      temp = HaPlooumClimateBandCard.valueAt(h.data.temp, h.cursor);
      hum = HaPlooumClimateBandCard.valueAt(h.data.hum, h.cursor);
      const locale = (this.hass.locale && this.hass.locale.language) || this.hass.language || undefined;
      when = new Date(h.cursor).toLocaleString(locale, period.hours <= 24
        ? { hour: '2-digit', minute: '2-digit' }
        : { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    const empty = h.data && !h.data.temp.length && !h.data.hum.length;
    let body;
    if (h.error) body = html`<div class="info">Couldn't load the history: ${h.error}</div>`;
    else if (!h.data) body = html`<div class="info loading">Loading…</div>`;
    else if (empty) body = html`<div class="info">No history for this period.</div>`;
    else body = this._chartTemplate(h.data, period, width);
    return html`
      <div class="backdrop" @click=${() => this._closeHistory()}></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-label=${`${room.name} history`}>
        <div class="header">
          <div class="title">
            <div class="name">${room.name}</div>
            <div class="values">
              ${when ? html`<span class="when">${when}</span>` : nothing}
              <button class="value temp" title="Open the temperature sensor" @click=${() => this._moreInfo(room.tempEntity)}>
                ${temp === null ? '—' : `${temp.toFixed(decimals)}°`}
              </button>
              ${room.humEntity ? html`
                <button class="value hum ${hum !== null && hum > threshold ? 'alert' : ''}" title="Open the humidity sensor"
                  @click=${() => this._moreInfo(room.humEntity)}>
                  ${hum === null ? '—' : `${Math.round(hum)} %`}
                </button>` : nothing}
            </div>
          </div>
          <button class="close" aria-label="Close" @click=${() => this._closeHistory()}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        <div class="periods" role="tablist">
          ${PERIODS.map((p) => html`
            <button role="tab" data-period=${p.key} aria-selected=${p.key === h.period ? 'true' : 'false'}
              class=${p.key === h.period ? 'active' : ''} @click=${() => this._setPeriod(p.key)}>${p.label}</button>`)}
        </div>
        <div class="body" style=${`min-height: 214px`}>${body}</div>
      </div>
    `;
  }

  // The water table: a smooth curve through each room's level, flat at both ends, closed at the bottom.
  static waterPath(levels, roomWidth, height) {
    const pts = levels.map((y, i) => [(i + 0.5) * roomWidth, y]);
    const width = roomWidth * levels.length;
    let d = `M0 ${pts[0][1]} L${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
    }
    return `${d} L${width} ${pts[pts.length - 1][1]} L${width} ${height} L0 ${height}Z`;
  }

  _renderLine(rooms, index, roomWidth, stacked) {
    const height = stacked ? STACKED_HEIGHT : ONE_LINE_HEIGHT;
    const width = roomWidth * rooms.length;
    const hMin = Number(this._opt('humidity_min'));
    const hMax = Number(this._opt('humidity_max'));
    const threshold = Number(this._opt('threshold'));
    const level = (h) => {
      if (h === null) return height;
      const ratio = Math.min(1, Math.max(0, (h - hMin) / (hMax - hMin || 1)));
      return height - ratio * height;
    };
    const n = rooms.length;
    const radius = Math.min(22, height / 2);
    const ids = { temp: `t${index}`, depth: `d${index}`, clip: `c${index}` };
    const hasWater = rooms.some((r) => r.hum !== null);
    // Temperature row (upper part) and humidity row (lower part) of each room, as tap targets.
    const split = stacked ? 34 : 24;

    return html`
      <svg class="line" width=${width} height=${height} viewBox="0 0 ${width} ${height}" role="img"
        aria-label=${rooms.map((r) => `${r.name} ${r.tempText} ${r.humText}`).join(', ')}>
        <defs>
          <linearGradient id=${ids.temp} x1="0" x2="1">
            ${rooms.map((r, i) => svg`<stop offset=${`${((i + 0.5) / n) * 100}%`} stop-color=${HaPlooumClimateBandCard.tempColor(r.temp)} stop-opacity="0.75"></stop>`)}
          </linearGradient>
          <linearGradient id=${ids.depth} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#85B7EB" stop-opacity="0.3"></stop>
            <stop offset="1" stop-color="#042C53" stop-opacity="0.85"></stop>
          </linearGradient>
          <clipPath id=${ids.clip}><rect width=${width} height=${height} rx=${radius}></rect></clipPath>
        </defs>
        <g clip-path="url(#${ids.clip})">
          <rect width=${width} height=${height} fill="url(#${ids.temp})"></rect>
          ${hasWater
            ? svg`<path class="water" d=${HaPlooumClimateBandCard.waterPath(rooms.map((r) => level(r.hum)), roomWidth, height)} fill="url(#${ids.depth})"></path>`
            : nothing}
        </g>
        ${rooms.map((r, i) => {
          const x = (i + 0.5) * roomWidth;
          const alert = r.hum !== null && r.hum > threshold;
          const humClass = `hum${alert ? ' alert' : ''}`;
          const labels = stacked
            ? svg`
                <text class="name" x=${x} y="15">${r.name}</text>
                <text class="temp big" x=${x} y="31">${r.tempText}</text>
                <text class=${humClass} x=${x} y="46">${r.humText}</text>`
            : svg`
                <text class="temp" x=${x} y="19">${r.name} ${r.tempText}</text>
                <text class=${humClass} x=${x} y="34">${r.humText}</text>`;
          return svg`
            <g class="room">
              ${labels}
              <rect class="hit" data-kind="temperature" data-room=${r.name} x=${i * roomWidth} y="0" width=${roomWidth} height=${split}
                @click=${(e) => this._openHistory(e, r.index)}></rect>
              <rect class="hit" data-kind="humidity" data-room=${r.name} x=${i * roomWidth} y=${split} width=${roomWidth} height=${height - split}
                @click=${(e) => this._openHistory(e, r.index)}></rect>
            </g>`;
        })}
      </svg>
    `;
  }

  render() {
    if (!this.config || !this.hass) return nothing;
    const rooms = this._rooms();
    if (!rooms.length) {
      return html`<ha-card class="empty">Add rooms to the climate band.</ha-card>`;
    }
    const { lines, roomWidth, stacked } = HaPlooumClimateBandCard.layout(
      rooms.length, this._width || 0, Number(this._opt('min_room_width')));
    let start = 0;
    const pulse = this._opt('pulse') !== false;
    return html`
      <ha-card class=${pulse ? 'pulse' : ''}>
        <div class="lines" style=${`gap: ${LINE_GAP}px`}>
          ${lines.map((count, index) => {
            const slice = rooms.slice(start, start + count);
            start += count;
            return this._renderLine(slice, index, roomWidth, stacked);
          })}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      ha-card {
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      ha-card.empty {
        padding: 12px;
        color: var(--secondary-text-color);
      }
      .lines {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      svg.line {
        display: block;
        overflow: visible;
      }
      text {
        text-anchor: middle;
        font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, sans-serif));
        pointer-events: none;
      }
      .temp,
      .name {
        fill: #fff;
        font-size: 12px;
      }
      .name {
        fill: #ddd;
        font-size: 11px;
      }
      .temp.big {
        font-size: 13px;
      }
      .hum {
        fill: #e6f1fb;
        font-size: 11px;
      }
      .hum.alert {
        fill: #f09595;
        font-weight: 500;
      }
      .pulse .hum.alert {
        animation: humidity-alert 2.4s ease-in-out infinite;
      }
      @keyframes humidity-alert {
        0%,
        100% {
          fill: #e6f1fb;
        }
        50% {
          fill: #f09595;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .pulse .hum.alert {
          animation: none;
        }
      }
      .hit {
        fill: transparent;
        cursor: pointer;
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
    width: min(640px, calc(100vw - 32px));
    box-sizing: border-box;
    padding: 16px;
    border-radius: 24px;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    color: var(--primary-text-color, #212121);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
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
  .values {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-top: 2px;
  }
  .when {
    font-size: 13px;
    color: var(--secondary-text-color, #727272);
  }
  .value {
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 16px;
    cursor: pointer;
  }
  .value.hum {
    color: #378add;
  }
  .value.hum.alert {
    color: #e24b4a;
    font-weight: 500;
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
  .periods {
    display: inline-flex;
    margin: 12px 0 8px;
    padding: 2px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
  }
  .periods button {
    padding: 4px 12px;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--secondary-text-color, #727272);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .periods button.active {
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }
  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    align-self: flex-start;
    margin-top: 6px;
    font-size: 12px;
    color: var(--secondary-text-color, #727272);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .swatch {
    display: inline-block;
    width: 14px;
  }
  .swatch.temp {
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, #85b7eb, #9fe1cb, #ef9f27, #d85a30);
  }
  .swatch.hum {
    height: 10px;
    border-radius: 2px;
    background: linear-gradient(180deg, rgba(133, 183, 235, 0.6), rgba(24, 95, 165, 0.95));
  }
  .swatch.threshold {
    height: 0;
    border-top: 2px dashed #e24b4a;
  }
  .info {
    color: var(--secondary-text-color, #727272);
    font-size: 14px;
  }
  svg.chart {
    display: block;
    touch-action: pan-y;
  }
  .hum-line {
    fill: none;
    stroke: #85b7eb;
    stroke-width: 1.5;
  }
  .threshold {
    stroke: #e24b4a;
    stroke-dasharray: 3 4;
    stroke-opacity: 0.8;
  }
  .temp-halo {
    fill: none;
    stroke: var(--ha-card-background, var(--card-background-color, #fff));
    stroke-width: 6;
    stroke-linejoin: round;
  }
  .temp-line {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
  }
  .axis {
    font-size: 11px;
    fill: var(--secondary-text-color, #727272);
  }
  .temp-axis {
    text-anchor: end;
    fill: #ef9f27;
  }
  .hum-axis {
    text-anchor: start;
    fill: #378add;
  }
  .hum-axis.alert {
    fill: #e24b4a;
  }
  .time-axis {
    text-anchor: middle;
  }
  .cursor {
    stroke: var(--secondary-text-color, #727272);
    stroke-width: 1;
  }
`;

/* ==========================================================================
   EDITOR : ha-plooum-climate-band-card-editor
   ========================================================================== */
const SCHEMA = [
  {
    type: 'grid', name: '', schema: [
      { name: 'threshold', selector: { number: { min: 0, max: 100, unit_of_measurement: '%', mode: 'box' } } },
      { name: 'pulse', selector: { boolean: {} } },
    ],
  },
  {
    type: 'expandable', name: '', title: 'Layout and scale', icon: 'mdi:tune', schema: [
      {
        type: 'grid', name: '', schema: [
          { name: 'humidity_min', selector: { number: { min: 0, max: 100, unit_of_measurement: '%', mode: 'box' } } },
          { name: 'humidity_max', selector: { number: { min: 0, max: 100, unit_of_measurement: '%', mode: 'box' } } },
          { name: 'min_room_width', selector: { number: { min: 30, max: 300, unit_of_measurement: 'px', mode: 'box' } } },
          { name: 'temp_decimals', selector: { number: { min: 0, max: 2, mode: 'box' } } },
        ],
      },
    ],
  },
];

const ROOM_SCHEMA = [
  { name: 'name', selector: { text: {} } },
  {
    type: 'grid', name: '', schema: [
      { name: 'temperature', selector: { entity: { domain: ['sensor', 'input_number'] } } },
      { name: 'humidity', selector: { entity: { domain: ['sensor', 'input_number'] } } },
    ],
  },
];

const LABELS = {
  threshold: `Humidity alert above (${DEFAULTS.threshold} %)`,
  pulse: 'Pulse the humidity alert',
  humidity_min: `Empty band at (${DEFAULTS.humidity_min} %)`,
  humidity_max: `Full band at (${DEFAULTS.humidity_max} %)`,
  min_room_width: `Two lines below, per room (${DEFAULTS.min_room_width} px)`,
  temp_decimals: `Temperature decimals (${DEFAULTS.temp_decimals})`,
  name: 'Name (default: the sensor name)',
  temperature: 'Temperature sensor',
  humidity: 'Humidity sensor (optional)',
};

class HaPlooumClimateBandCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _emit(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }

  static clean(obj) {
    const out = { ...obj };
    for (const key of Object.keys(out)) {
      if (out[key] === '' || out[key] === undefined || out[key] === null) delete out[key];
    }
    return out;
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    const rooms = this._config.rooms;
    const config = HaPlooumClimateBandCardEditor.clean({ ...ev.detail.value });
    if (rooms) config.rooms = rooms;
    this._emit(config);
  }

  _rooms() {
    return (this._config.rooms || []).map((r) => (typeof r === 'string' ? { temperature: r } : { ...r }));
  }

  _roomChanged(ev, index) {
    ev.stopPropagation();
    const rooms = this._rooms();
    rooms[index] = HaPlooumClimateBandCardEditor.clean(ev.detail.value);
    this._emit({ ...this._config, rooms });
  }

  _moveRoom(index, delta) {
    const rooms = this._rooms();
    const to = index + delta;
    if (to < 0 || to >= rooms.length) return;
    [rooms[index], rooms[to]] = [rooms[to], rooms[index]];
    this._emit({ ...this._config, rooms });
  }

  _removeRoom(index) {
    const rooms = this._rooms();
    rooms.splice(index, 1);
    this._emit({ ...this._config, rooms });
  }

  _addRoom() {
    this._emit({ ...this._config, rooms: [...this._rooms(), {}] });
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const { rooms: _rooms, ...options } = this._config;
    const rooms = this._rooms();
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${options}
        .schema=${SCHEMA}
        .computeLabel=${(s) => LABELS[s.name] || s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="rooms-title">Rooms, from left to right</div>
      ${rooms.map((room, index) => html`
        <div class="room">
          <div class="room-head">
            <span>${room.name || room.temperature || `Room ${index + 1}`}</span>
            <span class="tools">
              <ha-icon-button .path=${'M7,15L12,10L17,15H7Z'} label="Move up" ?disabled=${index === 0}
                @click=${() => this._moveRoom(index, -1)}></ha-icon-button>
              <ha-icon-button .path=${'M7,10L12,15L17,10H7Z'} label="Move down" ?disabled=${index === rooms.length - 1}
                @click=${() => this._moveRoom(index, 1)}></ha-icon-button>
              <ha-icon-button .path=${'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z'} label="Remove"
                @click=${() => this._removeRoom(index)}></ha-icon-button>
            </span>
          </div>
          <ha-form
            .hass=${this.hass}
            .data=${room}
            .schema=${ROOM_SCHEMA}
            .computeLabel=${(s) => LABELS[s.name] || s.name}
            @value-changed=${(ev) => this._roomChanged(ev, index)}
          ></ha-form>
        </div>
      `)}
      <button class="add" @click=${this._addRoom}>+ Add a room</button>
      <div class="hint">A tap on a room opens its temperature and humidity history.</div>
    `;
  }

  static get styles() {
    return css`
      .rooms-title {
        margin: 16px 0 8px;
        font-weight: 500;
      }
      .room {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 4px 8px 8px;
        margin-bottom: 8px;
      }
      .room-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .tools {
        display: flex;
        --mdc-icon-button-size: 36px;
      }
      .add {
        width: 100%;
        padding: 8px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-color);
        cursor: pointer;
        font: inherit;
      }
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
if (!customElements.get('ha-plooum-climate-band-card')) {
  customElements.define('ha-plooum-climate-band-card', HaPlooumClimateBandCard);
}
if (!customElements.get('ha-plooum-climate-band-card-editor')) {
  customElements.define('ha-plooum-climate-band-card-editor', HaPlooumClimateBandCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-climate-band-card')) {
  window.customCards.push({
    type: 'ha-plooum-climate-band-card',
    name: 'Ha Plooum Climate Band Card',
    description: 'Every room\'s temperature and humidity in one band: its color follows the temperature, a water table rises with the humidity, and a humidity above the threshold pulses in red.',
    preview: true,
  });
}
