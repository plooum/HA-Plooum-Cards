import { LitElement, html, css, svg, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

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
  { id: 'cameras', label: 'Cameras' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'switches', label: 'Switches' },
  { id: 'all', label: 'All' },
];

// Card options shown in the editor with their default value, and left out of the config when unchanged.
const CARD_DEFAULTS = { view: '2d', camera_view: 'snapshot', screen_mode: 'world', roof: true };
// Where camera screens are shown in 3D: in the scene in front of their camera, floating flat on the
// view next to it, or nowhere (the camera bar still flies to them).
const SCREEN_MODES = ['world', 'billboard', 'none'];

// Cameras (2D cone and 3D screen). Angles in degrees; `direction` is clockwise from the top of the plan.
const CAMERA_FOV = 90;
const CAMERA_HEIGHT = 2.2; // above the floor (grid units)
const CAMERA_TILT = 15; // downwards
const CAMERA_REACH = 2.5; // 2D cone length when no wall is in front of the camera
const SCREEN_SIZE = 2.4; // max screen width in 3D (grid units)
const SCREEN_DISTANCE = 2.5; // max distance from the camera to its screen in 3D (grid units)
const SCREEN_PX = 480; // raster width of a screen: keeps the image sharp when zoomed in
const SHORT_BEAM = 0.7; // beam length when the screen isn't in the scene (grid units)
const STRIP_HEIGHT = 44; // px kept free at the bottom of the 3D view for the camera bar
const PROJ_PX = 640; // raster width of a picture projected onto the floor and walls
const PROJ_REACH = 25; // projected pictures stop this far from their camera (grid units)
const REFRESH_INTERVAL = 3; // s between two snapshots of a camera
const AIM_HANDLE = 1.25; // distance from a camera to its aim handle in the editor (grid units)
const CALIB_COLORS = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff']; // numbered points of the camera point matching
// Camera options left out of the config when they keep their default value.
const CAMERA_KEYS = ['fov', 'tilt', 'height', 'screen_size', 'screen_distance'];

// 3D view. Grid units are meant as meters: walls are 2.5 units high by default.
const U3 = 100; // px per grid unit in the 3D scene
const WALL_HEIGHT = 2.5;
const SLAB = 0.25; // thickness between two floors
const WALL_CAP = 0.12; // wall thickness, drawn as a cap on top of each wall
const CUT_HEIGHT = 0.35; // height of the walls cut away in front of the viewer
const ROOF_PITCH = 0.7; // rise per run (35°)
const ROOF_OVERHANG = 0.25;
const GROUND_MARGIN = 4; // lawn around the home (grid units)
const ORBIT_DEFAULT = { az: -25, tilt: 55 };
const TILT_MIN = 0;
const TILT_MAX = 88;

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
  if (domain === 'camera') return 'camera';
  if (domain === 'sensor' && dc === 'temperature') return 'temperature';
  if (domain === 'sensor' && dc === 'humidity') return 'humidity';
  if (domain === 'sensor') return 'sensor';
  if (domain === 'binary_sensor' && OPENING_CLASSES.includes(dc)) return 'opening';
  if (domain === 'binary_sensor' && PRESENCE_CLASSES.includes(dc)) return 'presence';
  return 'device';
}

// Role on the plan once the entity's `light` option is applied: `light: true` makes an on/off device
// (a plug powering a lamp…) light up its room like a light, `light: false` stops a light from doing so.
function itemRole(conf, st) {
  const role = entityRole(conf.entity, st);
  if (conf.light === true && role === 'device') return 'light';
  if (conf.light === false && role === 'light') return 'device';
  return role;
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
    outdoor: !!r.outdoor,
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
  // Outdoor rooms (garden, terrace) have no walls: no windows on them, no outer wall around them.
  const indoor = rooms.filter((r) => !r.outdoor);
  const items = ((floor && floor.entities) || []).map((e, index) => {
    const id = e.entity;
    const st = hass.states[id];
    const role = itemRole(e, st);
    const x = num(e.x);
    const y = num(e.y);
    const wall = role === 'cover' ? nearestWall(indoor, x, y, ON_WALL_EPS * 2) : null;
    return { index, id, st, role, x, y, wall, roomIndex: roomAt(rooms, x, y), icon: e.icon, name: e.name, length: e.length, conf: e };
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

  for (const it of items) {
    if (it.role === 'camera') it.camera = cameraSetup(it, rooms, indoor);
  }

  return { rooms, indoor, items, bounds, exterior: exteriorSegments(indoor) };
}

function roomTemperature(room) {
  if (room.temps.length) {
    return room.temps.reduce((s, it) => s + parseFloat(it.st.state), 0) / room.temps.length;
  }
  if (room.climateTemp) return room.climateTemp.st.attributes.current_temperature;
  return null;
}

// --- Cameras ----------------------------------------------------------------

const isNum = (v) => v !== undefined && v !== null && v !== '' && Number.isFinite(parseFloat(v));
const toRad = (deg) => (deg * Math.PI) / 180;
// Plan direction (clockwise from the top of the plan) of a vector, rounded to 5°.
const directionOf = (dx, dy) => ((Math.round(((Math.atan2(dx, -dy) * 180) / Math.PI) / 5) * 5) % 360 + 360) % 360;

// Distance from (x, y) along the unit vector (dx, dy) to the first wall further than `skip`, or null.
function raycast(rooms, x, y, dx, dy, skip = 0.15) {
  let best = null;
  for (const r of rooms) {
    for (const e of roomEdges(r)) {
      let t;
      let along;
      if (e.o === 'h') {
        if (Math.abs(dy) < 1e-9) continue;
        t = (e.at - y) / dy;
        along = x + t * dx;
      } else {
        if (Math.abs(dx) < 1e-9) continue;
        t = (e.at - x) / dx;
        along = y + t * dy;
      }
      if (t > skip && along >= e.a - 1e-6 && along <= e.b + 1e-6 && (best === null || t < best)) best = t;
    }
  }
  return best;
}

// Where a camera looks by default: the middle of its room, or away from the home when outdoors.
function defaultCameraDirection(rooms, indoor, x, y) {
  const room = rooms[roomAt(rooms, x, y)];
  let tx;
  let ty;
  if (room && !room.outdoor) {
    tx = room.x + room.w / 2 - x;
    ty = room.y + room.h / 2 - y;
  } else if (indoor.length) {
    const x1 = Math.min(...indoor.map((r) => r.x));
    const y1 = Math.min(...indoor.map((r) => r.y));
    const x2 = Math.max(...indoor.map((r) => r.x + r.w));
    const y2 = Math.max(...indoor.map((r) => r.y + r.h));
    tx = x - (x1 + x2) / 2;
    ty = y - (y1 + y2) / 2;
  } else {
    return 180;
  }
  return Math.hypot(tx, ty) < 0.01 ? 180 : directionOf(tx, ty);
}

// Orientation of a placed camera and how far it sees on the plan (up to the first wall).
function cameraSetup(item, rooms, indoor) {
  const c = item.conf || {};
  const direction = isNum(c.direction) ? num(c.direction) : defaultCameraDirection(rooms, indoor, item.x, item.y);
  const a = toRad(direction);
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  // Indoors when it stands in a room and looks into it; a camera on an outer wall looking out is outdoors.
  const inside = roomAt(indoor, item.x, item.y) >= 0 && roomAt(indoor, item.x + dx * 0.25, item.y + dy * 0.25) >= 0;
  return {
    direction,
    dx,
    dy,
    indoor: inside,
    fov: clamp(num(c.fov, CAMERA_FOV), 10, 170),
    height: isNum(c.height) ? num(c.height) : null, // default depends on the wall height (3D only)
    tilt: clamp(num(c.tilt, CAMERA_TILT), -45, 89),
    hit: raycast(indoor, item.x, item.y, dx, dy),
  };
}

// 2D view cone of a camera, as an SVG path (plan coordinates).
function conePath(item) {
  const cam = item.camera;
  const reach = cam.hit !== null ? Math.min(cam.hit, 8) : CAMERA_REACH;
  const half = toRad(Math.min(cam.fov, 160) / 2);
  const a = toRad(cam.direction);
  const p = (ang) => [item.x + Math.sin(ang) * reach, item.y - Math.cos(ang) * reach].map(round2);
  const [x1, y1] = p(a - half);
  const [x2, y2] = p(a + half);
  return `M ${item.x} ${item.y} L ${x1} ${y1} A ${reach} ${reach} 0 0 1 ${x2} ${y2} Z`;
}

// --- 3D geometry -------------------------------------------------------------
// The scene is made of flat HTML elements placed with CSS 3D transforms. World axes: x and y
// as on the plan, z upwards; 1 grid unit = U3 px.

const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len3 = (a) => Math.hypot(a[0], a[1], a[2]);
const norm3 = (a) => mul3(a, 1 / (len3(a) || 1));
const LIGHT_DIR = norm3([-0.5, -0.75, 0.6]);

// A flat element whose top-left corner is at `o` and whose top and left edges follow `u` and `v`
// (world units; they need not be perpendicular). `w` x `h` is its size in px: by default its real
// size, so that text and images are rasterized at the scene's scale.
function face(o, u, v, w = len3(u) * U3, h = len3(v) * U3) {
  const n = norm3(cross3(u, v));
  const m = [...mul3(u, U3 / w), 0, ...mul3(v, U3 / h), 0, ...n, 0, ...mul3(o, U3), 1];
  return { w: round2(w), h: round2(h), n, transform: `matrix3d(${m.map((x) => +x.toFixed(5)).join(',')})` };
}

// Brightness (%) of a face lit by a fixed light, whichever side is seen.
const shade = (n, min = 58) => Math.round(min + (100 - min) * Math.abs(dot3(n, LIGHT_DIR)));

// Wall segments of a floor: shared walls (`normal` null) and outer walls with their outward normal.
function wallSegments(rooms) {
  const lines = new Map();
  const add = (o, at, a, b, side) => {
    const key = `${o}:${round2(at)}`;
    if (!lines.has(key)) lines.set(key, { o, at, spans: [] });
    lines.get(key).spans.push({ a, b, side });
  };
  for (const r of rooms) {
    // `side`: +1 when the room lies after the line (larger x or y), -1 before it.
    add('h', r.y, r.x, r.x + r.w, 1);
    add('h', r.y + r.h, r.x, r.x + r.w, -1);
    add('v', r.x, r.y, r.y + r.h, 1);
    add('v', r.x + r.w, r.y, r.y + r.h, -1);
  }
  const out = [];
  for (const { o, at, spans } of lines.values()) {
    const points = [...new Set(spans.flatMap((s) => [s.a, s.b]))].sort((p, q) => p - q);
    let current = null;
    for (let i = 0; i + 1 < points.length; i++) {
      const a = points[i];
      const b = points[i + 1];
      const mid = (a + b) / 2;
      const covering = spans.filter((s) => s.a < mid && s.b > mid);
      if (!covering.length) {
        current = null;
        continue;
      }
      const after = covering.some((s) => s.side > 0);
      const before = covering.some((s) => s.side < 0);
      let normal = null;
      if (!(after && before)) {
        const k = after ? -1 : 1; // outwards: towards the side without a room
        normal = o === 'h' ? [0, k] : [k, 0];
      }
      const same = current && current.b === a && String(current.normal) === String(normal);
      if (same) current.b = b;
      else {
        current = { o, at, a, b, normal };
        out.push(current);
      }
    }
  }
  return out;
}

// Rectangles covering a floor's roof: the floor's footprint minus what the floors above cover.
// They may overlap: hip roofs of the same pitch on overlapping rectangles meet like a real roof.
function roofRects(rooms, above) {
  const xs = [...new Set([...rooms, ...above].flatMap((r) => [r.x, r.x + r.w]))].sort((a, b) => a - b);
  const ys = [...new Set([...rooms, ...above].flatMap((r) => [r.y, r.y + r.h]))].sort((a, b) => a - b);
  const nx = xs.length - 1;
  const ny = ys.length - 1;
  const strictly = (r, x, y) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
  const fp = [];
  for (let i = 0; i < nx; i++) {
    fp.push([]);
    for (let j = 0; j < ny; j++) {
      const cx = (xs[i] + xs[i + 1]) / 2;
      const cy = (ys[j] + ys[j + 1]) / 2;
      fp[i].push(rooms.some((r) => strictly(r, cx, cy)) && !above.some((r) => strictly(r, cx, cy)));
    }
  }
  const covered = fp.map((col) => col.map(() => false));
  const rowFull = (j, i0, i1) => {
    for (let i = i0; i <= i1; i++) if (!fp[i][j]) return false;
    return true;
  };
  const rects = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (!fp[i][j] || covered[i][j]) continue;
      // Largest rectangle of the footprint containing this cell.
      let lo = i;
      let hi = i;
      while (lo > 0 && fp[lo - 1][j]) lo--;
      while (hi < nx - 1 && fp[hi + 1][j]) hi++;
      let best = null;
      for (let i0 = lo; i0 <= i; i0++) {
        for (let i1 = i; i1 <= hi; i1++) {
          let j0 = j;
          let j1 = j;
          while (j0 > 0 && rowFull(j0 - 1, i0, i1)) j0--;
          while (j1 < ny - 1 && rowFull(j1 + 1, i0, i1)) j1++;
          const area = (xs[i1 + 1] - xs[i0]) * (ys[j1 + 1] - ys[j0]);
          if (!best || area > best.area) best = { i0, i1, j0, j1, area };
        }
      }
      for (let a = best.i0; a <= best.i1; a++) for (let b = best.j0; b <= best.j1; b++) covered[a][b] = true;
      rects.push({ x: xs[best.i0], y: ys[best.j0], w: xs[best.i1 + 1] - xs[best.i0], h: ys[best.j1 + 1] - ys[best.j0] });
    }
  }
  const inside = (a, b) => a !== b && a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
  return rects.filter((a) => !rects.some((b) => inside(a, b)));
}

// The 4 slopes of a hip roof on a rectangle whose walls stop at height z.
function hipRoof(rect, z) {
  const o = ROOF_OVERHANG;
  const x0 = rect.x - o;
  const y0 = rect.y - o;
  const x1 = rect.x + rect.w + o;
  const y1 = rect.y + rect.h + o;
  const eave = z - o * ROOF_PITCH;
  const run = Math.min(x1 - x0, y1 - y0) / 2;
  const sides = [
    { p: [x0, y0], q: [x1, y0], d: [0, 1] },
    { p: [x1, y0], q: [x1, y1], d: [-1, 0] },
    { p: [x1, y1], q: [x0, y1], d: [0, -1] },
    { p: [x0, y1], q: [x0, y0], d: [1, 0] },
  ];
  return sides.map(({ p, q, d }) => {
    const u = [q[0] - p[0], q[1] - p[1], 0];
    const v = [d[0] * run, d[1] * run, run * ROOF_PITCH];
    const k = round2((run / len3(u)) * 100);
    return {
      ...face([p[0], p[1], eave], u, v),
      clip: `polygon(0 0, 100% 0, ${100 - k}% 100%, ${k}% 100%)`,
      // Plane of the slope, for projected pictures: top-left corner, unit edges, upward normal.
      plane: { o: [p[0], p[1], eave], a: norm3(u), b: norm3(v), up: norm3(cross3(u, v)) },
    };
  });
}

// The 6 faces of a box centered on c, with half-extent vectors X, Y, Z. The +X face comes first.
function boxFaces(c, X, Y, Z) {
  const p = (sx, sy, sz) => add3(add3(add3(c, mul3(X, sx)), mul3(Y, sy)), mul3(Z, sz));
  return [
    face(p(1, -1, 1), mul3(Y, 2), mul3(Z, -2)),
    face(p(-1, -1, 1), mul3(Y, 2), mul3(Z, -2)),
    face(p(-1, -1, 1), mul3(X, 2), mul3(Y, 2)),
    face(p(-1, 1, -1), mul3(X, 2), mul3(Y, -2)),
    face(p(-1, -1, 1), mul3(X, 2), mul3(Z, -2)),
    face(p(-1, 1, 1), mul3(X, 2), mul3(Z, -2)),
  ];
}

// Do segments p1-p2 and q1-q2 (2D) cross?
function segmentsCross(p1, p2, q1, q2) {
  const orient = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  return orient(p1, p2, q1) * orient(p1, p2, q2) < 0 && orient(q1, q2, p1) * orient(q1, q2, p2) < 0;
}

// --- Camera model ------------------------------------------------------------
// A pinhole camera without lens distortion. Picture coordinates are in picture widths: the picture
// is 1 wide and 1 / aspect high, (0, 0) at its top-left corner, y downwards.

function cameraHeight(cam, wallHeight) {
  return cam.height !== null && cam.height !== undefined ? cam.height : Math.min(CAMERA_HEIGHT, wallHeight - 0.3);
}

// Camera standing at C (world): the picture's x follows `right`, its y follows -`up`, and `f` is the
// focal length in picture widths. `cam` needs dx, dy (plan direction), tilt and fov.
function cameraPose(cam, C) {
  const t = toRad(cam.tilt);
  const fwd = [cam.dx * Math.cos(t), cam.dy * Math.cos(t), -Math.sin(t)];
  const right = [-cam.dy, cam.dx, 0];
  return { C, fwd, right, up: cross3(fwd, right), f: 0.5 / Math.tan(toRad(cam.fov) / 2) };
}

const poseOf = (direction, tilt, fov, C) => cameraPose({ dx: Math.sin(toRad(direction)), dy: -Math.cos(toRad(direction)), tilt, fov }, C);

// Where a world point shows in the picture, or null when it is behind the camera.
function toPicture(pose, P, aspect) {
  const d = sub3(P, pose.C);
  const z = dot3(d, pose.fwd);
  if (z < 1e-3) return null;
  return [0.5 + (dot3(d, pose.right) / z) * pose.f, 0.5 / aspect - (dot3(d, pose.up) / z) * pose.f];
}

// The point of the horizontal plane z = planeZ seen at a point of the picture, or null.
function fromPicture(pose, uv, aspect, planeZ) {
  const dir = add3(add3(pose.fwd, mul3(pose.right, (uv[0] - 0.5) / pose.f)), mul3(pose.up, (0.5 / aspect - uv[1]) / pose.f));
  const s = (planeZ - pose.C[2]) / dir[2];
  return s > 0 ? add3(pose.C, mul3(dir, s)) : null;
}

// Keeps the part of a convex polygon where g(p) >= 0.
function clipPolygon(poly, g) {
  const out = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const gp = g(p);
    const gq = g(q);
    if (gp >= 0) out.push(p);
    if (gp >= 0 !== gq >= 0) {
      const t = gp / (gp - gq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return out;
}

const mul33 = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
const cssNum = (v) => +v.toPrecision(8);

// A camera's picture as projected onto a plane, the way a projector standing where the camera is
// would light it. The plane is a face whose top-left corner is `o` and whose edges follow the
// orthonormal vectors `a` and `b` (U3 px per grid unit). Returns an element of `w` x `h` px placed
// in the face with `transform`, holding the picture (`iw` x `ih` px) placed with `img`; or null when
// the camera doesn't see the plane.
//
// The picture-to-face mapping is a homography, which matrix3d() can express. It is only valid where
// the camera's rays hit the plane in front of it (w > 0): the element is cut to that part of the
// picture (and to PROJ_REACH), along the line where it ends, so that none of its corners is past it.
function projectedPicture(pose, aspect, o, a, b) {
  const iw = PROJ_PX;
  const ih = PROJ_PX / aspect;
  const { C, fwd, right, up, f } = pose;
  // Ray through the picture pixel (x, y): c0 x + c1 y + c2.
  const c0 = mul3(right, 1 / (f * iw));
  const c1 = mul3(up, -1 / (f * iw));
  const c2 = add3(sub3(fwd, mul3(right, 0.5 / f)), mul3(up, 0.5 / (aspect * f)));
  const row = (n) => [dot3(n, c0), dot3(n, c1), dot3(n, c2)];
  const n = cross3(a, b);
  const k = dot3(sub3(o, C), n); // signed distance from the camera to the plane
  if (Math.abs(k) < 1e-6) return null;
  // The ray (x, y) hits the plane at s = |k| / W(x, y): in front of the camera when W > 0.
  const W = row(n).map((v) => v * Math.sign(k));
  const ra = row(a);
  const rb = row(b);
  const ca = dot3(sub3(C, o), a);
  const cb = dot3(sub3(C, o), b);
  const ak = Math.abs(k);
  const Hm = [
    [0, 1, 2].map((i) => U3 * (ca * W[i] + ak * ra[i])),
    [0, 1, 2].map((i) => U3 * (cb * W[i] + ak * rb[i])),
    W,
  ];

  const wmin = ak / PROJ_REACH;
  const rect = [[0, 0], [iw, 0], [iw, ih], [0, ih]];
  const poly = clipPolygon(rect, (p) => W[0] * p[0] + W[1] * p[1] + W[2] - wmin);
  if (poly.length < 3) return null;
  // Element axes: e2 points away from the cut line (towards the camera), e1 along it.
  const gl = Math.hypot(W[0], W[1]);
  const e2 = gl > 1e-12 ? [W[0] / gl, W[1] / gl] : [0, 1];
  const e1 = [e2[1], -e2[0]];
  const s = poly.map((p) => p[0] * e1[0] + p[1] * e1[1]);
  const t = poly.map((p) => p[0] * e2[0] + p[1] * e2[1]);
  const s0 = Math.min(...s);
  const t0 = Math.min(...t);
  const w = Math.max(...s) - s0;
  const h = Math.max(...t) - t0;
  if (w < 1 || h < 1) return null;
  const O = [s0 * e1[0] + t0 * e2[0], s0 * e1[1] + t0 * e2[1]];
  // Element (x, y) -> picture O + x e1 + y e2 -> face.
  const M = mul33(Hm, [[e1[0], e2[0], O[0]], [e1[1], e2[1], O[1]], [0, 0, 1]]);
  const scale = Math.max(...M.flat().map(Math.abs));
  const m = M.map((r) => r.map((v) => cssNum(v / scale)));
  return {
    w: round2(w),
    h: round2(h),
    iw,
    ih: round2(ih),
    transform: `matrix3d(${m[0][0]},${m[1][0]},0,${m[2][0]},${m[0][1]},${m[1][1]},0,${m[2][1]},0,0,1,0,${m[0][2]},${m[1][2]},0,${m[2][2]})`,
    img: `matrix(${cssNum(e1[0])},${cssNum(e2[0])},${cssNum(e1[1])},${cssNum(e2[1])},${cssNum(-(O[0] * e1[0] + O[1] * e1[1]))},${cssNum(-(O[0] * e2[0] + O[1] * e2[1]))})`,
    // Cut before the end of the picture: fade out towards the cut.
    fade: poly.length !== 4 || poly.some((p, i) => p[0] !== rect[i][0] || p[1] !== rect[i][1]),
  };
}

// Solves A x = b (Gaussian elimination), or null when A is singular.
function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-14) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const k = M[r][c] / M[c][c];
      for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

// Direction, tilt, field of view and height of a camera standing at (x, y) that best show each
// floor point `p` (plan) at `uv` (picture): Levenberg-Marquardt least squares, from a few starts.
// `rms` is the remaining error, in picture widths.
function solveCamera(start, x, y, pairs, aspect) {
  const lo = [-Infinity, -45, 10, 0.1];
  const hi = [Infinity, 89, 170, 10];
  const residuals = (q) => {
    const pose = poseOf(q[0], q[1], q[2], [x, y, q[3]]);
    return pairs.flatMap(({ p, uv }) => {
      const s = toPicture(pose, [p[0], p[1], 0], aspect);
      return s ? [s[0] - uv[0], s[1] - uv[1]] : [3, 3];
    });
  };
  const cost = (r) => r.reduce((sum, v) => sum + v * v, 0);
  const fit = (q0) => {
    let q = q0.map((v, j) => clamp(v, lo[j], hi[j]));
    let r = residuals(q);
    let c = cost(r);
    let lambda = 1e-3;
    for (let iter = 0; iter < 200 && c > 1e-14; iter++) {
      // J[j][i]: derivative of residual i by parameter j.
      const J = q.map((_, j) => {
        const h = j === 3 ? 1e-4 : 1e-3;
        const rp = residuals(q.map((v, l) => (l === j ? v + h : v)));
        const rm = residuals(q.map((v, l) => (l === j ? v - h : v)));
        return rp.map((v, i) => (v - rm[i]) / (2 * h));
      });
      const A = J.map((Jj) => J.map((Jl) => Jj.reduce((sum, v, i) => sum + v * Jl[i], 0)));
      const g = J.map((Jj) => -Jj.reduce((sum, v, i) => sum + v * r[i], 0));
      let next = null;
      while (lambda < 1e10) {
        const step = solveLinear(A.map((row, j) => row.map((v, l) => (j === l ? v + lambda * (v || 1e-9) : v))), g);
        if (step) {
          const qn = q.map((v, j) => clamp(v + step[j], lo[j], hi[j]));
          const rn = residuals(qn);
          if (cost(rn) < c) {
            next = { q: qn, r: rn };
            break;
          }
        }
        lambda *= 4;
      }
      if (!next) break;
      const gain = c - cost(next.r);
      ({ q, r } = next);
      c = cost(r);
      lambda = Math.max(lambda / 3, 1e-12);
      if (gain < 1e-14) break;
    }
    return { q, c };
  };
  // Starts: the current setting, and the camera looking at the points.
  const cx = pairs.reduce((sum, pr) => sum + pr.p[0], 0) / pairs.length - x;
  const cy = pairs.reduce((sum, pr) => sum + pr.p[1], 0) / pairs.length - y;
  const toward = (Math.atan2(cx, -cy) * 180) / Math.PI;
  const tilt = (Math.atan2(start.height, Math.hypot(cx, cy)) * 180) / Math.PI;
  const starts = [
    [start.direction, start.tilt, start.fov, start.height],
    ...[60, 90, 120].map((fov) => [toward, tilt, fov, start.height]),
  ];
  const best = starts.map(fit).reduce((a, b) => (b.c < a.c ? b : a));
  const [direction, t, fov, height] = best.q;
  return { direction: ((direction % 360) + 360) % 360, tilt: t, fov, height, rms: Math.sqrt(best.c / pairs.length) };
}

// Lines of a floor's rooms, as seen by its cameras: floor outlines, and the corners and tops of the walls.
function planLines(rooms, wallHeight) {
  const lines = [];
  for (const r of rooms) {
    const c = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
    c.forEach((p, i) => {
      const q = c[(i + 1) % 4];
      lines.push({ P: [...p, 0], Q: [...q, 0], outdoor: r.outdoor });
      if (r.outdoor) return;
      lines.push({ P: [...p, 0], Q: [...p, wallHeight] });
      lines.push({ P: [...p, wallHeight], Q: [...q, wallHeight] });
    });
  }
  return lines;
}

// A world segment in the picture (cut where it passes behind the camera), or null.
function segmentToPicture(pose, P, Q, aspect) {
  const near = 0.05;
  const dP = dot3(sub3(P, pose.C), pose.fwd);
  const dQ = dot3(sub3(Q, pose.C), pose.fwd);
  if (dP < near && dQ < near) return null;
  const cut = (A, B, dA, dB) => (dA >= near ? A : add3(A, mul3(sub3(B, A), (near - dA) / (dB - dA))));
  const a = toPicture(pose, cut(P, Q, dP, dQ), aspect);
  const b = toPicture(pose, cut(Q, P, dQ, dP), aspect);
  return a && b ? [a, b] : null;
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
      _view: { state: true },
      _level3d: { state: true },
      _orbit: { state: true },
      _focus: { state: true },
      _dragging3d: { state: true },
      _tick: { state: true },
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
    this._view = null; // '2d' | '3d', from the config until the user switches
    this._level3d = null; // floors shown in 3D: up to this index; floors.length = the closed house, with its roof
    this._orbit = null; // 3D point of view, null = framed automatically
    this._focus = null; // camera whose screen the 3D view is zoomed on
    this._dragging3d = false;
    this._pointers = new Map();
    this._aspects = {}; // camera id -> image aspect ratio, learned when its image loads
    this._tick = 0; // bumps every refresh_interval: reloads camera snapshots
    this._wheelListener = { handleEvent: (ev) => this._wheel3d(ev), passive: false };
    this._onKeyDown = (ev) => {
      // Keys meant for dialogs (the more-info of a camera) or fields: leave the view as it is then.
      if (ev.composedPath().some((n) => n.localName && (n.localName.includes('dialog') || ['input', 'textarea'].includes(n.localName)))) return;
      if (ev.key === 'Escape') {
        if (this._selectedRoom !== null) this._selectedRoom = null;
        if (this._view === '3d') this._resetView();
      } else if ((ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') && this._view === '3d' && this._focus) {
        ev.preventDefault();
        this._cycleFocus(ev.key === 'ArrowLeft' ? -1 : 1);
      }
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
    this._startRefresh();
  }

  updated(changed) {
    // Keep the camera zoomed on visible in the camera bar.
    if (changed.has('_focus') && this._focus) {
      const bar = this.renderRoot.querySelector('.cambar');
      const chip = bar && bar.querySelector('.camchip.active');
      if (chip) bar.scrollTo({ left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._onKeyDown);
    this._resizeObserver.disconnect();
    clearTimeout(this._holdTimer);
    clearInterval(this._refreshTimer);
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    if (config.floors !== undefined && !Array.isArray(config.floors)) {
      throw new Error('floors must be a list');
    }
    if (config.view !== undefined && !['2d', '3d'].includes(config.view)) {
      throw new Error('view must be 2d or 3d');
    }
    if (config.screen_mode !== undefined && !SCREEN_MODES.includes(config.screen_mode)) {
      throw new Error(`screen_mode must be one of ${SCREEN_MODES.join(', ')}`);
    }
    // A new `view` or `roof` in the config (editor) is applied; otherwise the user's choice stays.
    if (!this.config || this.config.view !== config.view) this._view = config.view || '2d';
    if (!this.config || this.config.roof !== config.roof) this._level3d = null;
    const refreshChanged = !this.config || this.config.refresh_interval !== config.refresh_interval;
    this.config = config;
    if (refreshChanged && this.isConnected) this._startRefresh();
  }

  // Camera snapshots are reloaded periodically, only while the 3D view is shown. Projected pictures
  // are snapshots even with `camera_view: live`.
  _startRefresh() {
    clearInterval(this._refreshTimer);
    if (!this.config) return;
    const seconds = Math.max(1, num(this.config.refresh_interval, REFRESH_INTERVAL));
    this._refreshTimer = setInterval(() => {
      if (this._view === '3d' && !document.hidden) this._tick++;
    }, seconds * 1000);
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
    const is3d = this._view === '3d';
    const empty = is3d
      ? floors.every((f) => !(f.rooms || []).length && !(f.entities || []).length)
      : !plan.rooms.length && !plan.items.length;
    const level = this._level(floors);

    return html`
      <ha-card>
        <div class="header">
          <div class="title">${this.config.title || ''}</div>
          <div class="floors">
            ${is3d
              ? html`${floors.map(
                    (f, i) => html`<button class="chip ${i === level ? 'active' : ''}" @click=${() => this._setLevel(i)}
                      title="Show this floor and the ones below">${f.name || `Floor ${i + 1}`}</button>`
                  )}<button class="chip ${level === floors.length ? 'active' : ''}" @click=${() => this._setLevel(floors.length)}
                    title="Whole home, with its roof"><ha-icon icon="mdi:home-roof"></ha-icon></button>`
              : floors.length > 1
                ? floors.map(
                    (f, i) => html`<button
                      class="chip ${i === floorIndex ? 'active' : ''}"
                      @click=${() => this._selectFloor(i)}
                    >${f.name || `Floor ${i + 1}`}</button>`
                  )
                : nothing}
            <div class="seg" role="group" aria-label="View">
              <button class=${is3d ? '' : 'active'} @click=${() => this._setView('2d')} title="Floor plan">2D</button>
              <button class=${is3d ? 'active' : ''} @click=${() => this._setView('3d')} title="3D view">3D</button>
            </div>
          </div>
        </div>
        ${empty
          ? html`<div class="empty">
              <ha-icon icon="mdi:floor-plan"></ha-icon>
              <div>No plan yet. Edit this card to draw your home and place your devices.</div>
            </div>`
          : is3d
            ? this._renderScene3d(floors, level)
            : this._renderPlan(plan, selected)}
        ${selected && !is3d ? this._renderPanel(selected) : nothing}
      </ha-card>
    `;
  }

  _setView(view) {
    this._view = view;
    this._selectedRoom = null;
    if (view === '3d') this._tick++;
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
    const dimItem = (it) => (selected && it.roomIndex !== selected.index ? 'dim' : '');
    const cameras = plan.items.filter((it) => it.camera && it.st && !isUnavailable(it.st));
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
              ${cameras.map(
                (it) => svg`<radialGradient id="cone-${it.index}" gradientUnits="userSpaceOnUse" cx=${it.x} cy=${it.y}
                  r=${it.camera.hit !== null ? Math.min(it.camera.hit, 8) : CAMERA_REACH}>
                  <stop offset="0" stop-color="var(--fp-camera)" stop-opacity="0.45"></stop>
                  <stop offset="1" stop-color="var(--fp-camera)" stop-opacity="0.04"></stop>
                </radialGradient>`
              )}
            </defs>
            ${plan.rooms.map((room) => {
              if (room.outdoor) {
                return svg`<rect class="floor outdoor ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h}></rect>`;
              }
              const t = roomTemperature(room);
              const fill = t === null ? 'var(--fp-floor)' : rgba(tempRgb(t, min, max), 0.3);
              return svg`<rect class="floor ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h} style="fill: ${fill};"></rect>`;
            })}
            ${cameras.map(
              // An indoor camera's cone stays in its room.
              (it) => svg`<path class="cone ${dimItem(it)}" d=${conePath(it)} fill="url(#cone-${it.index})"
                clip-path=${it.camera.indoor && it.roomIndex >= 0 ? `url(#clip-${it.roomIndex})` : nothing}></path>`
            )}
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
              (room) => svg`<rect class="wall ${room.outdoor ? 'outdoor' : ''} ${dim(room)}" x=${room.x} y=${room.y} width=${room.w} height=${room.h}></rect>`
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

  // --- 3D view -------------------------------------------------------------

  _wallHeight() {
    return Math.max(1, num(this.config.wall_height, WALL_HEIGHT));
  }

  // Floors shown in 3D: up to the returned index; floors.length means the whole home, with its roof.
  _level(floors) {
    if (this._level3d !== null) return clamp(this._level3d, 0, floors.length);
    return this.config.roof === false ? floors.length - 1 : floors.length;
  }

  _setLevel(level) {
    this._level3d = level;
    this._focus = null;
  }

  // Size of the 3D viewport and its perspective distance (px).
  _viewport3d() {
    const w = Math.max(200, (this._width || 600) - 2 * CARD_PADDING);
    const h = Math.round(clamp(w * 0.62, 260, Math.max(260, window.innerHeight * 0.75)));
    return { w, h, p: Math.round(1.6 * Math.max(w, 400)) };
  }

  // Every floor resolved and stacked: floor k stands at z0.
  _plans3d(floors, level) {
    const H = this._wallHeight();
    const top = Math.min(level, floors.length - 1);
    const all = floors.map((f, k) => ({ ...resolveFloor(this.hass, f), k, z0: k * (H + SLAB) }));
    return { H, top, roof: level >= floors.length, all, shown: all.slice(0, top + 1) };
  }

  // Point of view framing the shown floors, used until the user moves the view.
  _homeView(s, vp) {
    const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const p of s.shown) {
      b.minX = Math.min(b.minX, p.bounds.minX);
      b.minY = Math.min(b.minY, p.bounds.minY);
      b.maxX = Math.max(b.maxX, p.bounds.maxX);
      b.maxY = Math.max(b.maxY, p.bounds.maxY);
    }
    const zTop = s.shown[s.top].z0 + s.H;
    const diag = Math.hypot(b.maxX - b.minX, b.maxY - b.minY, zTop) * U3;
    return {
      ...ORBIT_DEFAULT,
      target: [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, zTop / 3],
      dist: (vp.p * diag) / Math.min(0.8 * vp.w, 1.1 * vp.h),
    };
  }

  _currentOrbit() {
    return { ...(this._orbit || this._scene3dState.home) };
  }

  _renderScene3d(floors, level) {
    const vp = this._viewport3d();
    const s = this._plans3d(floors, level);
    const home = this._homeView(s, vp);
    const orbit = this._orbit || home;
    const a = toRad(orbit.az);
    const t = toRad(orbit.tilt);
    const d = orbit.dist / U3;
    const eye = [
      orbit.target[0] + Math.sin(t) * Math.sin(a) * d,
      orbit.target[1] + Math.sin(t) * Math.cos(a) * d,
      orbit.target[2] + Math.cos(t) * d,
    ];
    const mode = this.config.screen_mode || 'world';
    const { faces, screens } = this._buildScene(s, eye, [Math.sin(a), Math.cos(a)], mode);
    // Every camera of the home, for the camera bar, even those whose floor isn't shown.
    const cameras = s.all.flatMap((p) => p.items.filter((it) => it.role === 'camera').map((it) => ({ id: it.id, item: it, k: p.k })));
    this._scene3dState = { vp, home, screens, cameras, floors: floors.length };
    const boards = mode === 'billboard' && !this._focus ? this._layoutBillboards(screens, orbit, vp) : [];

    const [tx, ty, tz] = orbit.target.map((v) => round2(-v * U3));
    const world = `translateZ(${round2(vp.p - orbit.dist)}px) rotateX(${round2(orbit.tilt)}deg) rotateZ(${round2(orbit.az)}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`;
    const dark = this.hass.themes && this.hass.themes.darkMode;
    return html`
      <div
        class="view3d ${this._dragging3d ? 'dragging' : ''} ${dark ? 'dark' : ''}"
        style="height: ${vp.h}px; perspective: ${vp.p}px;"
        @pointerdown=${this._down3d}
        @pointermove=${this._move3d}
        @pointerup=${this._up3d}
        @pointercancel=${this._up3d}
        @wheel=${this._wheelListener}
        @dblclick=${this._resetView}
        @contextmenu=${(ev) => ev.preventDefault()}
      >
        <div class="world" style="transform: ${world};">
          <div class="group">${faces.map((x) => this._face3d(x))}</div>
          <div class="group">${repeat(screens.filter((sc) => sc.inWorld), (sc) => sc.id, (sc) => this._renderScreen(sc))}</div>
        </div>
        ${boards.length ? this._renderBillboards(boards) : nothing}
        ${this._renderCameraBar()}
        <div class="tools">
          <button class="tool" title="Zoom in" @click=${() => this._zoom3d(1 / 1.3)}><ha-icon icon="mdi:plus"></ha-icon></button>
          <button class="tool" title="Zoom out" @click=${() => this._zoom3d(1.3)}><ha-icon icon="mdi:minus"></ha-icon></button>
          <button class="tool" title="Whole home (Escape)" @click=${this._resetView}><ha-icon icon="mdi:home-outline"></ha-icon></button>
        </div>
        ${this._focus ? html`<div class="hint3d">Tap the screen again for the camera's details</div>` : nothing}
      </div>
    `;
  }

  _face3d(x) {
    return html`<div
      class="f ${x.cls}"
      style="width: ${x.f.w}px; height: ${x.f.h}px; transform: ${x.f.transform};${x.clip ? ` clip-path: ${x.clip};` : ''} ${x.style || ''}"
    >${x.content || nothing}</div>`;
  }

  // Faces of the scene for a point of view: `eye` is the viewer's position, `toViewer` the
  // horizontal direction from the scene towards the viewer (walls facing it are cut away).
  _buildScene(s, eye, toViewer, mode) {
    const H = s.H;
    const faces = [];
    const screens = [];
    const { min, max } = this._tempRange();
    const wallColor = (n) => `background: color-mix(in srgb, var(--fp3-wall) ${shade(n)}%, #000);`;
    const X = [1, 0, 0];
    const Y = [0, 1, 0];
    // Room names on the floor turn by quarter turns, so that they read upright from the viewer.
    const labelTurn = (((Math.round(-Math.atan2(toViewer[0], toViewer[1]) / (Math.PI / 2)) * 90) % 360) + 360) % 360;

    // Cameras first: the walls between the viewer and the screen zoomed on are cut away.
    let sight = null;
    const projectors = [];
    for (const p of s.shown) {
      for (const it of p.items) {
        if (it.role !== 'camera') continue;
        const indoor = it.camera.indoor;
        // Hidden inside the home (under the roof or a floor above): not rendered, no snapshot loaded.
        if (indoor && (s.roof || p.k < s.top)) continue;
        // The screen zoomed on is always in the scene, whatever the screen mode.
        const sc = this._camera3d(it, p, indoor, H, eye, faces, mode === 'world' || this._focus === it.id);
        screens.push(sc);
        if (this._focus === it.id) sight = [[eye[0], eye[1]], [sc.center[0], sc.center[1]]];
        if (it.conf.projection && it.st && !isUnavailable(it.st) && it.st.attributes.entity_picture) {
          projectors.push({ it, k: p.k, indoor, pose: sc.pose, room: indoor ? p.indoor[roomAt(p.indoor, it.x, it.y)] : null });
        }
      }
    }
    // A projected picture goes onto the floor and walls of the camera's room, or outdoors onto the
    // ground, the outdoor rooms of its floor, and the outer walls and roof slopes facing it.
    const indoorProjectors = (k, room = null) => projectors.filter((pr) => pr.indoor && pr.room && pr.k === k && (!room || pr.room === room));
    const outdoorProjectors = (k) => projectors.filter((pr) => !pr.indoor && (k === null || pr.k === k));

    // Lawn around the home.
    const g = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const p of s.all) {
      g.minX = Math.min(g.minX, p.bounds.minX - GROUND_MARGIN);
      g.minY = Math.min(g.minY, p.bounds.minY - GROUND_MARGIN);
      g.maxX = Math.max(g.maxX, p.bounds.maxX + GROUND_MARGIN);
      g.maxY = Math.max(g.maxY, p.bounds.maxY + GROUND_MARGIN);
    }
    const ground = face([g.minX, g.minY, -0.02], [g.maxX - g.minX, 0, 0], [0, g.maxY - g.minY, 0]);
    faces.push({
      f: ground,
      cls: 'ground',
      content: this._projections(outdoorProjectors(null), [g.minX, g.minY, -0.02], X, Y, [0, 0, ground.w, ground.h], 'on-ground'),
    });

    for (const p of s.shown) {
      const isTop = p.k === s.top;
      const cutaway = isTop && !s.roof;

      for (const room of p.rooms) {
        const f0z = p.z0 + (room.outdoor ? 0.005 : 0.01);
        const f = face([room.x, room.y, f0z], [room.w, 0, 0], [0, room.h, 0]);
        const layers = [];
        for (const it of room.lights) {
          if (!isActive(it.st)) continue;
          const c = lightRgb(it.st);
          const b = typeof it.st.attributes.brightness === 'number' ? it.st.attributes.brightness / 255 : 1;
          const cx = round2((it.x - room.x) * U3);
          const cy = round2((it.y - room.y) * U3);
          layers.push(`radial-gradient(circle at ${cx}px ${cy}px, ${rgba(c, 0.35 + 0.5 * b)}, ${rgba(c, 0)} ${round2(Math.max(room.w, room.h) * 0.7 * U3)}px)`);
        }
        const temp = room.outdoor ? null : roomTemperature(room);
        if (temp !== null) layers.push(`linear-gradient(${rgba(tempRgb(temp, min, max), 0.25)}, ${rgba(tempRgb(temp, min, max), 0.25)})`);
        layers.push(room.outdoor ? 'var(--fp3-terrace)' : 'var(--fp3-floor)');
        faces.push({
          f,
          cls: room.outdoor ? 'floor3d outdoor' : 'floor3d',
          style: `background: ${layers.join(', ')};`,
          content: html`${this._projections(room.outdoor ? outdoorProjectors(p.k) : indoorProjectors(p.k, room), [room.x, room.y, f0z], X, Y, [0, 0, f.w, f.h])}${
            cutaway && room.name ? this._label3d(room, labelTurn) : nothing
          }`,
        });
      }

      // Walls: the outer ones on every floor shown (they also cover the slab), the inner ones only
      // on the top floor when the roof is off. Those facing the viewer are cut low, like a dollhouse.
      const segments = wallSegments(p.indoor);
      for (const seg of segments) {
        const outer = !!seg.normal;
        if (!outer && !cutaway) continue;
        const ends = seg.o === 'h' ? [[seg.a, seg.at], [seg.b, seg.at]] : [[seg.at, seg.a], [seg.at, seg.b]];
        seg.cut =
          (cutaway && outer && seg.normal[0] * toViewer[0] + seg.normal[1] * toViewer[1] > 0.2) ||
          (!!sight && segmentsCross(sight[0], sight[1], ends[0], ends[1]));
        const top = p.z0 + (seg.cut ? CUT_HEIGHT : H);
        const bottom = p.k > 0 ? p.z0 - SLAB : 0;
        const len = seg.b - seg.a;
        const u = seg.o === 'h' ? [len, 0, 0] : [0, len, 0];
        const f = face([...ends[0], top], u, [0, 0, bottom - top]);
        // Pictures of the cameras of the rooms along this wall, above their floor.
        const pictures = indoorProjectors(p.k).map((pr) => {
          const r = pr.room;
          const edge = roomEdges(r).find((e) => e.o === seg.o && Math.abs(e.at - seg.at) < ON_WALL_EPS);
          const a = edge ? Math.max(seg.a, edge.a) : 0;
          const b = edge ? Math.min(seg.b, edge.b) : 0;
          if (b - a < ON_WALL_EPS) return nothing;
          // Seen from the room only: from the other side, the wall hides what the camera sees.
          const roomSide = (seg.o === 'h' ? r.y + r.h / 2 : r.x + r.w / 2) - seg.at;
          if (roomSide * ((seg.o === 'h' ? eye[1] : eye[0]) - seg.at) <= 0) return nothing;
          return this._projections([pr], [...ends[0], top], seg.o === 'h' ? X : Y, [0, 0, -1], [(a - seg.a) * U3, 0, (b - a) * U3, (top - p.z0) * U3]);
        });
        // Outer walls facing an outdoor camera, seen from outside.
        if (outer) {
          const k = seg.o === 'h' ? 1 : 0;
          for (const pr of outdoorProjectors(null)) {
            if ((pr.pose.C[k] - seg.at) * seg.normal[k] <= 0.05 || (eye[k] - seg.at) * seg.normal[k] <= 0) continue;
            pictures.push(this._projections([pr], [...ends[0], top], seg.o === 'h' ? X : Y, [0, 0, -1], [0, 0, f.w, f.h]));
          }
        }
        faces.push({ f, cls: outer ? 'wall' : 'wall inner', style: wallColor(f.n), content: pictures.length ? pictures : nothing });
        const capOrigin = seg.o === 'h' ? [seg.a, seg.at - WALL_CAP / 2, top] : [seg.at - WALL_CAP / 2, seg.a, top];
        faces.push({ f: face(capOrigin, u, seg.o === 'h' ? [0, WALL_CAP, 0] : [WALL_CAP, 0, 0]), cls: 'cap' });
      }

      // Windows: covers on an outer wall, on both sides of it.
      for (const it of p.items) {
        if (it.role !== 'cover' || !it.wall || !it.st) continue;
        const w = it.wall;
        const seg = segments.find(
          (sg) => sg.normal && sg.o === w.o && Math.abs(sg.at - w.at) < ON_WALL_EPS && w.pos >= sg.a - ON_WALL_EPS && w.pos <= sg.b + ON_WALL_EPS
        );
        if (!seg || seg.cut) continue;
        const len = Math.min(num(it.length, WINDOW_LENGTH), w.b - w.a);
        const center = clamp(w.pos, w.a + len / 2, w.b - len / 2);
        const sill = p.z0 + H * 0.36;
        const top = p.z0 + H * 0.84;
        for (const side of [0.02, -0.02]) {
          const o = seg.o === 'h' ? [center - len / 2, seg.at + seg.normal[1] * side, top] : [seg.at + seg.normal[0] * side, center - len / 2, top];
          faces.push({
            f: face(o, seg.o === 'h' ? [len, 0, 0] : [0, len, 0], [0, 0, sill - top]),
            cls: `window3d ${isUnavailable(it.st) ? 'unavailable' : ''}`,
            style: `--closed: ${100 - coverPosition(it.st)}%;`,
            content: html`<div class="shutter3d"></div>`,
          });
        }
      }
    }

    // Roofs: on each floor shown, over the part that no floor shown above covers.
    for (const p of s.roof ? s.shown : s.shown.slice(0, -1)) {
      const above = s.shown.filter((q) => q.k > p.k).flatMap((q) => q.indoor);
      for (const rect of roofRects(p.indoor, above)) {
        for (const r of hipRoof(rect, p.z0 + H)) {
          // Slopes facing an outdoor camera get its picture.
          const { o, a, b, up } = r.plane;
          const seenBy = outdoorProjectors(null).filter((pr) => dot3(sub3(pr.pose.C, o), up) > 0.05 && dot3(sub3(eye, o), up) > 0);
          faces.push({
            f: r,
            cls: 'roof',
            clip: r.clip,
            style: `background-color: color-mix(in srgb, var(--fp3-roof) ${shade(r.n, 45)}%, #000);`,
            content: this._projections(seenBy, o, a, b, [0, 0, r.w, r.h]),
          });
        }
      }
    }
    return { faces, screens };
  }

  // A camera in 3D: its body, its screen in front of it (up to the first wall), and the beam between them.
  // `inWorld` false: the screen is shown elsewhere (or not at all), and a short beam shows where it looks.
  _camera3d(it, p, indoor, H, eye, faces, inWorld) {
    const cam = it.camera;
    const conf = it.conf;
    const pose = cameraPose(cam, [it.x, it.y, p.z0 + cameraHeight(cam, H)]);
    const { C, fwd, right, up } = pose;
    const t = toRad(cam.tilt);

    const maxDistance = Math.max(0.5, num(conf.screen_distance, SCREEN_DISTANCE));
    const flat = Math.max(0.4, cam.hit !== null ? Math.min(cam.hit - 0.2, maxDistance) : maxDistance);
    const dist = flat / Math.max(Math.cos(t), 0.2);
    const aspect = this._aspects[it.id] || 16 / 9;
    let w = Math.min(2 * dist * Math.tan(toRad(cam.fov) / 2), Math.max(0.3, num(conf.screen_size, SCREEN_SIZE)));
    let h = w / aspect;
    const center = add3(C, mul3(fwd, dist));
    // Keep the screen above the floor, and below the ceiling indoors.
    const floorZ = p.z0 + 0.05;
    const ceilZ = indoor ? p.z0 + H - 0.05 : Infinity;
    let half = (h / 2) * Math.abs(up[2]);
    if (2 * half > ceilZ - floorZ) {
      const k = (ceilZ - floorZ) / (2 * half);
      w *= k;
      h *= k;
      half *= k;
    }
    if (center[2] - half < floorZ) center[2] = floorZ + half;
    if (center[2] + half > ceilZ) center[2] = ceilZ - half;

    // Seen from behind the camera, the image reads as the camera sees it.
    const tl = add3(sub3(center, mul3(right, w / 2)), mul3(up, h / 2));
    const u = mul3(right, w);
    const v = mul3(up, -h);
    const f = face(tl, u, v, SCREEN_PX, SCREEN_PX / aspect);

    // From the other side (in front of the camera), the image is flipped so that it stays readable.
    const screen = { id: it.id, item: it, f, back: dot3(sub3(eye, center), f.n) < 0, center, w, h, cam, k: p.k, indoor, pose, inWorld };
    // Zoomed on: the view stands right behind the camera, whose body and beam would hide the screen.
    if (this._focus === it.id) return screen;

    const lens = add3(C, mul3(fwd, 0.17));
    let corners = [tl, add3(tl, u), add3(add3(tl, u), v), add3(tl, v)];
    if (!inWorld) corners = corners.map((c) => add3(C, mul3(sub3(c, C), SHORT_BEAM / dist)));
    corners.forEach((c, i) => {
      const next = corners[(i + 1) % 4];
      faces.push({ f: face(c, sub3(next, c), sub3(lens, c), 100, 100), cls: 'beam', clip: 'polygon(0 0, 100% 0, 0 100%)' });
    });
    boxFaces(C, mul3(fwd, 0.17), mul3(right, 0.1), mul3(up, 0.09)).forEach((bf, i) =>
      faces.push({ f: bf, cls: i === 0 ? 'cam lens' : 'cam', style: `background-color: color-mix(in srgb, #4a5058 ${shade(bf.n, 40)}%, #000);` })
    );
    return screen;
  }

  _renderScreen(sc) {
    const st = sc.item.st;
    const classes = [
      'f',
      'screen',
      sc.back ? 'back' : '',
      this._focus === sc.id ? 'focused' : '',
      !st ? 'missing' : isUnavailable(st) ? 'unavailable' : '',
    ].join(' ');
    return html`<div class=${classes} data-id=${sc.id} title=${this._cameraName(sc.item)}
      style="width: ${sc.f.w}px; height: ${sc.f.h}px; transform: ${sc.f.transform};">
      ${this._screenContent(sc.item, this._focus === sc.id)}
    </div>`;
  }

  _cameraName(item) {
    return item.name || (item.st ? friendlyName(this.hass, item.id) : item.id);
  }

  // What a camera's screen shows: its picture (`live`: its live stream) and its name, or why it can't.
  _screenContent(item, live = false) {
    const st = item.st;
    let content;
    if (!st) {
      content = html`<div class="screen-msg"><ha-icon icon="mdi:help-circle-outline"></ha-icon><span>${item.id}: entity not found</span></div>`;
    } else if (isUnavailable(st)) {
      content = html`<div class="screen-msg"><ha-icon icon="mdi:cctv-off"></ha-icon><span>${formatState(this.hass, st)}</span></div>`;
    } else {
      content = this._cameraImage(st, live);
    }
    return html`<div class="screen-inner">${content}<div class="screen-name">${this._cameraName(item)}</div></div>`;
  }

  // Floating screens (`screen_mode: billboard`): flat on the view, next to their camera, always readable.
  _renderBillboards(boards) {
    const vp = this._scene3dState.vp;
    return html`<div class="boards">
      <svg class="leaders" width=${vp.w} height=${vp.h}>
        ${boards.map(
          (b) => svg`<line x1=${b.ax} y1=${b.ay} x2=${clamp(b.ax, b.x, b.x + b.w)} y2=${clamp(b.ay, b.y, b.y + b.h)}></line>
            <circle cx=${b.ax} cy=${b.ay} r="3.5"></circle>`
        )}
      </svg>
      ${repeat(
        boards,
        (b) => b.sc.id,
        (b) => {
          const st = b.sc.item.st;
          return html`<div class="board screen ${!st ? 'missing' : isUnavailable(st) ? 'unavailable' : ''}" data-id=${b.sc.id}
            title=${this._cameraName(b.sc.item)} style="left: ${b.x}px; top: ${b.y}px; width: ${b.w}px; height: ${b.h}px;">
            ${this._screenContent(b.sc.item)}
          </div>`;
        }
      )}
    </div>`;
  }

  // Where each billboard goes: next to its camera (above it when there is room), avoiding the others.
  _layoutBillboards(screens, orbit, vp) {
    const w = Math.round(clamp(vp.w * 0.2, 120, 220));
    const bottom = vp.h - STRIP_HEIGHT;
    const anchored = screens
      .map((sc) => ({ sc, at: this._project(orbit, vp, sc.pose.C) }))
      .filter((b) => b.at && b.at[0] >= 0 && b.at[0] <= vp.w && b.at[1] >= 0 && b.at[1] <= vp.h)
      .sort((a, b) => a.at[1] - b.at[1]);
    const placed = [];
    for (const { sc, at } of anchored) {
      const h = Math.round(w / (this._aspects[sc.id] || 16 / 9));
      const [ax, ay] = at;
      const gap = 16;
      const spots = [
        [ax - w / 2, ay - gap - h],
        [ax - w / 2, ay + gap],
        [ax + gap, ay - h / 2],
        [ax - gap - w, ay - h / 2],
      ].map(([x, y]) => ({ x: Math.round(clamp(x, 6, vp.w - w - 6)), y: Math.round(clamp(y, 6, Math.max(6, bottom - h))), w, h }));
      const overlap = (r) =>
        placed.reduce((s, o) => s + Math.max(0, Math.min(r.x + w, o.x + o.w) - Math.max(r.x, o.x)) * Math.max(0, Math.min(r.y + h, o.y + o.h) - Math.max(r.y, o.y)), 0);
      let best = spots[0];
      let bestOverlap = overlap(best);
      for (const spot of spots.slice(1)) {
        if (!bestOverlap) break;
        const o = overlap(spot);
        if (o < bestOverlap) [best, bestOverlap] = [spot, o];
      }
      placed.push({ sc, ax: Math.round(ax), ay: Math.round(ay), ...best });
    }
    return placed;
  }

  // Screen position (px, from the top-left corner of the view) of a world point, or null behind the viewer.
  // Mirrors the transform of `.world` and the perspective of `.view3d`.
  _project(orbit, vp, P) {
    const a = toRad(orbit.az);
    const t = toRad(orbit.tilt);
    const [x, y, z] = sub3(P, orbit.target).map((v) => v * U3);
    const x1 = x * Math.cos(a) - y * Math.sin(a);
    const y1 = x * Math.sin(a) + y * Math.cos(a);
    const y2 = y1 * Math.cos(t) - z * Math.sin(t);
    const z2 = y1 * Math.sin(t) + z * Math.cos(t) + vp.p - orbit.dist;
    if (z2 > vp.p - 1) return null;
    const k = vp.p / (vp.p - z2);
    return [vp.w / 2 + x1 * k, vp.h / 2 + y2 * k];
  }

  // Bar of the home's cameras: a tap flies to a camera (opening its floor if needed).
  _renderCameraBar() {
    const cams = this._scene3dState.cameras;
    if (!cams.length) return nothing;
    return html`<div class="cambar">
      ${cams.map((c) => {
        const st = c.item.st;
        const state = !st ? 'missing' : isUnavailable(st) ? 'unavailable' : '';
        return html`<button class="camchip ${this._focus === c.id ? 'active' : ''} ${state}" title=${this._cameraName(c.item)}
          @click=${() => this._focusCamera(c.id)}>
          <ha-icon icon=${state ? 'mdi:cctv-off' : 'mdi:cctv'}></ha-icon><span>${this._cameraName(c.item)}</span>
        </button>`;
      })}
    </div>`;
  }

  async _focusCamera(id) {
    if (!this._scene3dState.screens.some((sc) => sc.id === id)) {
      // Not in the scene: open its floor first (indoor cameras only show on an open floor).
      const cam = this._scene3dState.cameras.find((c) => c.id === id);
      if (!cam) return;
      this._setLevel(cam.k);
      await this.updateComplete;
    }
    this._screenTap(id);
  }

  // Next or previous camera of the bar, while zoomed on one.
  _cycleFocus(step) {
    const cams = this._scene3dState.cameras;
    const i = cams.findIndex((c) => c.id === this._focus);
    if (i < 0) return;
    this._focusCamera(cams[(i + step + cams.length) % cams.length].id);
  }

  // Name of a room on its floor in 3D, turned by `turn` degrees (a multiple of 90) around the room.
  _label3d(room, turn) {
    const w = room.w * U3;
    const h = room.h * U3;
    const corner = { 0: [0, 0], 90: [w, 0], 180: [w, h], 270: [0, h] }[turn];
    return html`<div class="label3d" style="transform: translate(${corner[0]}px, ${corner[1]}px) rotate(${turn}deg) translate(16px, 12px);
      max-width: ${Math.max(0, (turn % 180 ? h : w) - 32)}px;">
      ${room.icon ? html`<ha-icon icon=${room.icon}></ha-icon>` : nothing}<span>${room.name}</span>
    </div>`;
  }

  // Pictures of `projectors` cast onto a face whose top-left corner is `o` and whose edges follow the
  // unit vectors `a` and `b`, kept within `box` ([left, top, width, height], px of the face).
  _projections(projectors, o, a, b, box, cls = '') {
    if (!projectors.length) return nothing;
    const origin = add3(add3(o, mul3(a, box[0] / U3)), mul3(b, box[1] / U3));
    return projectors.map(({ it, pose }) => {
      const st = it.st;
      const pr = projectedPicture(pose, this._aspects[it.id] || 16 / 9, origin, a, b);
      if (!pr) return nothing;
      const pic = st.attributes.entity_picture;
      return html`<div class="proj ${cls}" style="left: ${round2(box[0])}px; top: ${round2(box[1])}px; width: ${round2(box[2])}px; height: ${round2(box[3])}px;">
        <div class="proj-e ${pr.fade ? 'fade' : ''}" style="width: ${pr.w}px; height: ${pr.h}px; transform: ${pr.transform};">
          <img alt="" src="${pic}${pic.includes('?') ? '&' : '?'}t=${this._tick}" style="width: ${pr.iw}px; height: ${pr.ih}px; transform: ${pr.img};"
            @load=${(ev) => this._learnAspect(it.id, ev.target)} />
        </div>
      </div>`;
    });
  }

  // Snapshot reloaded every refresh_interval, or the live stream (`camera_view: live`, or `live`).
  _cameraImage(st, live = false) {
    const id = st.entity_id;
    const learn = (ev) => this._learnAspect(id, ev.target);
    if (live || this.config.camera_view === 'live') {
      if (customElements.get('ha-camera-stream')) {
        return html`<ha-camera-stream .hass=${this.hass} .stateObj=${st} muted></ha-camera-stream>`;
      }
      return html`<img alt="" src="/api/camera_proxy_stream/${id}?token=${st.attributes.access_token}" @load=${learn} />`;
    }
    const pic = st.attributes.entity_picture;
    if (!pic) return html`<div class="screen-msg"><ha-icon icon="mdi:cctv"></ha-icon></div>`;
    return html`<img alt="" src="${pic}${pic.includes('?') ? '&' : '?'}t=${this._tick}" @load=${learn} />`;
  }

  _learnAspect(id, img) {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const aspect = img.naturalWidth / img.naturalHeight;
    if (Math.abs(aspect - (this._aspects[id] || 16 / 9)) > 0.01) {
      this._aspects[id] = aspect;
      this.requestUpdate();
    }
  }

  // Drag: orbit (right button or Shift: pan); two fingers: zoom and pan; tap on a screen: zoom on it.
  _down3d(ev) {
    const path = ev.composedPath();
    if (path.some((n) => n.classList && (n.classList.contains('tools') || n.classList.contains('cambar')))) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    this._pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const screen = path.find((n) => n.classList && n.classList.contains('screen'));
    this._startGesture(this._pointers.size === 1 && screen ? screen.dataset.id : null, ev.button === 2 || ev.shiftKey);
  }

  _startGesture(screenId = null, pan = false) {
    const pts = [...this._pointers.values()];
    this._gesture = {
      orbit: this._currentOrbit(),
      screenId,
      pan,
      moved: pts.length > 1,
      x: pts[0].x,
      y: pts[0].y,
      pinch:
        pts.length > 1
          ? { d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
          : null,
    };
  }

  _move3d(ev) {
    const g = this._gesture;
    if (!g || !this._pointers.has(ev.pointerId)) return;
    this._pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const o = g.orbit;
    const pts = [...this._pointers.values()];
    let next;
    if (g.pinch && pts.length > 1) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const zoomed = { ...o, dist: this._clampDist((o.dist * g.pinch.d) / Math.max(d, 1)) };
      next = this._panned(zoomed, (pts[0].x + pts[1].x) / 2 - g.pinch.x, (pts[0].y + pts[1].y) / 2 - g.pinch.y);
    } else {
      const dx = ev.clientX - g.x;
      const dy = ev.clientY - g.y;
      if (!g.moved && Math.hypot(dx, dy) < 6) return;
      g.moved = true;
      next = g.pan ? this._panned(o, dx, dy) : { ...o, az: o.az - dx * 0.35, tilt: clamp(o.tilt - dy * 0.3, TILT_MIN, TILT_MAX) };
    }
    this._dragging3d = true;
    this._orbit = next;
  }

  _up3d(ev) {
    if (!this._pointers.has(ev.pointerId)) return;
    this._pointers.delete(ev.pointerId);
    const g = this._gesture;
    if (this._pointers.size) {
      // One finger left after a pinch: it orbits from here.
      this._startGesture();
      this._gesture.moved = true;
      return;
    }
    this._gesture = null;
    this._dragging3d = false;
    if (g && !g.moved && g.screenId && ev.type === 'pointerup') this._screenTap(g.screenId);
  }

  _wheel3d(ev) {
    ev.preventDefault();
    const o = this._currentOrbit();
    this._dragging3d = true; // no easing between wheel steps
    clearTimeout(this._wheelTimer);
    this._wheelTimer = setTimeout(() => (this._dragging3d = false), 200);
    this._orbit = { ...o, dist: this._clampDist(o.dist * Math.exp(ev.deltaY * 0.0015)) };
  }

  _zoom3d(k) {
    const o = this._currentOrbit();
    this._orbit = { ...o, dist: this._clampDist(o.dist * k) };
  }

  _clampDist(dist) {
    const home = this._scene3dState.home.dist;
    return clamp(dist, home * 0.06, home * 3);
  }

  // Moves the target so that the scene follows the pointer (dx, dy in px).
  _panned(o, dx, dy) {
    const k = o.dist / this._scene3dState.vp.p / U3; // grid units per px, at the target
    const a = toRad(o.az);
    const c = Math.max(Math.cos(toRad(o.tilt)), 0.35);
    return {
      ...o,
      target: [
        o.target[0] - (Math.cos(a) * dx + (Math.sin(a) * dy) / c) * k,
        o.target[1] - (-Math.sin(a) * dx + (Math.cos(a) * dy) / c) * k,
        o.target[2],
      ],
    };
  }

  _resetView() {
    this._orbit = null;
    this._focus = null;
  }

  // First tap: fly behind the camera, facing its screen. Second tap: its more-info dialog (live view).
  _screenTap(id) {
    if (this._focus === id) {
      this._moreInfo(id);
      return;
    }
    const state = this._scene3dState;
    const sc = state.screens.find((x) => x.id === id);
    if (!sc) return;
    const { vp } = state;
    const current = this._currentOrbit();
    let az = -sc.cam.direction;
    az += Math.round((current.az - az) / 360) * 360;
    this._focus = id;
    this._orbit = {
      az,
      tilt: clamp(90 - sc.cam.tilt - 8, 35, 82),
      dist: Math.max((sc.w * U3 * vp.p) / (0.8 * vp.w), (sc.h * U3 * vp.p) / (0.7 * vp.h)),
      target: sc.center,
    };
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
        --fp-camera: var(--primary-color, #03a9f4);
        --fp-outdoor: rgba(102, 160, 90, 0.16);
        /* 3D view */
        --fp3-wall: #ece7df;
        --fp3-cap: #6b6660;
        --fp3-floor: #c9ae8c;
        --fp3-roof: #a9573f;
        --fp3-ground: #7da267;
        --fp3-terrace: #bdb5a6;
        --fp3-beam: 120, 200, 255;
        --fp3-sky: linear-gradient(180deg, #cfe3f3 0%, #eef3f6 100%);
        --fp3-sky-dark: linear-gradient(180deg, #0f161d 0%, #1f2a34 100%);
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
      .chip ha-icon {
        --mdc-icon-size: 16px;
        display: flex;
      }
      .floors .chip {
        display: inline-flex;
        align-items: center;
      }
      .seg {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 14px;
        overflow: hidden;
      }
      .seg button {
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        padding: 4px 10px;
        font: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .seg button.active {
        background: var(--primary-color);
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
      .floor.outdoor {
        fill: var(--fp-outdoor);
      }
      .wall.outdoor {
        stroke-dasharray: 4 4;
      }
      .cone {
        stroke: var(--fp-camera);
        stroke-opacity: 0.35;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
        transition: opacity 0.4s ease;
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

      /* --- 3D view --- */
      .view3d {
        position: relative;
        overflow: hidden;
        border-radius: 8px;
        background: var(--fp3-sky);
        perspective-origin: 50% 50%;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: grab;
      }
      .view3d.dark {
        --fp3-sky: var(--fp3-sky-dark);
      }
      .view3d.dragging {
        cursor: grabbing;
      }
      .world {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 0;
        height: 0;
        transform-style: preserve-3d;
        transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .view3d.dragging .world {
        transition: none;
      }
      .group {
        position: absolute;
        left: 0;
        top: 0;
        transform-style: preserve-3d;
      }
      .f {
        position: absolute;
        left: 0;
        top: 0;
        transform-origin: 0 0;
        box-sizing: border-box;
        pointer-events: none;
      }
      .f.ground {
        background: radial-gradient(closest-side, var(--fp3-ground) 70%, transparent);
      }
      .view3d.dark .f.ground {
        background: radial-gradient(closest-side, color-mix(in srgb, var(--fp3-ground) 55%, #000) 70%, transparent);
      }
      .f.floor3d {
        box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.08);
      }
      .f.floor3d.outdoor {
        box-shadow: none;
        opacity: 0.8;
      }
      .label3d {
        position: absolute;
        left: 0;
        top: 0;
        transform-origin: 0 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 30px;
        font-weight: 500;
        white-space: nowrap;
        color: rgba(40, 30, 20, 0.75);
        --mdc-icon-size: 30px;
      }
      .label3d ha-icon {
        flex: none;
      }
      .label3d span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /* Camera pictures projected onto the floor and walls. */
      .proj {
        position: absolute;
        overflow: hidden;
        opacity: 0.92;
      }
      .proj.on-ground {
        -webkit-mask-image: radial-gradient(closest-side, #000 70%, transparent);
        mask-image: radial-gradient(closest-side, #000 70%, transparent);
      }
      .proj-e {
        position: absolute;
        left: 0;
        top: 0;
        overflow: hidden;
        transform-origin: 0 0;
      }
      .proj-e.fade {
        -webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%);
        mask-image: linear-gradient(to bottom, transparent, #000 30%);
      }
      .proj-e img {
        position: absolute;
        left: 0;
        top: 0;
        display: block;
        transform-origin: 0 0;
      }
      .f.wall.inner {
        opacity: 0.55;
      }
      .f.cap {
        background: var(--fp3-cap);
      }
      .f.roof {
        background-image: repeating-linear-gradient(to bottom, transparent 0 22px, rgba(0, 0, 0, 0.16) 22px 25px);
      }
      .f.beam {
        background: linear-gradient(to bottom, rgba(var(--fp3-beam), 0.3), rgba(var(--fp3-beam), 0.04));
      }
      .f.cam.lens {
        background-image: radial-gradient(circle, #9fd8ff 0 18%, #10161c 22% 42%, transparent 46%);
      }
      .f.window3d {
        background: linear-gradient(160deg, #b9e4ff, #6fb6e6);
        border: 4px solid #f5f2ec;
      }
      .f.window3d.unavailable {
        opacity: 0.5;
      }
      .shutter3d {
        height: var(--closed);
        background: repeating-linear-gradient(180deg, #6d7680 0 6px, #87909a 6px 12px);
        transition: height 0.4s ease;
      }
      .f.screen {
        pointer-events: auto;
        cursor: pointer;
        background: #000;
        border: 8px solid #1b1e22;
        border-radius: 8px;
        box-shadow: 0 0 40px rgba(var(--fp3-beam), 0.35);
      }
      .f.screen.focused {
        border-color: var(--primary-color);
      }
      .f.screen.missing {
        border: 6px dashed var(--warning-color, #ffa600);
        background: #222;
      }
      .f.screen.unavailable {
        animation: blink 1.6s ease-in-out infinite;
      }
      .screen-inner {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .f.screen.back .screen-inner {
        transform: scaleX(-1);
      }
      .screen-inner img,
      .screen-inner ha-camera-stream {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .screen-name {
        position: absolute;
        left: 8px;
        bottom: 8px;
        max-width: calc(100% - 16px);
        padding: 2px 10px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .screen-msg {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 16px;
        text-align: center;
        color: #9aa0a6;
        font-size: 24px;
        --mdc-icon-size: 72px;
      }
      .f.screen.missing .screen-msg {
        color: var(--warning-color, #ffa600);
      }
      .tools {
        position: absolute;
        right: 8px;
        bottom: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .tool {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        --mdc-icon-size: 20px;
      }
      /* Billboards: camera screens flat on the view, linked to their camera. */
      .boards {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .leaders {
        position: absolute;
        left: 0;
        top: 0;
        overflow: visible;
      }
      .leaders line {
        stroke: rgba(var(--fp3-beam), 0.85);
        stroke-width: 1.5px;
      }
      .leaders circle {
        fill: rgb(var(--fp3-beam));
        stroke: #fff;
        stroke-width: 1.5px;
      }
      .leaders line,
      .leaders circle,
      .board {
        transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .view3d.dragging .leaders line,
      .view3d.dragging .leaders circle,
      .view3d.dragging .board {
        transition: none;
      }
      .board {
        position: absolute;
        box-sizing: border-box;
        pointer-events: auto;
        cursor: pointer;
        background: #000;
        border: 3px solid #1b1e22;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
      }
      .board:hover {
        border-color: var(--primary-color);
      }
      .board.missing {
        border: 2px dashed var(--warning-color, #ffa600);
        background: #222;
      }
      .board.unavailable {
        animation: blink 1.6s ease-in-out infinite;
      }
      .board .screen-name {
        left: 4px;
        bottom: 4px;
        max-width: calc(100% - 8px);
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 11px;
      }
      .board .screen-msg {
        font-size: 11px;
        gap: 2px;
        padding: 0 6px;
        --mdc-icon-size: 26px;
      }
      .board.missing .screen-msg {
        color: var(--warning-color, #ffa600);
      }
      .cambar {
        position: absolute;
        left: 8px;
        right: 52px;
        bottom: 8px;
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .camchip {
        flex: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        max-width: 160px;
        padding: 4px 10px 4px 7px;
        border: none;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
        --mdc-icon-size: 16px;
      }
      .camchip span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .camchip.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .camchip.unavailable,
      .camchip.missing {
        color: #9aa0a6;
      }
      .camchip.missing ha-icon {
        color: var(--warning-color, #ffa600);
      }
      .hint3d {
        position: absolute;
        left: 50%;
        top: 10px;
        transform: translateX(-50%);
        padding: 4px 12px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 12px;
        pointer-events: none;
        animation: reveal 0.3s ease;
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
      _calib: { state: true },
      _snapTick: { state: true },
    };
  }

  constructor() {
    super();
    this._calib = null; // point matching of the selected camera: { index, id, img: [[u, v]], plan: [[x, y]], solution }
    this._snapTick = 0; // bumps to reload the camera view's snapshot
    this._aspects = {}; // camera id -> picture aspect ratio
    this._picWidths = {}; // camera id -> picture width (px), to show the matching error in pixels
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
          {
            name: 'view',
            label: 'Opens in',
            selector: { select: { mode: 'dropdown', options: [{ value: '2d', label: '2D plan' }, { value: '3d', label: '3D view' }] } },
          },
          { name: 'wall_height', label: 'Wall height (3D)', selector: { number: { min: 1, max: 6, step: 0.1, mode: 'box' } } },
          {
            name: 'camera_view',
            label: 'Camera screens (3D)',
            selector: {
              select: { mode: 'dropdown', options: [{ value: 'snapshot', label: 'Snapshots' }, { value: 'live', label: 'Live streams' }] },
            },
          },
          { name: 'refresh_interval', label: 'Snapshot refresh (s)', selector: { number: { min: 1, max: 60, step: 1, mode: 'box' } } },
          {
            name: 'screen_mode',
            label: 'Camera screens placement (3D)',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'world', label: 'In the scene, in front of the camera' },
                  { value: 'billboard', label: 'Floating next to the camera' },
                  { value: 'none', label: 'Hidden (camera bar only)' },
                ],
              },
            },
          },
        ],
      },
      { name: 'roof', label: 'Show the roof when the 3D view opens', selector: { boolean: {} } },
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
          .data=${{ ...this._config, ...Object.fromEntries(Object.entries(CARD_DEFAULTS).filter(([k]) => !(k in this._config))) }}
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
    if (d.type === 'aim') {
      copy.entities[d.index] = { ...copy.entities[d.index], direction: d.direction };
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
    // Aim handle of the selected camera, in front of it.
    const selectedItem = sel && sel.kind === 'entity' ? plan.items[sel.index] : null;
    const aim =
      selectedItem && selectedItem.camera
        ? { item: selectedItem, x: selectedItem.x + selectedItem.camera.dx * AIM_HANDLE, y: selectedItem.y + selectedItem.camera.dy * AIM_HANDLE }
        : null;
    const calib = selectedItem ? this._activeCalib(selectedItem) : null;

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
            ${plan.rooms.map((r, i) => svg`<clipPath id="eclip-${i}"><rect x=${r.x} y=${r.y} width=${r.w} height=${r.h}></rect></clipPath>`)}
          </defs>
          <rect x=${ext.x} y=${ext.y} width=${ext.w} height=${ext.h} fill="url(#grid)"></rect>
          ${plan.rooms.map(
            (r, i) => svg`<rect class="e-room ${r.outdoor ? 'outdoor' : ''} ${selectedRoom && selectedRoom.index === i ? 'selected' : ''} ${overlapping.has(i) ? 'overlap' : ''}"
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
          ${plan.items
            .filter((it) => it.camera)
            .map(
              (it) => svg`<path class="e-cone" d=${conePath(it)}
                clip-path=${it.camera.indoor && it.roomIndex >= 0 ? `url(#eclip-${it.roomIndex})` : nothing}></path>`
            )}
          ${aim ? svg`<line class="e-aim" x1=${aim.item.x} y1=${aim.item.y} x2=${aim.x} y2=${aim.y}></line>` : nothing}
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
          ${aim
            ? html`<div class="handle aim" data-kind="aim" title="Drag to aim the camera"
                style="left: ${px(aim.x)}%; top: ${py(aim.y)}%;"></div>`
            : nothing}
          ${calib
            ? calib.plan.map(
                (p, i) => html`<div class="calib-pt" data-kind="calib" data-i=${i} title="Drag onto the spot of point ${i + 1} in the picture"
                  style="left: ${px(p[0])}%; top: ${py(p[1])}%; --c: ${CALIB_COLORS[i]};">${i + 1}</div>`
              )
            : nothing}
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
            { name: 'outdoor', label: 'Outdoor (garden, terrace): no walls nor roof', selector: { boolean: {} } },
          ]}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${(ev) => this._selectionChanged(ev, 'rooms')}
        ></ha-form>
      </div>`;
    }
    if (sel && sel.kind === 'entity' && floor.entities && floor.entities[sel.index]) {
      const ent = floor.entities[sel.index];
      const isCover = domainOf(ent.entity) === 'cover';
      const isCamera = domainOf(ent.entity) === 'camera';
      const naturalRole = entityRole(ent.entity, this.hass.states[ent.entity]);
      const canLight = naturalRole === 'light' || naturalRole === 'device';
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
      if (canLight) {
        schema.push({ name: 'light', label: 'Lights up the room (glows when on)', selector: { boolean: {} } });
      }
      if (isCover) {
        schema.push({ name: 'length', label: 'Window length', selector: { number: { min: 0.5, max: 8, step: 0.25, mode: 'box' } } });
      }
      if (isCamera) {
        schema.push(
          {
            name: 'direction',
            label: 'Direction (°, clockwise from the top of the plan; or drag the handle on the plan)',
            selector: { number: { min: 0, max: 355, step: 5, mode: 'slider' } },
          },
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'fov', label: 'Field of view (°)', selector: { number: { min: 20, max: 170, step: 5, mode: 'box' } } },
              { name: 'tilt', label: 'Tilt down (°)', selector: { number: { min: -45, max: 89, step: 5, mode: 'box' } } },
              { name: 'height', label: 'Height above the floor', selector: { number: { min: 0, max: 10, step: 0.1, mode: 'box' } } },
              { name: 'screen_size', label: 'Screen width (3D)', selector: { number: { min: 0.3, max: 10, step: 0.1, mode: 'box' } } },
              { name: 'screen_distance', label: 'Screen distance (3D)', selector: { number: { min: 0.5, max: 15, step: 0.1, mode: 'box' } } },
            ],
          },
          { name: 'projection', label: 'Project the picture onto the floor and walls it sees (3D)', selector: { boolean: {} } }
        );
      }
      return html`<div class="selection">
        <div class="selection-header">
          ${this._entityIcon(ent.entity, ent.icon)}
          <span>${friendlyName(this.hass, ent.entity)}</span>
          <button class="btn danger" @click=${this._deleteSelection}>Remove from plan</button>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${{ length: WINDOW_LENGTH, light: naturalRole === 'light', ...(isCamera ? this._cameraDefaults(floor, sel.index) : {}), ...ent }}
          .schema=${schema}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${(ev) => this._selectionChanged(ev, 'entities')}
        ></ha-form>
        ${isCamera ? this._renderCameraView(this._applyDrag(floor), sel.index) : nothing}
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

  _wallHeight() {
    return Math.max(1, num(this._config.wall_height, WALL_HEIGHT));
  }

  // The selected camera's picture with the plan drawn over it, as the camera sees it with its current
  // settings: they are right when the lines follow the room in the picture. Point matching computes
  // them from points of the floor found both in the picture and on the plan.
  _renderCameraView(floor, index) {
    const plan = resolveFloor(this.hass, floor);
    const item = plan.items[index];
    if (!item || !item.camera) return nothing;
    const st = item.st;
    const pic = st && !isUnavailable(st) ? st.attributes.entity_picture : null;
    const aspect = this._aspects[item.id] || 16 / 9;
    const wallHeight = this._wallHeight();
    const pose = cameraPose(item.camera, [item.x, item.y, cameraHeight(item.camera, wallHeight)]);
    const calib = this._activeCalib(item);
    const header = html`<div class="cv-header">
      <span>Camera view</span>
      ${pic
        ? html`<button class="btn flat" title="Reload the picture" @click=${() => this._snapTick++}><ha-icon icon="mdi:refresh"></ha-icon></button>
            <button class="btn ${calib ? '' : 'flat'}" @click=${() => this._toggleCalib(item, pose, aspect)}>
              <ha-icon icon="mdi:target"></ha-icon> ${calib ? 'Stop matching' : 'Match points'}
            </button>`
        : nothing}
    </div>`;
    if (!pic) return html`<div class="cv-section">${header}<div class="muted">No picture: the camera is unavailable.</div></div>`;

    const sol = calib && calib.solution;
    const solPose = sol ? poseOf(sol.direction, sol.tilt, sol.fov, [item.x, item.y, sol.height]) : null;
    // An indoor camera only sees its room: the lines of the others would show through its walls.
    const ownRoom = item.camera.indoor ? plan.indoor[roomAt(plan.indoor, item.x, item.y)] : null;
    const lines = planLines(ownRoom ? [ownRoom] : plan.rooms, wallHeight);
    const draw = (ps, cls) =>
      lines.map((l) => {
        const seg = segmentToPicture(ps, l.P, l.Q, aspect);
        return seg
          ? svg`<line class="${cls} ${l.outdoor ? 'outdoor' : ''}" x1=${seg[0][0]} y1=${seg[0][1]} x2=${seg[1][0]} y2=${seg[1][1]}></line>`
          : nothing;
      });
    // Where the plan points land in the picture: on their picture points when the settings are right.
    const landed = calib ? calib.plan.map((p) => toPicture(solPose || pose, [p[0], p[1], 0], aspect)) : [];
    const at = (uv) => `left: ${round2(uv[0] * 100)}%; top: ${round2(uv[1] * aspect * 100)}%;`;
    const pxError = sol ? Math.round(sol.rms * (this._picWidths[item.id] || PROJ_PX)) : 0;

    return html`<div class="cv-section">
      ${header}
      <div class="cv" style="aspect-ratio: ${aspect};" @pointerdown=${this._cvDown} @pointermove=${this._cvMove}
        @pointerup=${this._cvUp} @pointercancel=${this._cvUp}>
        <img alt="" src="${pic}${pic.includes('?') ? '&' : '?'}t=${this._snapTick}" @load=${(ev) => this._learnAspect(item.id, ev.target)} />
        <svg viewBox="0 0 1 ${1 / aspect}" preserveAspectRatio="none">
          ${draw(pose, 'cv-line')} ${solPose ? draw(solPose, 'cv-line solution') : nothing}
        </svg>
        ${landed.map((uv, i) => (uv ? html`<div class="cv-ring" style="${at(uv)} --c: ${CALIB_COLORS[i]};"></div>` : nothing))}
        ${calib
          ? calib.img.map((uv, i) => html`<div class="cv-pt" data-i=${i} style="${at(uv)} --c: ${CALIB_COLORS[i]};">${i + 1}</div>`)
          : nothing}
      </div>
      ${calib ? this._renderMatchPlan(plan, item, calib) : nothing}
      <div class="hint">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span>${calib
          ? 'Drag each numbered point onto a spot of the floor you can recognize in the picture (a corner of the room, of a rug…), then the same number onto that spot on the plan. The rings show where the plan points land with the computed settings: apply them when each ring sits on its point.'
          : 'The lines are your plan as this camera sees it with the settings above: floor outlines, wall corners and tops. Change the settings until the lines follow the picture, or match points to compute them.'}</span>
      </div>
      ${sol
        ? html`<div class="cv-solution">
            <span>Direction ${Math.round(sol.direction)}°, tilt ${Math.round(sol.tilt)}°, field of view ${Math.round(sol.fov)}°,
              height ${round2(sol.height)} · error ${pxError} px</span>
            <button class="btn" @click=${this._applyCalib}>Apply</button>
          </div>`
        : nothing}
    </div>`;
  }

  // The floor with the numbered points, right under the picture, so that both are in view while
  // matching (the editor's plan may be far above, past the entity list).
  _renderMatchPlan(plan, item, calib) {
    const xs = [item.x, ...plan.rooms.flatMap((r) => [r.x, r.x + r.w])];
    const ys = [item.y, ...plan.rooms.flatMap((r) => [r.y, r.y + r.h])];
    const pad = 0.5;
    const vb = { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad };
    vb.w = Math.max(...xs) + pad - vb.x;
    vb.h = Math.max(...ys) + pad - vb.y;
    this._matchView = vb;
    const at = (x, y) => `left: ${round2(((x - vb.x) / vb.w) * 100)}%; top: ${round2(((y - vb.y) / vb.h) * 100)}%;`;
    return html`<div class="cv-plan" style="aspect-ratio: ${round2(vb.w)} / ${round2(vb.h)}; width: min(100%, ${round2((260 * vb.w) / vb.h)}px);"
      @pointerdown=${this._mpDown} @pointermove=${this._mpMove} @pointerup=${this._mpUp} @pointercancel=${this._mpUp}>
      <svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" preserveAspectRatio="none">
        ${plan.rooms.map((r) => svg`<rect class="mp-room ${r.outdoor ? 'outdoor' : ''}" x=${r.x} y=${r.y} width=${r.w} height=${r.h}></rect>`)}
        <path class="e-cone" d=${conePath(item)}></path>
      </svg>
      <div class="mp-cam" style=${at(item.x, item.y)}></div>
      ${calib.plan.map((p, i) => html`<div class="cv-pt" data-i=${i} style="${at(p[0], p[1])} --c: ${CALIB_COLORS[i]};">${i + 1}</div>`)}
    </div>`;
  }

  _mpDown(ev) {
    const pt = ev.target.closest ? ev.target.closest('.cv-pt') : null;
    if (!pt || !this._calib) return;
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    this._mpDrag = { i: Number(pt.dataset.i), el: ev.currentTarget, pointerId: ev.pointerId, vb: this._matchView };
  }

  _mpMove(ev) {
    const d = this._mpDrag;
    if (!d || ev.pointerId !== d.pointerId || !this._calib) return;
    const r = d.el.getBoundingClientRect();
    const plan = [...this._calib.plan];
    plan[d.i] = [
      round2(d.vb.x + clamp((ev.clientX - r.left) / r.width, 0, 1) * d.vb.w),
      round2(d.vb.y + clamp((ev.clientY - r.top) / r.height, 0, 1) * d.vb.h),
    ];
    this._calib = { ...this._calib, plan };
  }

  _mpUp(ev) {
    const d = this._mpDrag;
    if (!d || ev.pointerId !== d.pointerId) return;
    this._mpDrag = null;
    this._solveCalib();
  }

  _learnAspect(id, img) {
    if (!img.naturalWidth || !img.naturalHeight) return;
    this._picWidths[id] = img.naturalWidth;
    const aspect = img.naturalWidth / img.naturalHeight;
    if (Math.abs(aspect - (this._aspects[id] || 16 / 9)) > 0.01) {
      this._aspects[id] = aspect;
      this.requestUpdate();
    }
  }

  // Point matching of a camera, if it is the one in progress.
  _activeCalib(item) {
    const c = this._calib;
    return c && c.index === item.index && c.id === item.id ? c : null;
  }

  // Starts with points the camera sees on the floor with its current settings, so that the points
  // match until the user moves them.
  _toggleCalib(item, pose, aspect) {
    if (this._activeCalib(item)) {
      this._calib = null;
      return;
    }
    const cam = item.camera;
    const guess = [[0.3, 0.6], [0.7, 0.6], [0.3, 0.9], [0.7, 0.9]];
    const plan = guess.map(([u, v], i) => {
      const P = fromPicture(pose, [u, v / aspect], aspect, 0);
      if (P && Math.hypot(P[0] - item.x, P[1] - item.y) < 12) return [round2(P[0]), round2(P[1])];
      // Not on the floor (the camera looks too high): points ahead of the camera instead.
      const d = i < 2 ? 3 : 1.5;
      const l = i % 2 ? 0.75 : -0.75;
      return [round2(item.x + cam.dx * d - cam.dy * l), round2(item.y + cam.dy * d + cam.dx * l)];
    });
    const img = plan.map((p, i) => {
      const uv = toPicture(pose, [p[0], p[1], 0], aspect) || [guess[i][0], guess[i][1] / aspect];
      return [clamp(uv[0], 0, 1), clamp(uv[1], 0, 1 / aspect)];
    });
    this._calib = { index: item.index, id: item.id, plan, img, solution: null };
  }

  _solveCalib() {
    const c = this._calib;
    const item = c && resolveFloor(this.hass, this._floors()[this._currentFloorIndex()]).items[c.index];
    if (!item || !item.camera || item.id !== c.id) return;
    const cam = item.camera;
    const start = { direction: cam.direction, tilt: cam.tilt, fov: cam.fov, height: cameraHeight(cam, this._wallHeight()) };
    const pairs = c.plan.map((p, i) => ({ p, uv: c.img[i] }));
    this._calib = { ...c, solution: solveCamera(start, item.x, item.y, pairs, this._aspects[item.id] || 16 / 9) };
  }

  _applyCalib() {
    const c = this._calib;
    const s = c && c.solution;
    if (!s) return;
    const r1 = (v) => Math.round(v * 10) / 10;
    this._editFloor((floor) => {
      Object.assign(floor.entities[c.index], { direction: r1(s.direction), tilt: r1(s.tilt), fov: r1(s.fov), height: round2(s.height) });
    });
    this._calib = { ...c, solution: null };
  }

  // Dragging a numbered point on the camera's picture.
  _cvDown(ev) {
    const pt = ev.target.closest ? ev.target.closest('.cv-pt') : null;
    if (!pt || !this._calib) return;
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    this._cvDrag = { i: Number(pt.dataset.i), el: ev.currentTarget, pointerId: ev.pointerId };
  }

  _cvMove(ev) {
    const d = this._cvDrag;
    if (!d || ev.pointerId !== d.pointerId || !this._calib) return;
    const r = d.el.getBoundingClientRect();
    const img = [...this._calib.img];
    img[d.i] = [clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.width, 0, r.height / r.width)];
    this._calib = { ...this._calib, img };
  }

  _cvUp(ev) {
    const d = this._cvDrag;
    if (!d || ev.pointerId !== d.pointerId) return;
    this._cvDrag = null;
    this._solveCalib();
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
        cameras: domain === 'camera',
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

    if (kind === 'calib' && this._calib) {
      const i = Number(target.dataset.i);
      this._drag = { ...base, type: 'calib', i, orig: this._calib.plan[i] };
    } else if (kind === 'entity') {
      const index = Number(target.dataset.index);
      const e = floor.entities[index];
      this._drag = { ...base, type: 'entity', index, id: e.entity, orig: { x: num(e.x), y: num(e.y) }, pos: { x: num(e.x), y: num(e.y) } };
    } else if (kind === 'aim' && this._selection && this._selection.kind === 'entity') {
      const index = this._selection.index;
      const e = floor.entities[index];
      this._drag = { ...base, type: 'aim', index, center: { x: num(e.x), y: num(e.y) }, direction: num(e.direction) };
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
    } else if (d.type === 'aim') {
      next.direction = directionOf(p.x - d.center.x, p.y - d.center.y);
    } else if (d.type === 'calib' && this._calib) {
      const plan = [...this._calib.plan];
      plan[d.i] = [round2(inX(d.orig[0] + dx)), round2(inY(d.orig[1] + dy))];
      this._calib = { ...this._calib, plan };
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

    if (d.type === 'calib') {
      if (d.moved) this._solveCalib();
      return;
    }
    if (!d.moved) {
      // A plain click selects what is under the pointer.
      if (d.type === 'entity' || d.type === 'aim') this._selection = { kind: 'entity', index: d.index };
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
    } else if (d.type === 'aim') {
      this._editFloor((floor) => {
        floor.entities[d.index] = { ...floor.entities[d.index], direction: d.direction };
      });
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
      const entity = { entity: d.id, ...pos };
      if (domainOf(d.id) === 'camera') {
        const rooms = floor.rooms.map(normalizeRoom);
        entity.direction = defaultCameraDirection(rooms, rooms.filter((r) => !r.outdoor), pos.x, pos.y);
      }
      floor.entities.push(entity);
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
    for (const key of ['temp_min', 'temp_max', 'title', 'wall_height', 'refresh_interval']) {
      if (value[key] === '' || value[key] === undefined || value[key] === null) delete value[key];
    }
    for (const [key, def] of Object.entries(CARD_DEFAULTS)) {
      if (value[key] === def) delete value[key];
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
    if (listKey === 'entities') {
      const defaults = domainOf(value.entity) === 'camera' ? this._cameraDefaults(this._floors()[this._currentFloorIndex()], sel.index) : {};
      // The direction is always kept: it would otherwise change when the camera is moved.
      for (const key of CAMERA_KEYS) if (key in defaults && num(value[key]) === defaults[key]) delete value[key];
      if (!value.projection) delete value.projection;
      if (domainOf(value.entity) !== 'camera') for (const key of ['direction', 'projection', ...CAMERA_KEYS]) delete value[key];
    }
    if (listKey === 'entities') {
      // `light` is only kept when it differs from what the entity's domain gives.
      const naturalRole = entityRole(value.entity, this.hass.states[value.entity]);
      const keep = (naturalRole === 'device' && value.light === true) || (naturalRole === 'light' && value.light === false);
      if (!keep) delete value.light;
    }
    if (listKey === 'rooms' && !value.outdoor) delete value.outdoor;
    this._editFloor((floor) => {
      floor[listKey][sel.index] = value;
    }, `${this._currentFloorIndex()}:${listKey}:${sel.index}`);
  }

  // Values a camera's form shows when they are not set.
  _cameraDefaults(floor, index) {
    const item = resolveFloor(this.hass, floor).items[index];
    const wallHeight = Math.max(1, num(this._config.wall_height, WALL_HEIGHT));
    return {
      direction: item && item.camera ? item.camera.direction : 0,
      fov: CAMERA_FOV,
      tilt: CAMERA_TILT,
      height: round2(Math.min(CAMERA_HEIGHT, wallHeight - 0.3)),
      screen_size: SCREEN_SIZE,
      screen_distance: SCREEN_DISTANCE,
    };
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
      .e-room.outdoor {
        fill: rgba(102, 160, 90, 0.18);
        stroke-dasharray: 4 3;
      }
      .e-cone {
        fill: var(--primary-color);
        fill-opacity: 0.12;
        stroke: var(--primary-color);
        stroke-opacity: 0.4;
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .e-aim {
        stroke: var(--primary-color);
        stroke-width: 2px;
        stroke-dasharray: 3 3;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .handle.aim {
        cursor: grab;
        width: 16px;
        height: 16px;
      }
      .calib-pt,
      .cv-pt {
        position: absolute;
        width: 20px;
        height: 20px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid #fff;
        background: var(--c);
        color: #000;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
        pointer-events: auto;
        cursor: grab;
        touch-action: none;
      }
      .cv-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
      }
      .cv-header {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .cv-header > span {
        flex: 1;
      }
      .cv {
        position: relative;
        width: 100%;
        border-radius: 6px;
        overflow: hidden;
        background: #000;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .cv img,
      .cv svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      .cv svg {
        pointer-events: none;
      }
      .cv-line {
        stroke: #fff;
        stroke-opacity: 0.85;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
      }
      .cv-line.outdoor {
        stroke-dasharray: 4 3;
      }
      .cv-line.solution {
        stroke: #69f0ae;
        stroke-width: 2px;
        stroke-dasharray: 6 3;
      }
      .cv-ring {
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid var(--c);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .cv-plan {
        position: relative;
        align-self: center;
        border-radius: 6px;
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.05));
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .cv-plan svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .mp-room {
        fill: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        stroke: var(--fp-wall);
        stroke-opacity: 0.5;
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
      }
      .mp-room.outdoor {
        fill: rgba(102, 160, 90, 0.18);
        stroke-dasharray: 4 3;
      }
      .mp-cam {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color, #fff);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .cv-solution {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--primary-text-color);
      }
      .cv-solution span {
        flex: 1;
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
