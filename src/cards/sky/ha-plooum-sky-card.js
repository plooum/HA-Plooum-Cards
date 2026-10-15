import { LitElement, html, css, nothing, svg } from "lit";
import * as Astronomy from "astronomy-engine";
import { STARS, CONSTELLATION_LINES, CONSTELLATION_NAMES } from "./sky-data.js";

const CARD_VERSION = '1.0.0';

const MAX_OFFSET = 360; // minutes
const TIME_CONTROL_OPTIONS = [
  { value: 'rotate', label: 'Rotate (drag the sky sideways)' },
];

// Dome geometry, in viewBox units: the horizon is a circle of radius R around the zenith.
const SIZE = 400;
const C = SIZE / 2;
const R = 182;

const PLANETS = [
  { name: 'Mercury', color: '#bdbdbd' },
  { name: 'Venus', color: '#fff3c4' },
  { name: 'Mars', color: '#ff6a4d' },
  { name: 'Jupiter', color: '#f2d9a8' },
  { name: 'Saturn', color: '#e8cf8a' },
];

// Sky colors (zenith, horizon) by altitude of the Sun, interpolated between the keys.
const SKY_COLORS = [
  [6, [63, 134, 214], [165, 211, 245]],
  [0, [74, 120, 192], [242, 178, 122]],
  [-6, [36, 58, 115], [182, 106, 122]],
  [-12, [16, 27, 69], [74, 63, 120]],
  [-18, [6, 9, 20], [26, 34, 80]],
  [-24, [3, 5, 13], [11, 16, 48]],
];

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function skyColors(sunAlt) {
  const last = SKY_COLORS.length - 1;
  if (sunAlt >= SKY_COLORS[0][0]) return [SKY_COLORS[0][1], SKY_COLORS[0][2]];
  if (sunAlt <= SKY_COLORS[last][0]) return [SKY_COLORS[last][1], SKY_COLORS[last][2]];
  let i = 0;
  while (sunAlt < SKY_COLORS[i + 1][0]) i++;
  const [a0, z0, h0] = SKY_COLORS[i];
  const [a1, z1, h1] = SKY_COLORS[i + 1];
  const t = (a0 - sunAlt) / (a0 - a1);
  const mix = (p, q) => `rgb(${p.map((v, k) => Math.round(v + (q[k] - v) * t)).join(',')})`;
  return [mix(z0, z1), mix(h0, h1)];
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pad2 = (n) => String(n).padStart(2, '0');

/* ==========================================================================
   MAIN CARD : ha-plooum-sky-card
   ========================================================================== */
class HaPlooumSkyCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _now: { state: true },
      _offset: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-sky-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  // The sky above (lat, lon) in degrees at a date. alt / az are in degrees, az from the north
  // towards the east. `stars` follows the order of STARS in sky-data.js (below-horizon ones
  // included). With `withConstellations`, `constellations` holds the lines (runs of points
  // above the horizon) and the name positions.
  static skyAt(date, lat, lon, withConstellations = false) {
    const time = Astronomy.MakeTime(date);
    const observer = new Astronomy.Observer(lat, lon, 0);
    const lst = (Astronomy.SiderealTime(time) * 15 + lon) * RAD; // local sidereal time
    const sinLat = Math.sin(lat * RAD);
    const cosLat = Math.cos(lat * RAD);
    const eqjToDate = Astronomy.Rotation_EQJ_EQD(time);

    // Of-date equatorial coordinates (radians) to horizontal ones (degrees).
    const horizontal = (ra, dec) => {
      const ha = lst - ra;
      const sinDec = Math.sin(dec);
      const cosDec = Math.cos(dec);
      const alt = Math.asin(clamp(sinDec * sinLat + cosDec * cosLat * Math.cos(ha), -1, 1)) * DEG;
      const az = Math.atan2(-Math.sin(ha) * cosDec, sinDec * cosLat - cosDec * sinLat * Math.cos(ha)) * DEG;
      return { alt, az: (az + 360) % 360 };
    };
    // J2000 equatorial coordinates (degrees), precessed to the date.
    const fromJ2000 = (raDeg, decDeg) => {
      const cd = Math.cos(decDeg * RAD);
      const v = Astronomy.RotateVector(
        eqjToDate,
        new Astronomy.Vector(cd * Math.cos(raDeg * RAD), cd * Math.sin(raDeg * RAD), Math.sin(decDeg * RAD), time),
      );
      return horizontal(Math.atan2(v.y, v.x), Math.asin(clamp(v.z, -1, 1)));
    };
    const body = (name) => {
      const eq = Astronomy.Equator(name, time, observer, true, true);
      return horizontal(eq.ra * 15 * RAD, eq.dec * RAD);
    };

    const sun = body('Sun');
    const moon = body('Moon');
    const sky = {
      sunAlt: sun.alt,
      sun,
      moon: { ...moon, phase: Astronomy.MoonPhase(time) },
      planets: PLANETS.map(({ name }) => ({ name, ...body(name) })),
      stars: STARS.map(([ra, dec, mag]) => ({ ...fromJ2000(ra, dec), mag })),
    };
    if (withConstellations) {
      const lines = [];
      for (const poly of CONSTELLATION_LINES) {
        let run = [];
        for (const [ra, dec] of poly) {
          const p = fromJ2000(ra, dec);
          if (p.alt > 0) {
            run.push(p);
          } else {
            if (run.length > 1) lines.push(run);
            run = [];
          }
        }
        if (run.length > 1) lines.push(run);
      }
      sky.constellations = {
        lines,
        names: CONSTELLATION_NAMES.map(([name, ra, dec]) => ({ name, ...fromJ2000(ra, dec) })),
      };
    }
    return sky;
  }

  constructor() {
    super();
    this._now = new Date();
    this._offset = 0;
    this._drag = null;
    this._lastTap = 0;
  }

  setConfig(config) {
    this.config = { time_control: 'rotate', show_constellations: true, ...(config || {}) };
  }

  getCardSize() {
    return 6;
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-SKY-CARD %c ${CARD_VERSION} `,
      'color: white; background: #3f51b5; font-weight: 700;',
      'color: #3f51b5; background: white; font-weight: 700;'
    );
    this._now = new Date();
    clearInterval(this._timer);
    this._timer = setInterval(() => { this._now = new Date(); }, 60000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
    this._timer = null;
  }

  // hass changes on every state change in Home Assistant: only redraw the sky when the
  // effective position differs from the one of the last render.
  shouldUpdate(changed) {
    if (changed.size === 1 && changed.has('hass') && this._lastPos && this.config) {
      const { lat, lon } = this._position();
      return lat !== this._lastPos.lat || lon !== this._lastPos.lon;
    }
    return true;
  }

  _position() {
    const num = (v, fallback) => (typeof v === 'number' && isFinite(v) ? v : fallback);
    return {
      lat: clamp(num(this.config.latitude, num(this.hass?.config?.latitude, 0)), -90, 90),
      lon: num(this.config.longitude, num(this.hass?.config?.longitude, 0)),
    };
  }

  // Stereographic projection centered on the zenith: the horizon is the circle of radius R,
  // north is up and east on the left (we look up). Works below the horizon too (alt > -90).
  _xy(alt, az) {
    const r = R * Math.tan((90 - alt) * RAD / 2);
    return [C - r * Math.sin(az * RAD), C - r * Math.cos(az * RAD)];
  }

  _setOffset(minutes) {
    this._offset = clamp(Math.round(minutes), -MAX_OFFSET, MAX_OFFSET);
  }

  _onDown(ev) {
    if (ev.button !== undefined && ev.button !== 0) return;
    const rect = ev.currentTarget.getBoundingClientRect();
    this._drag = {
      x: ev.clientX,
      offset: this._offset,
      // The whole width of the dome is 6 hours.
      domePx: Math.max(1, rect.width * (2 * R) / SIZE),
      moved: false,
    };
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic pointer */ }
  }

  _onMove(ev) {
    const d = this._drag;
    if (!d) return;
    const dx = ev.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    if (d.moved) this._setOffset(d.offset + dx / d.domePx * 360);
  }

  _onUp() {
    const d = this._drag;
    this._drag = null;
    if (!d || d.moved) return;
    // A tap: two in a row put the time back to now (touch screens send no reliable dblclick).
    const t = Date.now();
    if (t - this._lastTap < 350) this._offset = 0;
    this._lastTap = t;
  }

  _offsetText() {
    const o = this._offset;
    return `${o < 0 ? '-' : '+'}${Math.floor(Math.abs(o) / 60)} h ${pad2(Math.abs(o) % 60)}`;
  }

  _moon(sky, opacity) {
    const { alt, az, phase } = sky.moon;
    if (alt <= 0) return nothing;
    const [x, y] = this._xy(alt, az);
    // The lit side faces the Sun, as seen on the dome.
    const [sx, sy] = this._xy(sky.sun.alt, sky.sun.az);
    const angle = Math.atan2(sy - y, sx - x) * DEG;
    const r = 9;
    const k = Math.abs(Math.cos(phase * RAD)) * r;
    const crescent = Math.cos(phase * RAD) > 0;
    const lit = `M0,${-r} A${r},${r} 0 0 1 0,${r} A${k},${r} 0 0 ${crescent ? 0 : 1} 0,${-r} Z`;
    return svg`<g class="moon" transform="translate(${x} ${y})">
      <circle r=${r + 5} fill="#fff" opacity=${0.12 * opacity + 0.05}></circle>
      <circle r=${r} fill="#2b3040" stroke="#8a90a0" stroke-width="0.6"></circle>
      <path d=${lit} fill="#f6f2dc" transform="rotate(${angle})"></path>
      <text y=${r + 11} class="label">Moon</text>
    </g>`;
  }

  render() {
    if (!this.config) return nothing;
    const { lat, lon } = this._position();
    this._lastPos = { lat, lon };
    const when = new Date(this._now.getTime() + this._offset * 60000);
    const withConstellations = this.config.show_constellations !== false;
    const sky = HaPlooumSkyCard.skyAt(when, lat, lon, withConstellations);
    const [zenithColor, horizonColor] = skyColors(sky.sunAlt);
    // Stars and constellations fade out as the sky brightens.
    const dark = clamp((-sky.sunAlt - 3) / 15, 0, 1);
    const pt = (p) => this._xy(p.alt, p.az).map((v) => v.toFixed(1)).join(',');

    return html`
      <ha-card>
        ${this.config.title ? html`<div class="title">${this.config.title}</div>` : nothing}
        <svg class="sky" viewBox="0 0 ${SIZE} ${SIZE}"
          @pointerdown=${this._onDown} @pointermove=${this._onMove}
          @pointerup=${this._onUp} @pointercancel=${() => { this._drag = null; }}
          @dblclick=${() => { this._offset = 0; }}>
          <defs>
            <radialGradient id="bg">
              <stop offset="0" stop-color=${zenithColor}></stop>
              <stop offset="1" stop-color=${horizonColor}></stop>
            </radialGradient>
            <clipPath id="dome"><circle cx=${C} cy=${C} r=${R}></circle></clipPath>
          </defs>
          <circle cx=${C} cy=${C} r=${R} fill="url(#bg)"></circle>
          <g clip-path="url(#dome)">
            ${svg`
              ${withConstellations ? svg`<g class="constellations" opacity=${0.45 * dark}>
                ${sky.constellations.lines.map((run) => svg`<polyline points=${run.map(pt).join(' ')}></polyline>`)}
              </g>
              <g class="names" opacity=${0.6 * dark}>
                ${sky.constellations.names.filter((n) => n.alt > 5).map((n) => {
                  const [x, y] = this._xy(n.alt, n.az);
                  return svg`<text x=${x} y=${y}>${n.name}</text>`;
                })}
              </g>` : nothing}
              <g class="stars" opacity=${dark}>
                ${sky.stars.filter((s) => s.alt > 0).map((s) => {
                  const [x, y] = this._xy(s.alt, s.az);
                  return svg`<circle cx=${x.toFixed(1)} cy=${y.toFixed(1)} r=${Math.max(0.6, 0.6 + (4.6 - s.mag) * 0.5).toFixed(2)}></circle>`;
                })}
              </g>`}
            ${sky.planets.filter((p) => p.alt > 0).map((p) => {
              const [x, y] = this._xy(p.alt, p.az);
              const color = PLANETS.find((d) => d.name === p.name).color;
              return svg`<g class="planet" transform="translate(${x} ${y})">
                <circle r="3" fill=${color}></circle>
                <text y="-7" class="label">${p.name}</text>
              </g>`;
            })}
            ${this._moon(sky, dark)}
            ${sky.sun.alt > 0 ? (() => {
              const [x, y] = this._xy(sky.sun.alt, sky.sun.az);
              return svg`<g class="sun" transform="translate(${x} ${y})">
                <circle r="16" fill="#ffd54f" opacity="0.3"></circle>
                <circle r="9" fill="#fff3b0"></circle>
              </g>`;
            })() : nothing}
          </g>
          <circle cx=${C} cy=${C} r=${R} fill="none" stroke="var(--divider-color, #888)" stroke-width="1.5"></circle>
          <text class="cardinal" x=${C} y="14">N</text>
          <text class="cardinal" x="9" y=${C + 5}>E</text>
          <text class="cardinal" x=${C} y=${SIZE - 5}>S</text>
          <text class="cardinal" x=${SIZE - 9} y=${C + 5}>W</text>
        </svg>
        <div class="info">
          <span class="time">${pad2(when.getHours())}:${pad2(when.getMinutes())}</span>
          ${this._offset !== 0 ? html`<span class="offset">${this._offsetText()}</span>` : nothing}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        padding: 12px;
      }
      .title {
        text-align: center;
        font-size: 1.1em;
        font-weight: 500;
        padding-bottom: 8px;
      }
      svg.sky {
        display: block;
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
        cursor: ew-resize;
      }
      .stars circle { fill: #fff; }
      .constellations polyline {
        fill: none;
        stroke: #9fb4ff;
        stroke-width: 0.7;
      }
      .names text {
        fill: #cfd8ff;
        font-size: 8px;
        text-anchor: middle;
        pointer-events: none;
      }
      .label {
        fill: #fff;
        font-size: 9px;
        text-anchor: middle;
        paint-order: stroke;
        stroke: rgba(0, 0, 0, 0.45);
        stroke-width: 2px;
        pointer-events: none;
      }
      .cardinal {
        fill: var(--primary-text-color);
        font-size: 13px;
        font-weight: 600;
        text-anchor: middle;
        pointer-events: none;
      }
      .info {
        display: flex;
        justify-content: center;
        gap: 12px;
        padding-top: 8px;
        font-variant-numeric: tabular-nums;
        font-size: 1.1em;
        color: var(--secondary-text-color);
      }
      .info .offset {
        color: var(--primary-color);
      }
    `;
  }
}

/* ==========================================================================
   EDITOR : ha-plooum-sky-card-editor
   ========================================================================== */
const SCHEMA = [
  { name: 'title', selector: { text: {} } },
  { name: 'latitude', selector: { number: { mode: 'box', min: -90, max: 90, step: 'any' } } },
  { name: 'longitude', selector: { number: { mode: 'box', min: -180, max: 180, step: 'any' } } },
  { name: 'time_control', selector: { select: { mode: 'dropdown', options: TIME_CONTROL_OPTIONS } } },
  { name: 'show_constellations', selector: { boolean: {} } },
];
const LABELS = {
  title: 'Title',
  latitude: 'Latitude (degrees)',
  longitude: 'Longitude (degrees)',
  time_control: 'Time control',
  show_constellations: 'Show the constellations',
};

class HaPlooumSkyCardEditor extends LitElement {
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
      const v = config[key];
      if (v === '' || v === undefined || (typeof v === 'number' && isNaN(v))) delete config[key];
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
    const data = { time_control: 'rotate', show_constellations: true, ...this._config };
    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${SCHEMA}
          .computeLabel=${(s) => LABELS[s.name] || s.name}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="hint">Leave the latitude and longitude empty to use the Home Assistant location. Drag the sky sideways to move the time by up to 6 hours, double-tap to come back to now.</div>
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
if (!customElements.get("ha-plooum-sky-card")) {
  customElements.define("ha-plooum-sky-card", HaPlooumSkyCard);
}
if (!customElements.get("ha-plooum-sky-card-editor")) {
  customElements.define("ha-plooum-sky-card-editor", HaPlooumSkyCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === "ha-plooum-sky-card")) {
  window.customCards.push({
    type: "ha-plooum-sky-card",
    name: "Ha Plooum Sky Card",
    description: "The sky above the house as a dome: stars, constellations, planets, Moon and Sun, with a time you can scrub by ±6 h.",
    preview: true,
  });
}
