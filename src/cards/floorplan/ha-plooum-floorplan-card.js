import { LitElement, html, css, svg, nothing } from 'lit';

const CARD_VERSION = '1.0.0';

const UNAVAILABLE_STATES = ['unavailable', 'unknown'];
const HOLD_DELAY = 500; // ms before a press on an entity opens its more-info dialog
const COVER_PENDING_MS = 5000; // how long a dragged cover position is shown while waiting for the state
const WINDOW_LENGTH = 1.5; // default window length on a wall (grid units)
const WALL_SNAP = 0.75; // max distance for a cover to snap onto a wall in the editor (grid units)
const ON_WALL_EPS = 0.05; // tolerance to consider a point lies on a wall (grid units)
const ROOM_SNAP = 0.5; // room corners snap to this step (grid units)
const ENTITY_SNAP = 0.25; // entity positions snap to this step (grid units)
const EDGE_DRAW_ZONE = 0.3; // in the editor, a drag starting this close to a wall draws a room (grid units)
const PALETTE_LIMIT = 80; // max entities listed at once in the editor palette
const CARD_PADDING = 12; // px, inside ha-card around the plan
const ZOOM_MARGIN = 0.5; // space kept around a zoomed room, so its walls and windows stay visible (grid units)
const ZOOM_MAX = 2.5; // max zoom on a room
const ZOOM_MAX_HEIGHT = 1.2; // the plan can grow up to this ratio of its width while zoomed
const ZOOM_ITEM_GROWTH = 1.3; // markers and labels grow at most this much while zoomed

const DEFAULT_LIGHT_RGB = [255, 196, 107];
// Floor color scale, from temp_min (0) to temp_max (1).
const TEMP_STOPS = [
  [0, [91, 141, 239]],
  [0.35, [73, 193, 179]],
  [0.65, [242, 177, 74]],
  [1, [239, 90, 60]],
];

const TOGGLE_DOMAINS = ['light', 'switch', 'fan', 'input_boolean', 'automation', 'siren', 'humidifier'];
const RUN_SERVICES = {
  scene: 'turn_on',
  script: 'turn_on',
  button: 'press',
  input_button: 'press',
};
const OPENING_CLASSES = ['door', 'window', 'garage_door', 'opening'];
const PRESENCE_CLASSES = ['motion', 'occupancy', 'presence'];
// Domains offered by the editor's "Suggested" filter and used by "Generate from my areas".
const SUGGESTED_DOMAINS = [
  'light', 'switch', 'fan', 'cover', 'climate', 'media_player', 'lock', 'vacuum', 'input_boolean',
  'humidifier', 'water_heater', 'valve', 'siren', 'scene', 'script', 'button', 'camera',
];

const PALETTE_FILTERS = [
  { id: 'suggested', label: 'Suggested' },
  { id: 'lights', label: 'Lights' },
  { id: 'covers', label: 'Covers' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'switches', label: 'Switches' },
  { id: 'all', label: 'All' },
];

// -------------------------------------------------------------------------
// Pure helpers (shared by the card and its editor)
// -------------------------------------------------------------------------

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const snap = (v, step) => Math.round(v / step) * step;
const round2 = (v) => Math.round(v * 100) / 100;
const num = (v, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};
const rgba = (c, a = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
const domainOf = (entityId) => (entityId || '').split('.')[0];

function isUnavailable(st) {
  return !st || UNAVAILABLE_STATES.includes(st.state);
}

function isActive(st) {
  if (isUnavailable(st)) return false;
  switch (domainOf(st.entity_id)) {
    case 'cover':
      return st.state !== 'closed';
    case 'lock':
      return st.state !== 'locked';
    case 'media_player':
      return !['off', 'idle', 'standby'].includes(st.state);
    case 'climate':
    case 'water_heater':
      return st.state !== 'off';
    case 'vacuum':
      return ['cleaning', 'returning'].includes(st.state);
    case 'valve':
      return st.state === 'open';
    default:
      return st.state === 'on';
  }
}

// Role of an entity on the plan, guessed from its domain and device class.
function entityRole(entityId, st) {
  const domain = domainOf(entityId);
  const dc = st && st.attributes.device_class;
  if (domain === 'light') return 'light';
  if (domain === 'cover') return 'cover';
  if (domain === 'sensor' && dc === 'temperature') return 'temperature';
  if (domain === 'sensor' && dc === 'humidity') return 'humidity';
  if (domain === 'sensor') return 'sensor';
  if (domain === 'binary_sensor' && OPENING_CLASSES.includes(dc)) return 'opening';
  if (domain === 'binary_sensor' && PRESENCE_CLASSES.includes(dc)) return 'presence';
  return 'device';
}

function lightRgb(st) {
  const a = (st && st.attributes) || {};
  if (Array.isArray(a.rgb_color)) return a.rgb_color;
  if (a.color_temp_kelvin) return a.color_temp_kelvin < 3500 ? [255, 180, 92] : [255, 236, 210];
  return DEFAULT_LIGHT_RGB;
}

function tempRgb(value, min, max) {
  const t = clamp((value - min) / (max - min || 1), 0, 1);
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    const [p1, c1] = TEMP_STOPS[i];
    const [p0, c0] = TEMP_STOPS[i - 1];
    if (t <= p1) {
      const k = (t - p0) / (p1 - p0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    }
  }
  return TEMP_STOPS[TEMP_STOPS.length - 1][1];
}

function coverPosition(st) {
  const p = st.attributes.current_position;
  if (typeof p === 'number') return p;
  return st.state === 'closed' ? 0 : 100;
}

function supportsSetPosition(st) {
  return ((st.attributes.supported_features || 0) & 4) !== 0;
}

function friendlyName(hass, entityId) {
  const st = hass.states[entityId];
  return (st && st.attributes.friendly_name) || entityId;
}

function formatState(hass, st) {
  return hass.formatEntityState ? hass.formatEntityState(st) : st.state;
}

function normalizeRoom(r, index) {
  return {
    index,
    name: r.name || '',
    icon: r.icon || '',
    x: num(r.x),
    y: num(r.y),
    w: Math.max(ROOM_SNAP, num(r.w, 1)),
    h: Math.max(ROOM_SNAP, num(r.h, 1)),
  };
}

function roomContains(r, x, y, eps = ON_WALL_EPS) {
  return x >= r.x - eps && x <= r.x + r.w + eps && y >= r.y - eps && y <= r.y + r.h + eps;
}

// Index of the smallest room containing the point, or -1.
function roomAt(rooms, x, y) {
  let best = -1;
  let bestArea = Infinity;
  rooms.forEach((r, i) => {
    if (roomContains(r, x, y) && r.w * r.h < bestArea) {
      best = i;
      bestArea = r.w * r.h;
    }
  });
  return best;
}

// The 4 walls of a room: horizontal ones at `at` = y, from a to b along x (and the reverse for vertical).
function roomEdges(r) {
  return [
    { o: 'h', at: r.y, a: r.x, b: r.x + r.w },
    { o: 'h', at: r.y + r.h, a: r.x, b: r.x + r.w },
    { o: 'v', at: r.x, a: r.y, b: r.y + r.h },
    { o: 'v', at: r.x + r.w, a: r.y, b: r.y + r.h },
  ];
}

// Closest wall to a point within maxDist, with the point projected onto it.
function nearestWall(rooms, x, y, maxDist) {
  let best = null;
  for (const r of rooms) {
    for (const e of roomEdges(r)) {
      const along = e.o === 'h' ? x : y;
      const across = e.o === 'h' ? y : x;
      if (along < e.a - ON_WALL_EPS || along > e.b + ON_WALL_EPS) continue;
      const dist = Math.abs(across - e.at);
      if (dist <= maxDist && (!best || dist < best.dist)) {
        const pos = clamp(along, e.a, e.b);
        best = { ...e, dist, pos, x: e.o === 'h' ? pos : e.at, y: e.o === 'h' ? e.at : pos };
      }
    }
  }
  return best;
}

function subtractInterval(intervals, a, b) {
  const out = [];
  for (const [s, e] of intervals) {
    if (b <= s || a >= e) {
      out.push([s, e]);
      continue;
    }
    if (a > s) out.push([s, a]);
    if (b < e) out.push([b, e]);
  }
  return out;
}

// Wall portions not shared with another room: drawn thicker, as the outer walls of the home.
function exteriorSegments(rooms) {
  const segments = [];
  rooms.forEach((r, i) => {
    for (const e of roomEdges(r)) {
      let parts = [[e.a, e.b]];
      rooms.forEach((other, j) => {
        if (i === j) return;
        for (const oe of roomEdges(other)) {
          if (oe.o === e.o && Math.abs(oe.at - e.at) < ON_WALL_EPS) {
            parts = subtractInterval(parts, oe.a, oe.b);
          }
        }
      });
      for (const [a, b] of parts) {
        if (b - a > ON_WALL_EPS) segments.push({ o: e.o, at: e.at, a, b });
      }
    }
  });
  return segments;
}

// Everything the card needs to draw one floor, derived from its config and the current states.
function resolveFloor(hass, floor) {
  const rooms = ((floor && floor.rooms) || []).map((r, i) => ({
    ...normalizeRoom(r, i),
    items: [],
    temps: [],
    hums: [],
    lights: [],
    presence: false,
  }));
  const items = ((floor && floor.entities) || []).map((e, index) => {
    const id = e.entity;
    const st = hass.states[id];
    const role = entityRole(id, st);
    const x = num(e.x);
    const y = num(e.y);
    const wall = role === 'cover' ? nearestWall(rooms, x, y, ON_WALL_EPS * 2) : null;
    return { index, id, st, role, x, y, wall, roomIndex: roomAt(rooms, x, y), icon: e.icon, name: e.name, length: e.length };
  });

  for (const item of items) {
    if (item.roomIndex < 0) continue;
    const room = rooms[item.roomIndex];
    room.items.push(item);
    if (isUnavailable(item.st)) continue;
    const value = parseFloat(item.st.state);
    if (item.role === 'temperature' && Number.isFinite(value)) room.temps.push(item);
    if (item.role === 'humidity' && Number.isFinite(value)) room.hums.push(item);
    if (item.role === 'presence' && item.st.state === 'on') room.presence = true;
    if (item.role === 'light') room.lights.push(item);
  }

  // Thermostats feed the room temperature when no temperature sensor is placed in it.
  for (const room of rooms) {
    if (room.temps.length) continue;
    const climate = room.items.find(
      (it) => domainOf(it.id) === 'climate' && it.st && typeof it.st.attributes.current_temperature === 'number'
    );
    if (climate) room.climateTemp = climate;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rooms) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  for (const it of items) {
    minX = Math.min(minX, it.x - 0.5);
    minY = Math.min(minY, it.y - 0.5);
    maxX = Math.max(maxX, it.x + 0.5);
    maxY = Math.max(maxY, it.y + 0.5);
  }
  const bounds = Number.isFinite(minX) ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: 8, maxY: 5 };

  return { rooms, items, bounds, exterior: exteriorSegments(rooms) };
}

function roomTemperature(room) {
  if (room.temps.length) {
    return room.temps.reduce((s, it) => s + parseFloat(it.st.state), 0) / room.temps.length;
  }
  if (room.climateTemp) return room.climateTemp.st.attributes.current_temperature;
  return null;
}

// --- "Generate from my areas" ---------------------------------------------

// Entities suggested by default: the ones that make sense on a floor plan.
function isSuggested(entityId, st) {
  const domain = domainOf(entityId);
  if (SUGGESTED_DOMAINS.includes(domain)) return true;
  const role = entityRole(entityId, st);
  return ['temperature', 'humidity', 'opening', 'presence'].includes(role);
}

// Visible entities of the registry, with the area they belong to (directly or through their device).
function registryEntries(hass) {
  const out = [];
  for (const [id, e] of Object.entries(hass.entities || {})) {
    if (e.hidden || e.entity_category) continue;
    const device = e.device_id && hass.devices ? hass.devices[e.device_id] : null;
    out.push({ id, areaId: e.area_id || (device && device.area_id) || null });
  }
  return out;
}

// Splits a rectangle into one room per area, rooms sharing their walls.
function layoutAreas(areas, x, y, w, h, out) {
  if (!areas.length) return;
  if (areas.length === 1) {
    out.push({ ...areas[0], x, y, w, h });
    return;
  }
  const total = areas.reduce((s, a) => s + a.weight, 0);
  let k = 1;
  let acc = areas[0].weight;
  let bestDiff = Math.abs(total / 2 - acc);
  for (let i = 2; i < areas.length; i++) {
    const next = acc + areas[i - 1].weight;
    if (Math.abs(total / 2 - next) >= bestDiff) break;
    acc = next;
    bestDiff = Math.abs(total / 2 - acc);
    k = i;
  }
  const ratio = acc / total;
  const first = areas.slice(0, k);
  const rest = areas.slice(k);
  if (w >= h && w >= 2) {
    const cut = clamp(Math.round(w * ratio), 1, w - 1);
    layoutAreas(first, x, y, cut, h, out);
    layoutAreas(rest, x + cut, y, w - cut, h, out);
  } else if (h >= 2) {
    const cut = clamp(Math.round(h * ratio), 1, h - 1);
    layoutAreas(first, x, y, w, cut, out);
    layoutAreas(rest, x, y + cut, w, h - cut, out);
  } else {
    // Too small to split any further: line the remaining rooms up to the right.
    areas.forEach((a, i) => out.push({ ...a, x: x + i * 3, y, w: 3, h: 3 }));
  }
}

function generateFromAreas(hass) {
  const areas = Object.values(hass.areas || {});
  const byArea = new Map();
  for (const { id, areaId } of registryEntries(hass)) {
    if (!areaId || !isSuggested(id, hass.states[id])) continue;
    if (!byArea.has(areaId)) byArea.set(areaId, []);
    byArea.get(areaId).push(id);
  }

  const hassFloors = Object.values(hass.floors || {}).sort(
    (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name)
  );
  const groups = hassFloors.map((f) => ({ name: f.name, areas: areas.filter((a) => a.floor_id === f.floor_id) }));
  const orphans = areas.filter((a) => !a.floor_id || !hass.floors || !hass.floors[a.floor_id]);
  if (orphans.length || !groups.length) {
    groups.push({ name: groups.length ? 'Other areas' : 'Home', areas: orphans });
  }

  const floors = groups
    .filter((g) => g.areas.length)
    .map((g) => {
      const weighted = g.areas
        .map((a) => ({ area: a, ids: byArea.get(a.area_id) || [] }))
        .map((a) => ({ ...a, weight: 2 + Math.min(a.ids.length, 6) }))
        .sort((a, b) => b.weight - a.weight || a.area.name.localeCompare(b.area.name));
      const cells = weighted.reduce((s, a) => s + a.weight, 0) * 3;
      const w = Math.max(4, Math.round(Math.sqrt(cells * 1.5)));
      const h = Math.max(3, Math.round(cells / w));
      const placed = [];
      layoutAreas(weighted, 0, 0, w, h, placed);

      const rooms = placed.map((p) => ({ name: p.area.name, icon: p.area.icon || undefined, x: p.x, y: p.y, w: p.w, h: p.h }));
      const exterior = exteriorSegments(rooms.map(normalizeRoom));
      const entities = [];
      placed.forEach((p, i) => entities.push(...placeAreaEntities(hass, p.ids, rooms[i], exterior)));
      return { name: g.name, rooms, entities };
    });

  return floors.length ? floors : [{ name: 'Home', rooms: [], entities: [] }];
}

// Initial positions of an area's entities inside its room: covers on an outer wall,
// sensors in the top-right corner, everything else on a grid below the room name.
function placeAreaEntities(hass, ids, room, exterior) {
  const out = [];
  const covers = ids.filter((id) => domainOf(id) === 'cover');
  const sensors = ids.filter((id) => ['temperature', 'humidity'].includes(entityRole(id, hass.states[id])));
  const others = ids.filter((id) => !covers.includes(id) && !sensors.includes(id));

  if (covers.length) {
    const walls = exterior.filter((s) =>
      s.o === 'h'
        ? s.a >= room.x - ON_WALL_EPS && s.b <= room.x + room.w + ON_WALL_EPS && (Math.abs(s.at - room.y) < ON_WALL_EPS || Math.abs(s.at - room.y - room.h) < ON_WALL_EPS)
        : s.a >= room.y - ON_WALL_EPS && s.b <= room.y + room.h + ON_WALL_EPS && (Math.abs(s.at - room.x) < ON_WALL_EPS || Math.abs(s.at - room.x - room.w) < ON_WALL_EPS)
    );
    const wall = walls.sort((a, b) => b.b - b.a - (a.b - a.a))[0] || roomEdges(room)[0];
    covers.forEach((id, i) => {
      const pos = round2(snap(wall.a + ((wall.b - wall.a) * (i + 0.5)) / covers.length, ENTITY_SNAP));
      out.push({ entity: id, x: wall.o === 'h' ? pos : wall.at, y: wall.o === 'h' ? wall.at : pos });
    });
  }
  sensors.forEach((id, i) => {
    out.push({ entity: id, x: round2(room.x + room.w - 0.5 - i * 0.75), y: round2(room.y + 0.5) });
  });
  const cols = Math.max(1, Math.floor(room.w - 0.5));
  others.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out.push({
      entity: id,
      x: round2(room.x + 0.75 + col),
      y: round2(Math.min(room.y + 1.5 + row, room.y + room.h - 0.5)),
    });
  });
  return out;
}

// -------------------------------------------------------------------------
// Card
// -------------------------------------------------------------------------
class HaPlooumFloorplanCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _floorIndex: { state: true },
      _selectedRoom: { state: true },
      _coverDrag: { state: true },
      _width: { state: true },
    };
  }

  constructor() {
    super();
    this._width = 0;
    // Marker size follows the plan's scale, so small plans stay readable.
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (Math.abs(width - this._width) > 1) this._width = width;
    });
    this._floorIndex = 0;
    this._selectedRoom = null;
    this._coverDrag = null;
    this._pending = {};
    this._onKeyDown = (ev) => {
      if (ev.key === 'Escape' && this._selectedRoom !== null) this._selectedRoom = null;
    };
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-FLOORPLAN-CARD %c ${CARD_VERSION} `,
      'color: white; background: #03a9f4; font-weight: 700;',
      'color: #03a9f4; background: white; font-weight: 700;'
    );
    window.addEventListener('keydown', this._onKeyDown);
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._onKeyDown);
    this._resizeObserver.disconnect();
    clearTimeout(this._holdTimer);
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    if (config.floors !== undefined && !Array.isArray(config.floors)) {
      throw new Error('floors must be a list');
    }
    this.config = config;
  }

  static getStubConfig() {
    // No floors: the plan is generated from the Home Assistant areas until the user edits it.
    return {};
  }

  static getConfigElement() {
    return document.createElement('ha-plooum-floorplan-card-editor');
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  _floors() {
    if (this.config.floors) return this.config.floors;
    // Generated plan, recomputed only when the registries change.
    const key = [this.hass.areas, this.hass.entities, this.hass.floors, this.hass.devices];
    if (!this._autoKey || this._autoKey.some((v, i) => v !== key[i])) {
      this._autoKey = key;
      this._autoFloors = generateFromAreas(this.hass);
    }
    return this._autoFloors;
  }

  _tempRange() {
    const fahrenheit = this.hass.config && this.hass.config.unit_system && this.hass.config.unit_system.temperature === '°F';
    return {
      min: num(this.config.temp_min, fahrenheit ? 63 : 17),
      max: num(this.config.temp_max, fahrenheit ? 81 : 27),
    };
  }

  render() {
    if (!this.hass || !this.config) return nothing;
    const floors = this._floors();
    const floorIndex = clamp(this._floorIndex, 0, floors.length - 1);
    const plan = resolveFloor(this.hass, floors[floorIndex]);
    const selected = this._selectedRoom !== null ? plan.rooms[this._selectedRoom] : null;
    const empty = !plan.rooms.length && !plan.items.length;

    return html`
      <ha-card>
        ${this.config.title || floors.length > 1
          ? html`
              <div class="header">
                <div class="title">${this.config.title || ''}</div>
                ${floors.length > 1
                  ? html`<div class="floors">
                      ${floors.map(
                        (f, i) => html`<button
                          class="chip ${i === floorIndex ? 'active' : ''}"
                          @click=${() => this._selectFloor(i)}
                        >${f.name || `Floor ${i + 1}`}</button>`
                      )}
                    </div>`
                  : nothing}
              </div>
            `
          : nothing}
        ${empty
          ? html`<div class="empty">
              <ha-icon icon="mdi:floor-plan"></ha-icon>
              <div>No plan yet. Edit this card to draw your home and place your devices.</div>
            </div>`
          : this._renderPlan(plan, selected)}
        ${selected ? this._renderPanel(selected) : nothing}
      </ha-card>
    `;
  }

  _selectFloor(i) {
    this._floorIndex = i;
    this._selectedRoom = null;
  }

  _renderPlan(plan, selected) {
    const pad = 0.4;
    const b = plan.bounds;
    const vb = { x: b.minX - pad, y: b.minY - pad, w: b.maxX - b.minX + 2 * pad, h: b.maxY - b.minY + 2 * pad };
    const px = (x) => ((x - vb.x) / vb.w) * 100;
    const py = (y) => ((y - vb.y) / vb.h) * 100;
    const pw = (w) => (w / vb.w) * 100;
    const ph = (h) => (h / vb.h) * 100;
    const { min, max } = this._tempRange();

    const dim = (room) => (selected && room !== selected ? 'dim' : '');
    const planWidth = this._width - 2 * CARD_PADDING;
    const markerSize = planWidth > 0 ? clamp(Math.round((planWidth / vb.w) * 0.8), 18, 28) : 28;
    const zoom = this._zoomView(vb, selected, planWidth);
    // Until the width is known, the aspect ratio sizes the plan; then an explicit height lets it grow while zoomed.
    const planSize = planWidth > 0 ? `height: ${zoom.height}px;` : `aspect-ratio: ${vb.w} / ${vb.h};`;

    return html`
      <div class="plan" style="${planSize} --m: ${markerSize}px;" @click=${() => (this._selectedRoom = null)}>
        <div class="zoom" style="aspect-ratio: ${vb.w} / ${vb.h}; transform: ${zoom.transform}; --k: ${zoom.k};">
          <svg class="layer" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" preserveAspectRatio="none">
            <defs>
              ${plan.rooms.map(
                (room) => svg`
                  <clipPath id="clip-${room.index}">
                    <rect x=${room.x} y=${room.y} width=${room.w} height=${room.h}></rect>
                  </clipPath>
                  ${room.items
                    .filter((it) => it.role === 'light')
                    .map(
                      (it) => svg`
                        <radialGradient id="glow-${it.index}" gradientUnits="userSpaceOnUse"
                          cx=${it.x} cy=${it.y} r=${Math.max(room.w, room.h) * 0.8}>
                          <stop offset="0" stop-color=${rgba(lightRgb(it.st), 0.75)}></stop>
                          <stop offset="0.45" stop-color=${rgba(lightRgb(it.st), 0.3)}></stop>
                          <stop offset="1" stop-color=${rgba(lightRgb(it.st), 0)}></stop>
                        </radialGradient>
                      `
                    )}
                `
              )}
            </defs>
            ${plan.rooms.map((room) => {
              const t = roomTemperature(room);
              const fill = t === null ? 'var(--fp-floor)' : rgba(tempRgb(t, min, max), 0.3);
              return svg`<rect class="floor ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h} style="fill: ${fill};"></rect>`;
            })}
            ${plan.rooms.map((room) =>
              room.items
                .filter((it) => it.role === 'light')
                .map((it) => {
                  const on = isActive(it.st);
                  const brightness = on && typeof it.st.attributes.brightness === 'number' ? it.st.attributes.brightness / 255 : 1;
                  return svg`<rect class="glow ${dim(room)}" clip-path="url(#clip-${room.index})"
                    x=${room.x} y=${room.y} width=${room.w} height=${room.h}
                    fill="url(#glow-${it.index})" style="opacity: ${on ? 0.45 + 0.55 * brightness : 0};"></rect>`;
                })
            )}
            ${plan.rooms.map(
              (room) => svg`<rect class="wall ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h}></rect>`
            )}
            ${plan.rooms
              .filter((room) => room.presence)
              .map(
                (room) => svg`<rect class="presence" x=${room.x + 0.12} y=${room.y + 0.12}
                  width=${Math.max(0, room.w - 0.24)} height=${Math.max(0, room.h - 0.24)}></rect>`
              )}
            ${plan.exterior.map((s) =>
              s.o === 'h'
                ? svg`<line class="outer" x1=${s.a} y1=${s.at} x2=${s.b} y2=${s.at}></line>`
                : svg`<line class="outer" x1=${s.at} y1=${s.a} x2=${s.at} y2=${s.b}></line>`
            )}
          </svg>

          <div class="overlay">
            ${plan.rooms.map((room) => this._renderRoom(room, dim(room), { px, py, pw, ph }))}
            ${plan.items.map((item) => this._renderItem(item, plan, { px, py, pw, ph }))}
          </div>
        </div>
      </div>
    `;
  }

  // Zoom on the selected room: the room fills the plan's width, and the plan grows taller
  // (up to ZOOM_MAX_HEIGHT x its width) when the room doesn't fit in the plan's height.
  // `k` shrinks markers and labels back so that they grow at most ZOOM_ITEM_GROWTH times.
  _zoomView(vb, selected, planWidth) {
    const baseHeight = (planWidth * vb.h) / vb.w;
    const none = { height: baseHeight, transform: 'none', k: 1 };
    if (!selected || planWidth <= 0) return none;

    const unit = planWidth / vb.w; // px per grid unit, unzoomed
    const viewW = selected.w + 2 * ZOOM_MARGIN;
    const viewH = selected.h + 2 * ZOOM_MARGIN;
    const maxHeight = Math.max(baseHeight, planWidth * ZOOM_MAX_HEIGHT);
    const s = Math.min(vb.w / viewW, maxHeight / (viewH * unit), ZOOM_MAX);
    if (s < 1.1) return none; // the room already fills the plan: highlighting it is enough

    const height = clamp(viewH * unit * s, baseHeight, maxHeight);
    const cx = (selected.x + selected.w / 2 - vb.x) * unit;
    const cy = (selected.y + selected.h / 2 - vb.y) * unit;
    // Center the room, without showing empty space past the plan's edges when avoidable.
    let tx = planWidth / 2 - cx * s;
    let ty = height / 2 - cy * s;
    tx = clamp(tx, planWidth - planWidth * s, 0);
    if (baseHeight * s >= height) ty = clamp(ty, height - baseHeight * s, 0);
    return { height, transform: `translate(${tx}px, ${ty}px) scale(${s})`, k: Math.min(s, ZOOM_ITEM_GROWTH) / s };
  }

  _renderRoom(room, dimClass, { px, py, pw, ph }) {
    const t = roomTemperature(room);
    let tempText = '';
    if (room.temps.length === 1) tempText = formatState(this.hass, room.temps[0].st);
    else if (t !== null) {
      const unit = room.temps.length ? room.temps[0].st.attributes.unit_of_measurement || '' : this.hass.config.unit_system.temperature;
      tempText = `${t.toFixed(1)} ${unit}`;
    }
    let humText = '';
    if (room.hums.length === 1) humText = formatState(this.hass, room.hums[0].st);
    else if (room.hums.length > 1) {
      humText = `${Math.round(room.hums.reduce((s, it) => s + parseFloat(it.st.state), 0) / room.hums.length)} %`;
    }

    return html`
      <div
        class="room ${dimClass} ${this._selectedRoom === room.index ? 'selected' : ''}"
        style="left: ${px(room.x)}%; top: ${py(room.y)}%; width: ${pw(room.w)}%; height: ${ph(room.h)}%;"
        @click=${(ev) => this._selectRoom(ev, room.index)}
      >
        <div class="label">
          ${room.name
            ? html`<div class="name">
                ${room.icon ? html`<ha-icon icon=${room.icon}></ha-icon>` : nothing}<span>${room.name}</span>
              </div>`
            : nothing}
          ${tempText || humText
            ? html`<div class="climate">
                ${tempText ? html`<span class="temp">${tempText}</span>` : nothing}
                ${humText ? html`<span class="hum"><ha-icon icon="mdi:water-percent"></ha-icon>${humText}</span>` : nothing}
              </div>`
            : nothing}
        </div>
      </div>
    `;
  }

  _renderItem(item, plan, { px, py, pw, ph }) {
    if (item.role === 'cover' && item.wall && item.st) return this._renderWindow(item, { px, py, pw, ph });
    // Temperature and humidity sensors inside a room are shown in its label.
    if ((item.role === 'temperature' || item.role === 'humidity') && item.roomIndex >= 0 && item.st) return nothing;
    const dim = this._selectedRoom !== null && item.roomIndex !== this._selectedRoom ? 'dim' : '';
    const pos = `left: ${px(item.x)}%; top: ${py(item.y)}%;`;
    const events = {
      down: (ev) => this._itemDown(ev, item),
      up: () => clearTimeout(this._holdTimer),
      click: (ev) => this._itemClick(ev, item),
    };

    if (!item.st) {
      return html`<button class="marker missing ${dim}" style=${pos} title="${item.id}: entity not found"
        @click=${(ev) => ev.stopPropagation()}>
        <ha-icon icon="mdi:help-circle-outline"></ha-icon>
      </button>`;
    }

    const title = `${item.name || friendlyName(this.hass, item.id)}: ${formatState(this.hass, item.st)}`;
    if (['temperature', 'humidity', 'sensor'].includes(item.role)) {
      return html`<button class="badge ${isUnavailable(item.st) ? 'unavailable' : ''} ${dim}" style=${pos} title=${title}
        @pointerdown=${events.down} @pointerup=${events.up} @pointerleave=${events.up} @click=${events.click}
        @contextmenu=${(ev) => ev.preventDefault()}>
        ${this._icon(item)}<span>${formatState(this.hass, item.st)}</span>
      </button>`;
    }

    const active = isActive(item.st);
    let color = 'var(--fp-active)';
    if (item.role === 'light') color = rgba(lightRgb(item.st));
    else if (item.role === 'opening' || (item.role === 'device' && domainOf(item.id) === 'lock')) color = 'var(--fp-alert)';
    else if (item.role === 'presence') color = 'var(--fp-presence)';
    const classes = [
      'marker',
      active ? 'active' : '',
      isUnavailable(item.st) ? 'unavailable' : '',
      dim,
    ].join(' ');
    return html`<button class=${classes} style="${pos} --c: ${color};" title=${title}
      @pointerdown=${events.down} @pointerup=${events.up} @pointerleave=${events.up} @click=${events.click}
      @contextmenu=${(ev) => ev.preventDefault()}>
      ${this._icon(item)}
    </button>`;
  }

  _icon(item) {
    if (item.icon) return html`<ha-icon icon=${item.icon}></ha-icon>`;
    return html`<ha-state-icon .hass=${this.hass} .stateObj=${item.st}></ha-state-icon>`;
  }

  _renderWindow(item, { px, py, pw, ph }) {
    const wall = item.wall;
    const len = Math.min(num(item.length, WINDOW_LENGTH), wall.b - wall.a);
    const center = clamp(wall.pos, wall.a + len / 2, wall.b - len / 2);
    const style =
      wall.o === 'h'
        ? `left: ${px(center - len / 2)}%; width: ${pw(len)}%; top: ${py(wall.at)}%;`
        : `top: ${py(center - len / 2)}%; height: ${ph(len)}%; left: ${px(wall.at)}%;`;

    const st = item.st;
    let pos = coverPosition(st);
    const pending = this._pending[item.id];
    if (pending && Date.now() < pending.until && Math.abs(pending.pos - pos) > 1) pos = pending.pos;
    if (this._coverDrag && this._coverDrag.id === item.id) pos = this._coverDrag.pos;
    const moving = st.state === 'opening' || st.state === 'closing';
    const dim = this._selectedRoom !== null && item.roomIndex !== this._selectedRoom ? 'dim' : '';

    return html`
      <div
        class="window ${wall.o} ${moving ? 'moving' : ''} ${isUnavailable(st) ? 'unavailable' : ''} ${dim}"
        style="${style} --closed: ${100 - pos}%;"
        title="${item.name || friendlyName(this.hass, item.id)}: ${formatState(this.hass, st)}"
        @pointerdown=${(ev) => this._windowDown(ev, item)}
        @pointermove=${(ev) => this._windowMove(ev)}
        @pointerup=${(ev) => this._windowUp(ev)}
        @pointercancel=${() => this._windowCancel()}
        @click=${(ev) => ev.stopPropagation()}
      >
        <div class="glass"></div>
        <div class="shutter"></div>
        ${this._coverDrag && this._coverDrag.id === item.id ? html`<div class="bubble">${pos}%</div>` : nothing}
      </div>
    `;
  }

  _renderPanel(room) {
    const order = ['temperature', 'humidity', 'light', 'cover', 'device', 'opening', 'presence', 'sensor'];
    const items = [...room.items].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
    return html`
      <div class="panel">
        <div class="panel-header">
          ${room.icon ? html`<ha-icon icon=${room.icon}></ha-icon>` : nothing}
          <span class="panel-title">${room.name || 'Room'}</span>
          <button class="close" title="Close" @click=${() => (this._selectedRoom = null)}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        ${items.length
          ? items.map((item) => this._renderRow(item))
          : html`<div class="panel-empty">No device placed in this room.</div>`}
      </div>
    `;
  }

  _renderRow(item) {
    const st = item.st;
    const name = item.name || friendlyName(this.hass, item.id);
    if (!st) {
      return html`<div class="row missing">
        <ha-icon icon="mdi:help-circle-outline"></ha-icon>
        <span class="row-name">${item.id}</span>
        <span class="row-state">Entity not found</span>
      </div>`;
    }
    const domain = domainOf(item.id);
    const unavailable = isUnavailable(st);
    let control;
    if (unavailable) {
      control = html`<span class="row-state">${formatState(this.hass, st)}</span>`;
    } else if (TOGGLE_DOMAINS.includes(domain)) {
      control = html`<button
        class="toggle ${st.state === 'on' ? 'on' : ''}"
        role="switch"
        aria-checked=${st.state === 'on'}
        title="Toggle"
        @click=${() => this._toggle(item.id)}
      ><span></span></button>`;
    } else if (domain === 'cover' && supportsSetPosition(st)) {
      control = html`<span class="row-state">${coverPosition(st)}%</span>
        <input type="range" min="0" max="100" .value=${String(coverPosition(st))}
          @change=${(ev) => this._setCover(st, Number(ev.target.value))} />`;
    } else if (domain === 'cover') {
      control = html`<span class="row-state">${formatState(this.hass, st)}</span>
        <button class="icon-btn" title="Open" @click=${() => this._call('cover', 'open_cover', item.id)}><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="icon-btn" title="Close" @click=${() => this._call('cover', 'close_cover', item.id)}><ha-icon icon="mdi:arrow-down"></ha-icon></button>`;
    } else if (RUN_SERVICES[domain]) {
      control = html`<button class="run" @click=${() => this._call(domain, RUN_SERVICES[domain], item.id)}>Run</button>`;
    } else {
      control = html`<span class="row-state">${formatState(this.hass, st)}</span>`;
    }
    return html`<div class="row ${unavailable ? 'unavailable' : ''} ${isActive(st) ? 'active' : ''}">
      <button class="row-main" @click=${() => this._moreInfo(item.id)}>
        ${this._icon(item)}
        <span class="row-name">${name}</span>
      </button>
      ${control}
    </div>`;
  }

  // --- Interactions --------------------------------------------------------

  // A tap on the selected room does nothing: deselecting would zoom out and move the plan under the
  // pointer, so the next tap would land in another room. Close with the panel's button, Escape,
  // or a tap outside the rooms.
  _selectRoom(ev, index) {
    ev.stopPropagation();
    this._selectedRoom = index;
  }

  _itemDown(ev, item) {
    ev.stopPropagation();
    this._held = false;
    clearTimeout(this._holdTimer);
    this._holdTimer = setTimeout(() => {
      this._held = true;
      this._moreInfo(item.id);
    }, HOLD_DELAY);
  }

  _itemClick(ev, item) {
    ev.stopPropagation();
    clearTimeout(this._holdTimer);
    if (this._held) {
      this._held = false;
      return;
    }
    const domain = domainOf(item.id);
    if (isUnavailable(item.st)) this._moreInfo(item.id);
    else if (TOGGLE_DOMAINS.includes(domain)) this._toggle(item.id);
    else if (RUN_SERVICES[domain]) this._call(domain, RUN_SERVICES[domain], item.id);
    else this._moreInfo(item.id);
  }

  _windowDown(ev, item) {
    ev.stopPropagation();
    if (isUnavailable(item.st)) {
      this._moreInfo(item.id);
      return;
    }
    ev.currentTarget.setPointerCapture(ev.pointerId);
    this._windowDrag = { item, el: ev.currentTarget, x: ev.clientX, y: ev.clientY, moved: false };
  }

  _windowMove(ev) {
    const d = this._windowDrag;
    if (!d) return;
    if (!d.moved && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) < 5) return;
    d.moved = true;
    // The shutter covers the window from its start (left or top): dragging sets where it ends.
    const r = d.el.getBoundingClientRect();
    const f = d.item.wall.o === 'h' ? (ev.clientX - r.left) / r.width : (ev.clientY - r.top) / r.height;
    this._coverDrag = { id: d.item.id, pos: Math.round((1 - clamp(f, 0, 1)) * 100) };
  }

  _windowUp() {
    const d = this._windowDrag;
    this._windowDrag = null;
    if (!d) return;
    if (!d.moved) {
      this._moreInfo(d.item.id);
      return;
    }
    const pos = this._coverDrag ? this._coverDrag.pos : coverPosition(d.item.st);
    this._coverDrag = null;
    this._setCover(d.item.st, pos);
  }

  _windowCancel() {
    this._windowDrag = null;
    this._coverDrag = null;
  }

  _setCover(st, pos) {
    if (supportsSetPosition(st)) {
      this._pending[st.entity_id] = { pos, until: Date.now() + COVER_PENDING_MS };
      setTimeout(() => this.requestUpdate(), COVER_PENDING_MS);
      this._call('cover', 'set_cover_position', st.entity_id, { position: pos });
    } else {
      this._call('cover', pos >= 50 ? 'open_cover' : 'close_cover', st.entity_id);
    }
  }

  _toggle(entityId) {
    this._call('homeassistant', 'toggle', entityId);
  }

  _call(domain, service, entityId, data = {}) {
    window.dispatchEvent(new CustomEvent('haptic', { detail: 'light' }));
    this.hass.callService(domain, service, { entity_id: entityId, ...data });
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
  }

  static get styles() {
    return css`
      :host {
        display: block;
        --fp-wall: var(--primary-text-color, #e1e1e1);
        --fp-floor: rgba(127, 127, 127, 0.08);
        --fp-active: var(--state-active-color, var(--amber-color, #ffc107));
        --fp-alert: var(--error-color, #ef5350);
        --fp-presence: var(--info-color, #4fc3f7);
      }
      ha-card {
        overflow: hidden;
        padding: ${CARD_PADDING}px;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
      }
      .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .floors {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .chip {
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--secondary-text-color);
        border-radius: 14px;
        padding: 4px 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }
      .chip.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px 12px;
        text-align: center;
        color: var(--secondary-text-color);
      }
      .empty ha-icon {
        --mdc-icon-size: 40px;
      }

      .plan {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        transition: height 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .zoom {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        transform-origin: 0 0;
        transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .layer,
      .overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .layer {
        overflow: visible;
      }
      .floor,
      .glow,
      .wall {
        transition: opacity 0.6s ease, fill 0.8s ease;
      }
      .wall {
        fill: none;
        stroke: var(--fp-wall);
        stroke-opacity: 0.25;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
      }
      .outer {
        stroke: var(--fp-wall);
        stroke-opacity: 0.75;
        stroke-width: 4px;
        stroke-linecap: square;
        vector-effect: non-scaling-stroke;
      }
      .presence {
        fill: none;
        stroke: var(--fp-presence);
        stroke-width: 2px;
        vector-effect: non-scaling-stroke;
        animation: pulse 2s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { stroke-opacity: 0.15; }
        50% { stroke-opacity: 0.9; }
      }
      .dim {
        opacity: 0.3;
      }
      .glow.dim {
        opacity: 0 !important;
      }

      .room {
        position: absolute;
        box-sizing: border-box;
        cursor: pointer;
        overflow: hidden;
        transition: opacity 0.4s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .room:hover {
        background: rgba(127, 127, 127, 0.06);
      }
      .label {
        transform: scale(var(--k, 1));
        transform-origin: 0 0;
        transition: transform 0.45s ease;
        padding: 5px 7px;
        display: flex;
        flex-direction: column;
        gap: 1px;
        pointer-events: none;
      }
      .name {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .name ha-icon {
        --mdc-icon-size: 14px;
        opacity: 0.7;
        flex: none;
      }
      .name span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .climate {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .temp {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .hum {
        display: inline-flex;
        align-items: center;
      }
      .hum ha-icon {
        --mdc-icon-size: 12px;
      }

      .marker,
      .badge {
        position: absolute;
        transform: translate(-50%, -50%);
        border: none;
        cursor: pointer;
        font: inherit;
        padding: 0;
        -webkit-tap-highlight-color: transparent;
        transition: opacity 0.4s ease, color 0.3s ease, box-shadow 0.3s ease;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .marker {
        width: calc(var(--m, 28px) * var(--k, 1));
        height: calc(var(--m, 28px) * var(--k, 1));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        background: var(--card-background-color, #1c1c1c);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
        --mdc-icon-size: calc(var(--m, 28px) * var(--k, 1) * 0.64);
      }
      .marker.active {
        color: var(--c);
        box-shadow: 0 0 0 2px var(--c), 0 0 12px var(--c);
      }
      .marker.unavailable,
      .badge.unavailable {
        color: var(--disabled-text-color, #6f6f6f);
        animation: blink 1.6s ease-in-out infinite;
      }
      /* A placed entity that doesn't exist (renamed or deleted): a config error to fix, kept visible. */
      .marker.missing {
        color: var(--warning-color, #ffa600);
        border: 1px dashed var(--warning-color, #ffa600);
        box-shadow: none;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 7px 2px 4px;
        border-radius: 12px;
        font-size: calc(var(--m, 28px) * var(--k, 1) * 0.4);
        white-space: nowrap;
        color: var(--primary-text-color);
        background: var(--card-background-color, #1c1c1c);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
        --mdc-icon-size: calc(var(--m, 28px) * var(--k, 1) * 0.5);
      }

      .window {
        position: absolute;
        cursor: ew-resize;
        touch-action: none;
        transition: opacity 0.4s ease;
      }
      .window {
        --t: calc(var(--k, 1) * 1px); /* 1px, compensated for the zoom */
      }
      .window.h {
        height: calc(14 * var(--t));
        transform: translateY(-50%);
      }
      .window.v {
        width: calc(14 * var(--t));
        transform: translateX(-50%);
        cursor: ns-resize;
      }
      .glass,
      .shutter {
        position: absolute;
        border-radius: 2px;
      }
      .window.h .glass {
        left: 0;
        right: 0;
        top: calc(4 * var(--t));
        height: calc(6 * var(--t));
      }
      .window.v .glass {
        top: 0;
        bottom: 0;
        left: calc(4 * var(--t));
        width: calc(6 * var(--t));
      }
      .glass {
        background: #8fd3ff;
        box-shadow: 0 0 6px rgba(143, 211, 255, 0.7);
      }
      .shutter {
        background: repeating-linear-gradient(90deg, #5d6670 0 2px, #79838e 2px 4px);
        transition: width 0.3s ease, height 0.3s ease;
      }
      .window.h .shutter {
        left: 0;
        top: calc(3 * var(--t));
        height: calc(8 * var(--t));
        width: var(--closed);
      }
      .window.v .shutter {
        top: 0;
        left: calc(3 * var(--t));
        width: calc(8 * var(--t));
        height: var(--closed);
        background: repeating-linear-gradient(0deg, #5d6670 0 2px, #79838e 2px 4px);
      }
      .window.moving .glass {
        background: repeating-linear-gradient(90deg, #8fd3ff 0 4px, #4f8fbf 4px 8px);
        background-size: 16px 100%;
        animation: slide 0.6s linear infinite;
      }
      @keyframes slide {
        to { background-position: 16px 0; }
      }
      .window.unavailable {
        opacity: 0.4;
        cursor: pointer;
      }
      .bubble {
        position: absolute;
        left: 50%;
        top: calc(-26 * var(--t));
        transform: translateX(-50%) scale(var(--k, 1));
        transform-origin: 50% 100%;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 1px 7px;
        font-size: 11px;
        font-weight: 600;
        pointer-events: none;
      }

      .panel {
        margin-top: 10px;
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
        animation: reveal 0.3s ease;
      }
      @keyframes reveal {
        from { opacity: 0; transform: translateY(-6px); }
      }
      .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }
      .panel-title {
        flex: 1;
        font-weight: 500;
      }
      .close,
      .icon-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 4px;
        display: flex;
        border-radius: 50%;
        --mdc-icon-size: 20px;
      }
      .panel-empty {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 6px 0;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
      }
      .row-main {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        text-align: left;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .row-main ha-state-icon,
      .row-main ha-icon {
        color: var(--secondary-text-color);
        flex: none;
      }
      .row.active .row-main ha-state-icon,
      .row.active .row-main ha-icon {
        color: var(--fp-active);
      }
      .row.unavailable,
      .row.missing {
        color: var(--disabled-text-color, #6f6f6f);
      }
      .row-name {
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .row.missing .row-name {
        flex: 1;
      }
      .row-state {
        font-size: 13px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .row input[type='range'] {
        width: 110px;
        accent-color: var(--primary-color);
      }
      .toggle {
        width: 36px;
        height: 20px;
        border-radius: 10px;
        border: none;
        padding: 0;
        background: var(--disabled-text-color, #6f6f6f);
        position: relative;
        cursor: pointer;
        transition: background 0.2s ease;
        flex: none;
      }
      .toggle span {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.2s ease;
      }
      .toggle.on {
        background: var(--primary-color);
      }
      .toggle.on span {
        transform: translateX(16px);
      }
      .run {
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        background: transparent;
        border-radius: 14px;
        padding: 3px 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }
    `;
  }
}

// -------------------------------------------------------------------------
// Visual editor
// -------------------------------------------------------------------------
class HaPlooumFloorplanCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { state: true },
      _floorIndex: { state: true },
      _selection: { state: true },
      _drag: { state: true },
      _search: { state: true },
      _filter: { state: true },
      _history: { state: true },
    };
  }

  constructor() {
    super();
    this._floorIndex = 0;
    this._selection = null; // { kind: 'room' | 'entity', index }
    this._drag = null;
    this._search = '';
    this._filter = 'suggested';
    this._history = []; // previous `floors` values, for undo (the HA card editor has none)
    this._extentCache = null;
  }

  setConfig(config) {
    this._config = config;
  }

  // --- Config access -------------------------------------------------------

  _isGenerated() {
    return !Array.isArray(this._config.floors);
  }

  _floors() {
    if (!this._isGenerated()) return this._config.floors;
    const key = [this.hass.areas, this.hass.entities, this.hass.floors, this.hass.devices];
    if (!this._autoKey || this._autoKey.some((v, i) => v !== key[i])) {
      this._autoKey = key;
      this._autoFloors = generateFromAreas(this.hass);
    }
    return this._autoFloors;
  }

  _currentFloorIndex() {
    return clamp(this._floorIndex, 0, this._floors().length - 1);
  }

  // `mergeKey`: consecutive commits with the same key (typing in one field) make a single undo step.
  _commitFloors(floors, mergeKey = null) {
    if (!mergeKey || mergeKey !== this._lastMergeKey) {
      this._history = [...this._history.slice(-49), this._config.floors];
    }
    this._lastMergeKey = mergeKey;
    this._setFloors(floors);
  }

  // `floors` undefined means "generated from the areas".
  _setFloors(floors) {
    const config = { ...this._config, floors };
    if (floors === undefined) delete config.floors;
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  _undo() {
    if (!this._history.length) return;
    const previous = this._history[this._history.length - 1];
    this._history = this._history.slice(0, -1);
    this._selection = null;
    this._extentCache = null;
    this._setFloors(previous);
  }

  // Applies `fn` to a copy of the current floor and saves the result (a generated plan becomes the user's own).
  _editFloor(fn, mergeKey = null) {
    const floors = JSON.parse(JSON.stringify(this._floors()));
    const floor = floors[this._currentFloorIndex()];
    floor.rooms = floor.rooms || [];
    floor.entities = floor.entities || [];
    fn(floor, floors);
    this._commitFloors(floors, mergeKey);
  }

  // --- Render --------------------------------------------------------------

  render() {
    if (!this.hass || !this._config) return nothing;
    const floors = this._floors();
    const fi = this._currentFloorIndex();
    const floor = this._applyDrag(floors[fi]);

    const schema = [
      { name: 'title', label: 'Title', selector: { text: {} } },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'temp_min', label: 'Coldest temperature (blue floor)', selector: { number: { mode: 'box', step: 0.5 } } },
          { name: 'temp_max', label: 'Warmest temperature (red floor)', selector: { number: { mode: 'box', step: 0.5 } } },
        ],
      },
    ];

    return html`
      <div class="editor">
        <div class="floor-tabs">
          ${floors.map(
            (f, i) => html`<button class="chip ${i === fi ? 'active' : ''}" @click=${() => this._selectFloor(i)}>
              ${f.name || `Floor ${i + 1}`}
            </button>`
          )}
          <button class="chip add" title="Add a floor" @click=${this._addFloor}>+ Floor</button>
          <span class="spacer"></span>
          <button class="btn flat" title="Undo (Ctrl+Z)" ?disabled=${!this._history.length} @click=${this._undo}>
            <ha-icon icon="mdi:undo"></ha-icon> Undo
          </button>
          ${this._isGenerated()
            ? html`<button class="btn flat" @click=${this._startBlank}>
                <ha-icon icon="mdi:file-outline"></ha-icon> Blank plan
              </button>`
            : html`<button class="btn flat" @click=${this._regenerate}>
                <ha-icon icon="mdi:auto-fix"></ha-icon> From my areas
              </button>`}
        </div>

        ${this._isGenerated()
          ? html`<div class="hint generated">
              <ha-icon icon="mdi:auto-fix"></ha-icon>
              Generated from your Home Assistant areas: fix anything that is wrong by dragging it, and the
              plan becomes yours. Or start from a blank plan.
            </div>`
          : html`<div class="hint">
              <ha-icon icon="mdi:gesture-tap-hold"></ha-icon>
              Drag on the grid to draw a room. Drag entities from the list onto the plan. Drop an entity
              outside the plan to remove it. Covers stick to the nearest wall.
            </div>`}

        <!-- Plan and entity list side by side when the editor is wide enough (container query). -->
        <div class="workspace">
          <div class="main">${this._renderCanvas(floor)} ${this._renderSelection(floors[fi])}</div>
          ${this._renderPalette(floors)}
        </div>

        <div class="section-title">Card settings</div>
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${schema}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${this._formChanged}
        ></ha-form>
      </div>
    `;
  }

  // The floor as currently displayed: the stored one with the drag in progress applied.
  _applyDrag(floor) {
    const d = this._drag;
    if (!d || !d.moved) return floor;
    const copy = { ...floor, rooms: [...(floor.rooms || [])], entities: [...(floor.entities || [])] };
    if (d.type === 'draw') copy.rooms.push({ ...d.rect, name: '' });
    if (d.type === 'move' || d.type === 'resize') {
      copy.rooms[d.index] = { ...copy.rooms[d.index], ...d.rect };
    }
    if (d.type === 'move') {
      for (const inner of d.inner) {
        copy.entities[inner.index] = { ...copy.entities[inner.index], x: inner.x + d.dx, y: inner.y + d.dy };
      }
    }
    if (d.type === 'entity' && !d.outside) {
      copy.entities[d.index] = { ...copy.entities[d.index], x: d.pos.x, y: d.pos.y };
    }
    return copy;
  }

  // Visible area of the editor grid: the plan plus some room to grow, at least 14x8.
  // It only grows while a floor is being edited, so the grid never jumps under the pointer.
  _extent(floor) {
    if (this._drag && this._drag.extent) return this._drag.extent;
    // Entity positions (not their icons' size) so that a cover on an outer wall doesn't grow the grid.
    const xs = [0];
    const ys = [0];
    for (const r of (floor.rooms || []).map(normalizeRoom)) xs.push(r.x, r.x + r.w), ys.push(r.y, r.y + r.h);
    for (const e of floor.entities || []) xs.push(num(e.x)), ys.push(num(e.y));
    let x1 = Math.floor(Math.min(...xs)) - 1;
    let y1 = Math.floor(Math.min(...ys)) - 1;
    let x2 = Math.max(x1 + 14, Math.ceil(Math.max(...xs)) + 2);
    let y2 = Math.max(y1 + 8, Math.ceil(Math.max(...ys)) + 2);
    const fi = this._currentFloorIndex();
    const prev = this._extentCache && this._extentCache.floor === fi ? this._extentCache.ext : null;
    if (prev) {
      x1 = Math.min(x1, prev.x);
      y1 = Math.min(y1, prev.y);
      x2 = Math.max(x2, prev.x + prev.w);
      y2 = Math.max(y2, prev.y + prev.h);
    }
    const ext = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    this._extentCache = { floor: fi, ext };
    return ext;
  }

  _renderCanvas(floor) {
    const ext = this._extent(floor);
    this._ext = ext;
    const plan = resolveFloor(this.hass, floor);
    const px = (x) => ((x - ext.x) / ext.w) * 100;
    const py = (y) => ((y - ext.y) / ext.h) * 100;
    const sel = this._selection;
    const overlapping = new Set();
    plan.rooms.forEach((a, i) =>
      plan.rooms.forEach((b, j) => {
        if (i < j && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
          overlapping.add(i);
          overlapping.add(j);
        }
      })
    );
    const selectedRoom = sel && sel.kind === 'room' ? plan.rooms[sel.index] : null;
    const d = this._drag;
    const ghost = d && d.type === 'palette' && d.overCanvas ? d : null;

    return html`
      <div
        class="canvas ${d && d.type === 'entity' && d.outside ? 'removing' : ''}"
        style="aspect-ratio: ${ext.w} / ${ext.h};"
        tabindex="0"
        @pointerdown=${this._canvasDown}
        @pointermove=${this._canvasMove}
        @pointerup=${this._canvasUp}
        @pointercancel=${this._canvasCancel}
        @keydown=${this._canvasKey}
      >
        <svg class="layer" viewBox="${ext.x} ${ext.y} ${ext.w} ${ext.h}" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M 1 0 L 0 0 0 1" class="grid-line"></path>
            </pattern>
          </defs>
          <rect x=${ext.x} y=${ext.y} width=${ext.w} height=${ext.h} fill="url(#grid)"></rect>
          ${plan.rooms.map(
            (r, i) => svg`<rect class="e-room ${selectedRoom && selectedRoom.index === i ? 'selected' : ''} ${overlapping.has(i) ? 'overlap' : ''}"
              x=${r.x} y=${r.y} width=${r.w} height=${r.h}></rect>`
          )}
          ${plan.rooms.map((r, i) => {
            // Grab area to move a room, inset so that a drag started on a wall draws a new adjoining room.
            const inset = Math.min(EDGE_DRAW_ZONE, r.w / 4, r.h / 4);
            return svg`<rect class="e-room-hit" data-kind="room" data-index=${i}
              x=${r.x + inset} y=${r.y + inset} width=${r.w - 2 * inset} height=${r.h - 2 * inset}></rect>`;
          })}
          ${plan.exterior.map((s) =>
            s.o === 'h'
              ? svg`<line class="e-outer" x1=${s.a} y1=${s.at} x2=${s.b} y2=${s.at}></line>`
              : svg`<line class="e-outer" x1=${s.at} y1=${s.a} x2=${s.at} y2=${s.b}></line>`
          )}
        </svg>
        <div class="overlay">
          ${plan.rooms.map(
            (r) => html`<div class="e-label" style="left: ${px(r.x)}%; top: ${py(r.y)}%;">
              ${r.name || html`<i>Unnamed</i>`}
            </div>`
          )}
          ${selectedRoom
            ? ['nw', 'ne', 'sw', 'se'].map((corner) => {
                const x = corner.includes('w') ? selectedRoom.x : selectedRoom.x + selectedRoom.w;
                const y = corner.includes('n') ? selectedRoom.y : selectedRoom.y + selectedRoom.h;
                return html`<div class="handle ${corner}" data-kind="handle" data-corner=${corner}
                  style="left: ${px(x)}%; top: ${py(y)}%;"></div>`;
              })
            : nothing}
          ${plan.items.map((it) => {
            const selected = sel && sel.kind === 'entity' && sel.index === it.index;
            const classes = ['e-entity', selected ? 'selected' : '', it.role === 'cover' ? (it.wall ? 'on-wall' : 'off-wall') : '', it.st ? '' : 'missing'];
            return html`<div class=${classes.join(' ')} data-kind="entity" data-index=${it.index}
              title=${friendlyName(this.hass, it.id)} style="left: ${px(it.x)}%; top: ${py(it.y)}%;">
              ${this._entityIcon(it.id, it.icon)}
            </div>`;
          })}
          ${ghost
            ? html`<div class="e-entity ghost" style="left: ${px(ghost.pos.x)}%; top: ${py(ghost.pos.y)}%;">
                ${this._entityIcon(ghost.id)}
              </div>`
            : nothing}
        </div>
        ${overlapping.size ? html`<div class="canvas-warning">Some rooms overlap</div>` : nothing}
      </div>
    `;
  }

  _entityIcon(entityId, icon) {
    if (icon) return html`<ha-icon icon=${icon}></ha-icon>`;
    const st = this.hass.states[entityId];
    if (!st) return html`<ha-icon icon="mdi:help-circle-outline"></ha-icon>`;
    return html`<ha-state-icon .hass=${this.hass} .stateObj=${st}></ha-state-icon>`;
  }

  _renderSelection(floor) {
    const sel = this._selection;
    if (sel && sel.kind === 'room' && floor.rooms && floor.rooms[sel.index]) {
      const room = floor.rooms[sel.index];
      return html`<div class="selection">
        <div class="selection-header">
          <ha-icon icon=${room.icon || 'mdi:floor-plan'}></ha-icon>
          <span>Room</span>
          <span class="dims">${room.w} × ${room.h}</span>
          <button class="btn danger" @click=${this._deleteSelection}>Delete room</button>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${room}
          .schema=${[
            { name: 'name', label: 'Name', selector: { text: {} } },
            { name: 'icon', label: 'Icon', selector: { icon: {} } },
          ]}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${(ev) => this._selectionChanged(ev, 'rooms')}
        ></ha-form>
      </div>`;
    }
    if (sel && sel.kind === 'entity' && floor.entities && floor.entities[sel.index]) {
      const ent = floor.entities[sel.index];
      const isCover = domainOf(ent.entity) === 'cover';
      const schema = [
        { name: 'entity', label: 'Entity', selector: { entity: {} } },
        {
          type: 'grid',
          name: '',
          schema: [
            { name: 'name', label: 'Name (optional)', selector: { text: {} } },
            { name: 'icon', label: 'Icon (optional)', selector: { icon: {} } },
          ],
        },
      ];
      if (isCover) {
        schema.push({ name: 'length', label: 'Window length', selector: { number: { min: 0.5, max: 8, step: 0.25, mode: 'box' } } });
      }
      return html`<div class="selection">
        <div class="selection-header">
          ${this._entityIcon(ent.entity, ent.icon)}
          <span>${friendlyName(this.hass, ent.entity)}</span>
          <button class="btn danger" @click=${this._deleteSelection}>Remove from plan</button>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${{ length: WINDOW_LENGTH, ...ent }}
          .schema=${schema}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${(ev) => this._selectionChanged(ev, 'entities')}
        ></ha-form>
      </div>`;
    }
    const floors = this._floors();
    return html`<div class="selection">
      <div class="selection-header">
        <ha-icon icon="mdi:layers-outline"></ha-icon>
        <span>Floor</span>
        ${floors.length > 1 ? html`<button class="btn danger" @click=${this._deleteFloor}>Delete floor</button>` : nothing}
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${{ name: floor.name || '' }}
        .schema=${[{ name: 'name', label: 'Floor name', selector: { text: {} } }]}
        .computeLabel=${(s) => s.label || s.name}
        @value-changed=${this._floorNameChanged}
      ></ha-form>
    </div>`;
  }

  // Cached: the editor re-renders on every pointer move while dragging.
  _paletteEntities(floors) {
    const key = [this.hass.states, this.hass.entities, this.hass.areas, floors, this._search, this._filter];
    if (!this._paletteKey || this._paletteKey.some((v, i) => v !== key[i])) {
      this._paletteKey = key;
      this._paletteCache = this._computePaletteEntities(floors);
    }
    return this._paletteCache;
  }

  _computePaletteEntities(floors) {
    const placed = new Set();
    for (const f of floors) for (const e of f.entities || []) placed.add(e.entity);

    const areaNames = {};
    for (const { id, areaId } of registryEntries(this.hass)) {
      if (areaId && this.hass.areas && this.hass.areas[areaId]) areaNames[id] = this.hass.areas[areaId].name;
    }
    const registry = this.hass.entities || {};
    const query = this._search.trim().toLowerCase();
    const filter = this._filter;
    const list = [];
    for (const [id, st] of Object.entries(this.hass.states)) {
      if (placed.has(id)) continue;
      const reg = registry[id];
      if (filter !== 'all' && reg && (reg.hidden || reg.entity_category)) continue;
      const domain = domainOf(id);
      const role = entityRole(id, st);
      const keep = {
        suggested: isSuggested(id, st),
        lights: domain === 'light',
        covers: domain === 'cover',
        sensors: domain === 'sensor' || domain === 'binary_sensor',
        switches: ['switch', 'input_boolean', 'fan'].includes(domain),
        all: true,
      }[filter];
      if (!keep) continue;
      const name = st.attributes.friendly_name || id;
      const area = areaNames[id] || '';
      if (query && !`${name} ${id} ${area}`.toLowerCase().includes(query)) continue;
      list.push({ id, name, area, role });
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return { list, placedCount: placed.size };
  }

  _renderPalette(floors) {
    const { list, placedCount } = this._paletteEntities(floors);
    const dragging = this._drag && this._drag.type === 'palette' ? this._drag.id : null;
    return html`<div class="palette">
      <div class="palette-header">
        <span>Entities</span>
        <span class="muted">${placedCount} on the plan · ${list.length} available</span>
      </div>
      <input
        class="search"
        type="search"
        placeholder="Search by name, entity id or area…"
        .value=${this._search}
        @input=${(ev) => (this._search = ev.target.value)}
      />
      <div class="filters">
        ${PALETTE_FILTERS.map(
          (f) => html`<button class="chip small ${this._filter === f.id ? 'active' : ''}" @click=${() => (this._filter = f.id)}>
            ${f.label}
          </button>`
        )}
      </div>
      <div class="palette-list">
        ${list.slice(0, PALETTE_LIMIT).map(
          (e) => html`<div
            class="palette-item ${dragging === e.id ? 'dragging' : ''}"
            title="Drag onto the plan, or click to place it in the selected room"
            @pointerdown=${(ev) => this._paletteDown(ev, e.id)}
            @pointermove=${this._paletteMove}
            @pointerup=${this._paletteUp}
            @pointercancel=${this._paletteCancel}
          >
            <span class="grip">${this._entityIcon(e.id)}</span>
            <span class="palette-text">
              <span class="palette-name">${e.name}</span>
              <span class="palette-sub">${e.id}${e.area ? ` · ${e.area}` : ''}</span>
            </span>
            <ha-icon class="drag-hint" icon="mdi:drag"></ha-icon>
          </div>`
        )}
        ${list.length > PALETTE_LIMIT
          ? html`<div class="muted more">${list.length - PALETTE_LIMIT} more: refine the search.</div>`
          : nothing}
        ${!list.length ? html`<div class="muted more">No entity matches.</div>` : nothing}
      </div>
    </div>`;
  }

  // --- Canvas pointer handling --------------------------------------------

  // Grid coordinates of a pointer event, and whether it is over the canvas.
  _canvasPoint(ev) {
    const el = this.renderRoot.querySelector('.canvas');
    const r = el.getBoundingClientRect();
    const ext = this._ext;
    return {
      x: ext.x + ((ev.clientX - r.left) / r.width) * ext.w,
      y: ext.y + ((ev.clientY - r.top) / r.height) * ext.h,
      inside: ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom,
    };
  }

  // Snapped position of an entity dropped at p: covers stick to the nearest wall.
  _entityDropPoint(entityId, p, floor) {
    if (domainOf(entityId) === 'cover') {
      const rooms = (floor.rooms || []).map(normalizeRoom);
      const wall = nearestWall(rooms, p.x, p.y, WALL_SNAP);
      if (wall) {
        const pos = round2(snap(wall.pos, ENTITY_SNAP));
        return wall.o === 'h' ? { x: pos, y: round2(wall.at) } : { x: round2(wall.at), y: pos };
      }
    }
    return { x: round2(snap(p.x, ENTITY_SNAP)), y: round2(snap(p.y, ENTITY_SNAP)) };
  }

  _canvasDown(ev) {
    if (ev.button !== 0) return;
    const target = ev.target.closest ? ev.target.closest('[data-kind]') : null;
    const kind = target ? target.dataset.kind : null;
    const floor = this._floors()[this._currentFloorIndex()];
    const p = this._canvasPoint(ev);
    const base = { start: p, moved: false, extent: this._ext, pointerId: ev.pointerId };
    ev.currentTarget.setPointerCapture(ev.pointerId);
    ev.currentTarget.focus();

    if (kind === 'entity') {
      const index = Number(target.dataset.index);
      const e = floor.entities[index];
      this._drag = { ...base, type: 'entity', index, id: e.entity, orig: { x: num(e.x), y: num(e.y) }, pos: { x: num(e.x), y: num(e.y) } };
    } else if (kind === 'handle' && this._selection && this._selection.kind === 'room') {
      const index = this._selection.index;
      const r = normalizeRoom(floor.rooms[index], index);
      this._drag = { ...base, type: 'resize', index, corner: target.dataset.corner, orig: r, rect: { x: r.x, y: r.y, w: r.w, h: r.h } };
    } else if (kind === 'room') {
      const index = Number(target.dataset.index);
      const r = normalizeRoom(floor.rooms[index], index);
      // Entities inside the room move with it.
      const plan = resolveFloor(this.hass, floor);
      const inner = plan.items.filter((it) => it.roomIndex === index).map((it) => ({ index: it.index, x: it.x, y: it.y }));
      this._drag = { ...base, type: 'move', index, orig: r, rect: { x: r.x, y: r.y, w: r.w, h: r.h }, inner, dx: 0, dy: 0 };
    } else {
      const x = snap(p.x, ROOM_SNAP);
      const y = snap(p.y, ROOM_SNAP);
      this._drag = { ...base, type: 'draw', origin: { x, y }, rect: { x, y, w: 0, h: 0 } };
    }
  }

  _canvasMove(ev) {
    const d = this._drag;
    if (!d || d.type === 'palette' || ev.pointerId !== d.pointerId) return;
    const p = this._canvasPoint(ev);
    const dx = p.x - d.start.x;
    const dy = p.y - d.start.y;
    if (!d.moved && Math.hypot(dx, dy) < 0.2) return;
    const next = { ...d, moved: true };

    const ext = d.extent;
    const inX = (v) => clamp(v, ext.x, ext.x + ext.w);
    const inY = (v) => clamp(v, ext.y, ext.y + ext.h);

    if (d.type === 'draw') {
      const x2 = inX(snap(p.x, ROOM_SNAP));
      const y2 = inY(snap(p.y, ROOM_SNAP));
      next.rect = { x: Math.min(d.origin.x, x2), y: Math.min(d.origin.y, y2), w: Math.abs(x2 - d.origin.x), h: Math.abs(y2 - d.origin.y) };
    } else if (d.type === 'move') {
      // Rooms can't leave the grid (it grows around them once dropped).
      next.dx = clamp(snap(dx, ROOM_SNAP), ext.x - d.orig.x, ext.x + ext.w - d.orig.x - d.orig.w);
      next.dy = clamp(snap(dy, ROOM_SNAP), ext.y - d.orig.y, ext.y + ext.h - d.orig.y - d.orig.h);
      next.rect = { ...d.rect, x: d.orig.x + next.dx, y: d.orig.y + next.dy };
    } else if (d.type === 'resize') {
      const o = d.orig;
      let left = o.x;
      let top = o.y;
      let right = o.x + o.w;
      let bottom = o.y + o.h;
      if (d.corner.includes('w')) left = Math.min(inX(snap(o.x + dx, ROOM_SNAP)), right - ROOM_SNAP);
      if (d.corner.includes('e')) right = Math.max(inX(snap(right + dx, ROOM_SNAP)), left + ROOM_SNAP);
      if (d.corner.includes('n')) top = Math.min(inY(snap(o.y + dy, ROOM_SNAP)), bottom - ROOM_SNAP);
      if (d.corner.includes('s')) bottom = Math.max(inY(snap(bottom + dy, ROOM_SNAP)), top + ROOM_SNAP);
      next.rect = { x: left, y: top, w: right - left, h: bottom - top };
    } else if (d.type === 'entity') {
      next.outside = !p.inside;
      const floor = this._floors()[this._currentFloorIndex()];
      next.pos = this._entityDropPoint(d.id, { x: d.orig.x + dx, y: d.orig.y + dy }, floor);
    }
    this._drag = next;
  }

  _canvasUp(ev) {
    const d = this._drag;
    if (!d || d.type === 'palette' || ev.pointerId !== d.pointerId) return;
    this._drag = null;

    if (!d.moved) {
      // A plain click selects what is under the pointer.
      if (d.type === 'entity') this._selection = { kind: 'entity', index: d.index };
      else if (d.type === 'move' || d.type === 'resize') this._selection = { kind: 'room', index: d.index };
      else this._selection = null;
      return;
    }

    if (d.type === 'draw') {
      if (d.rect.w < 1 || d.rect.h < 1) return;
      let newIndex = 0;
      this._editFloor((floor) => {
        floor.rooms.push({ name: `Room ${floor.rooms.length + 1}`, ...d.rect });
        newIndex = floor.rooms.length - 1;
      });
      this._selection = { kind: 'room', index: newIndex };
    } else if (d.type === 'move' || d.type === 'resize') {
      this._editFloor((floor) => {
        floor.rooms[d.index] = { ...floor.rooms[d.index], ...d.rect };
        if (d.type === 'move') {
          for (const inner of d.inner) {
            floor.entities[inner.index].x = round2(inner.x + d.dx);
            floor.entities[inner.index].y = round2(inner.y + d.dy);
          }
        }
      });
      this._selection = { kind: 'room', index: d.index };
    } else if (d.type === 'entity') {
      if (d.outside) {
        this._editFloor((floor) => floor.entities.splice(d.index, 1));
        this._selection = null;
      } else {
        this._editFloor((floor) => {
          floor.entities[d.index] = { ...floor.entities[d.index], ...d.pos };
        });
        this._selection = { kind: 'entity', index: d.index };
      }
    }
  }

  _canvasCancel() {
    if (this._drag && this._drag.type !== 'palette') this._drag = null;
  }

  _canvasKey(ev) {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') {
      ev.preventDefault();
      this._undo();
      return;
    }
    const sel = this._selection;
    if (ev.key === 'Escape') {
      this._selection = null;
      return;
    }
    if (!sel) return;
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      ev.preventDefault();
      this._deleteSelection();
      return;
    }
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!arrows[ev.key]) return;
    ev.preventDefault();
    const [ax, ay] = arrows[ev.key];
    if (sel.kind === 'room') {
      const step = ROOM_SNAP;
      this._editFloor((floor) => {
        const r = normalizeRoom(floor.rooms[sel.index], sel.index);
        if (ev.shiftKey) {
          // Shift + arrows resizes from the bottom-right corner.
          floor.rooms[sel.index] = { ...floor.rooms[sel.index], w: Math.max(step, r.w + ax * step), h: Math.max(step, r.h + ay * step) };
        } else {
          const plan = resolveFloor(this.hass, floor);
          floor.rooms[sel.index] = { ...floor.rooms[sel.index], x: r.x + ax * step, y: r.y + ay * step };
          for (const it of plan.items.filter((i) => i.roomIndex === sel.index)) {
            floor.entities[it.index].x = round2(it.x + ax * step);
            floor.entities[it.index].y = round2(it.y + ay * step);
          }
        }
      });
    } else {
      this._editFloor((floor) => {
        const e = floor.entities[sel.index];
        e.x = round2(num(e.x) + ax * ENTITY_SNAP);
        e.y = round2(num(e.y) + ay * ENTITY_SNAP);
      });
    }
  }

  // --- Palette drag & drop ------------------------------------------------

  _paletteDown(ev, entityId) {
    if (ev.button !== 0) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    this._drag = { type: 'palette', id: entityId, x: ev.clientX, y: ev.clientY, moved: false, overCanvas: false, pos: null };
  }

  _paletteMove(ev) {
    const d = this._drag;
    if (!d || d.type !== 'palette') return;
    if (!d.moved && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) < 6) return;
    const p = this._canvasPoint(ev);
    const floor = this._floors()[this._currentFloorIndex()];
    this._drag = { ...d, moved: true, overCanvas: p.inside, pos: this._entityDropPoint(d.id, p, floor) };
  }

  _paletteUp() {
    const d = this._drag;
    if (!d || d.type !== 'palette') return;
    this._drag = null;
    let pos = null;
    if (d.moved && d.overCanvas) pos = d.pos;
    if (!d.moved) pos = this._defaultDropPoint(d.id);
    if (!pos) return;
    let newIndex = 0;
    this._editFloor((floor) => {
      floor.entities.push({ entity: d.id, ...pos });
      newIndex = floor.entities.length - 1;
    });
    this._selection = { kind: 'entity', index: newIndex };
  }

  _paletteCancel() {
    if (this._drag && this._drag.type === 'palette') this._drag = null;
  }

  // Where a clicked (not dragged) palette entity goes: the selected room, or the middle of the plan.
  _defaultDropPoint(entityId) {
    const floor = this._floors()[this._currentFloorIndex()];
    const rooms = (floor.rooms || []).map(normalizeRoom);
    const sel = this._selection;
    let room = null;
    if (sel && sel.kind === 'room') room = rooms[sel.index];
    else if (sel && sel.kind === 'entity' && floor.entities[sel.index]) {
      const e = floor.entities[sel.index];
      room = rooms[roomAt(rooms, num(e.x), num(e.y))] || null;
    }
    const ext = this._ext;
    const center = room
      ? { x: room.x + room.w / 2, y: room.y + room.h / 2 }
      : { x: ext.x + ext.w / 2, y: ext.y + ext.h / 2 };
    if (domainOf(entityId) === 'cover' && room) {
      return this._entityDropPoint(entityId, { x: center.x, y: room.y }, floor);
    }
    return this._entityDropPoint(entityId, center, floor);
  }

  // --- Other editor actions -----------------------------------------------

  _formChanged(ev) {
    const value = { ...ev.detail.value };
    for (const key of ['temp_min', 'temp_max', 'title']) {
      if (value[key] === '' || value[key] === undefined || value[key] === null) delete value[key];
    }
    // ha-form gives back the whole data object: keep the floors untouched.
    const config = { ...value, floors: this._config.floors };
    if (config.floors === undefined) delete config.floors;
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  _selectionChanged(ev, listKey) {
    const sel = this._selection;
    const value = { ...ev.detail.value };
    for (const key of Object.keys(value)) {
      if (value[key] === '' || value[key] === undefined || value[key] === null) delete value[key];
    }
    if (listKey === 'entities' && num(value.length, WINDOW_LENGTH) === WINDOW_LENGTH) delete value.length;
    if (listKey === 'entities' && !value.entity) return;
    this._editFloor((floor) => {
      floor[listKey][sel.index] = value;
    }, `${this._currentFloorIndex()}:${listKey}:${sel.index}`);
  }

  _floorNameChanged(ev) {
    const name = ev.detail.value.name;
    this._editFloor((floor) => {
      floor.name = name;
    }, `${this._currentFloorIndex()}:name`);
  }

  _deleteSelection() {
    const sel = this._selection;
    if (!sel) return;
    this._editFloor((floor) => {
      (sel.kind === 'room' ? floor.rooms : floor.entities).splice(sel.index, 1);
    });
    this._selection = null;
  }

  _selectFloor(i) {
    this._floorIndex = i;
    this._selection = null;
    this._extentCache = null;
  }

  _addFloor() {
    const floors = JSON.parse(JSON.stringify(this._floors()));
    floors.push({ name: `Floor ${floors.length + 1}`, rooms: [], entities: [] });
    this._commitFloors(floors);
    this._floorIndex = floors.length - 1;
    this._selection = null;
  }

  _deleteFloor() {
    const floors = this._floors();
    const floor = floors[this._currentFloorIndex()];
    if (!window.confirm(`Delete the floor "${floor.name || 'Floor'}" and everything on it?`)) return;
    const next = floors.filter((_, i) => i !== this._currentFloorIndex());
    this._commitFloors(JSON.parse(JSON.stringify(next)));
    this._floorIndex = 0;
    this._selection = null;
  }

  _startBlank() {
    this._extentCache = null;
    this._commitFloors([{ name: 'Home', rooms: [], entities: [] }]);
    this._floorIndex = 0;
    this._selection = null;
  }

  _regenerate() {
    if (!window.confirm('Replace the whole plan (every floor) with one generated from your Home Assistant areas?')) return;
    this._extentCache = null;
    this._commitFloors(generateFromAreas(this.hass));
    this._floorIndex = 0;
    this._selection = null;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        container-type: inline-size;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
        --fp-wall: var(--primary-text-color, #e1e1e1);
      }
      .workspace {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .main {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      /* Narrow editor: the list comes right under the plan, so both fit on screen while dragging. */
      .palette {
        order: -1;
      }
      .main {
        display: contents;
      }
      .main > .canvas {
        order: -2;
      }
      @container (min-width: 560px) {
        .workspace {
          flex-direction: row;
          align-items: flex-start;
        }
        .main {
          display: flex;
          flex: 1;
        }
        .main > .canvas {
          order: 0;
        }
        .palette {
          order: 0;
          width: 210px;
          flex: none;
          position: sticky;
          top: 0;
        }
        .palette .palette-list {
          max-height: 420px;
        }
      }
      .section-title {
        margin-top: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        --mdc-icon-size: 16px;
      }
      .btn.flat {
        background: transparent;
        color: var(--primary-color);
        padding: 6px 8px;
      }
      .btn[disabled] {
        color: var(--disabled-text-color, #6f6f6f);
        cursor: default;
      }
      .btn.danger {
        margin-left: auto;
        background: transparent;
        color: var(--error-color, #db4437);
      }
      .floor-tabs {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .spacer {
        flex: 1;
      }
      .chip {
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--primary-text-color);
        border-radius: 14px;
        padding: 4px 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }
      .chip.small {
        padding: 2px 10px;
      }
      .chip.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .chip.add {
        border-style: dashed;
        color: var(--secondary-text-color);
      }
      .hint {
        display: flex;
        gap: 8px;
        font-size: 12px;
        color: var(--secondary-text-color);
        --mdc-icon-size: 18px;
      }
      .hint ha-icon {
        flex: none;
      }
      .hint.generated {
        color: var(--primary-text-color);
      }
      .hint.generated ha-icon {
        color: var(--primary-color);
      }

      .canvas {
        position: relative;
        width: 100%;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.05));
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: crosshair;
        outline: none;
        overflow: hidden;
      }
      .canvas:focus-visible {
        border-color: var(--primary-color);
      }
      .canvas.removing {
        border-color: var(--error-color, #db4437);
        box-shadow: 0 0 0 2px var(--error-color, #db4437);
      }
      .layer,
      .overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .overlay {
        pointer-events: none;
      }
      .grid-line {
        fill: none;
        stroke: var(--fp-wall);
        stroke-opacity: 0.08;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
      }
      .e-room {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        stroke: var(--fp-wall);
        stroke-opacity: 0.35;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .e-room-hit {
        fill: transparent;
        cursor: move;
      }
      .e-room-hit:hover {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }
      .e-room.selected {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.22);
        stroke: var(--primary-color);
        stroke-opacity: 1;
        stroke-width: 2px;
      }
      .e-room.overlap {
        stroke: var(--error-color, #db4437);
        stroke-opacity: 1;
        stroke-dasharray: 4 3;
      }
      .e-outer {
        stroke: var(--fp-wall);
        stroke-opacity: 0.7;
        stroke-width: 3px;
        stroke-linecap: square;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .e-label {
        position: absolute;
        padding: 3px 6px;
        font-size: 11px;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .handle {
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color, #fff);
        transform: translate(-50%, -50%);
        pointer-events: auto;
        box-sizing: border-box;
      }
      .handle.nw,
      .handle.se {
        cursor: nwse-resize;
      }
      .handle.ne,
      .handle.sw {
        cursor: nesw-resize;
      }
      .e-entity {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        background: var(--card-background-color, #1c1c1c);
        color: var(--primary-text-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        pointer-events: auto;
        cursor: grab;
        --mdc-icon-size: 16px;
      }
      .e-entity.on-wall {
        border-radius: 4px;
        background: #8fd3ff;
        color: #1c2733;
      }
      .e-entity.off-wall {
        outline: 2px dashed var(--warning-color, #ffa600);
      }
      .e-entity.missing {
        border: 1px dashed var(--error-color, #db4437);
        color: var(--error-color, #db4437);
      }
      .e-entity.selected {
        box-shadow: 0 0 0 3px var(--primary-color);
      }
      .e-entity.ghost {
        opacity: 0.7;
        box-shadow: 0 0 0 2px var(--primary-color);
      }
      .canvas-warning {
        position: absolute;
        right: 8px;
        bottom: 6px;
        font-size: 11px;
        color: var(--error-color, #db4437);
        pointer-events: none;
      }

      .selection {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .selection-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .dims {
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .palette {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .palette-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .muted {
        font-size: 12px;
        font-weight: 400;
        color: var(--secondary-text-color);
      }
      .search {
        box-sizing: border-box;
        width: 100%;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, transparent);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
      }
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .palette-list {
        max-height: 200px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      .palette-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 4px;
        border-radius: 6px;
        cursor: grab;
        user-select: none;
        -webkit-user-select: none;
      }
      .palette-item:hover {
        background: rgba(127, 127, 127, 0.1);
      }
      .palette-item.dragging {
        opacity: 0.4;
      }
      .grip {
        width: 30px;
        height: 30px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(127, 127, 127, 0.12);
        color: var(--primary-text-color);
        /* Dragging from the icon also works on touch screens (the rest of the row scrolls the list). */
        touch-action: none;
        --mdc-icon-size: 18px;
      }
      .palette-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .palette-name {
        font-size: 13px;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .palette-sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .drag-hint {
        color: var(--secondary-text-color);
        --mdc-icon-size: 18px;
      }
      .more {
        padding: 8px 4px;
      }
    `;
  }
}

if (!customElements.get('ha-plooum-floorplan-card')) {
  customElements.define('ha-plooum-floorplan-card', HaPlooumFloorplanCard);
}
if (!customElements.get('ha-plooum-floorplan-card-editor')) {
  customElements.define('ha-plooum-floorplan-card-editor', HaPlooumFloorplanCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'ha-plooum-floorplan-card')) {
  window.customCards.push({
    type: 'ha-plooum-floorplan-card',
    name: 'Ha Plooum Floorplan Card',
    description: 'A live floor plan of your home: draw your rooms, drop your devices on it, and watch lights, temperatures and covers in real time.',
    preview: true,
  });
}
