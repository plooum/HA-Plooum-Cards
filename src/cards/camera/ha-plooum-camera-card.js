import { LitElement, html, css, nothing } from "lit";
import { keyed } from "lit/directives/keyed.js";

const CARD_VERSION = '1.0.1';

/*
 * A live camera that plays as soon as it shows, with a digital zoom (wheel, pinch, double tap, drag), and
 * photo / video buttons that save on the server through the Plooum CamRecorder integration
 * (HA-Plooum-CamRecorder; hidden without it).
 *
 * When the camera fails (entity unavailable, no stream, a stream that stalls or shows black), the card
 * shows its fallback stream (`sd_entity`, typically the camera's low definition substream), and when
 * that fails too, the last good picture of a preview image (`preview_entity`, made by Plooum CamPreview),
 * with the reason. While a fallback shows, the failed streams are tried again in the background (hidden),
 * and come back once they play and aren't black.
 *
 * The stream itself is Home Assistant's own player (ha-camera-stream: WebRTC, HLS, or MJPEG pictures for
 * cameras without a stream). The card watches it every CHECK_INTERVAL: frames that advance, and the
 * brightness of a tiny copy of the picture.
 */

const DEFAULTS = {
  aspect_ratio: '16:9',
  fit: 'contain',
  max_zoom: 5,
  muted: true,
  show_controls: true,
  show_name: true,
};

const BLACK_LEVEL = 20; // a picture whose brightest pixel is darker than this (0-255) is black
const CHECK_INTERVAL = 2000; // ms between two checks of the streams
const BLACK_CHECKS = 3; // black pictures in a row for a stream to count as black
const OK_CHECKS = 2; // good checks in a row for a stream tried in the background to come back
const START_TIMEOUT = 20000; // ms for a stream to show its first picture
const STALL_TIMEOUT = 12000; // ms without a new frame for a playing video to count as stalled
const FROZEN_TIMEOUT = 30000; // ms of identical MJPEG pictures (no frame counter there) to count as stalled
// ms before the first background try of a failed stream. A stream that fails to start is often only
// stopping: Home Assistant (2026.10) drops a stream output asked for while that stream stops (the old
// worker's worker_finished() removes it, home-assistant/core#192844), so the player gets no URL; a try a
// moment later succeeds.
const FIRST_RETRY = 3000;
const RETRY_INTERVAL = 60000; // ms between the next background tries
const WAIT_INTERVAL = 250; // ms between two looks at a stream that hasn't shown its first picture yet
const LOAD_TIMEOUT = 10000; // ms to wait for Home Assistant's camera player to be defined
const RECORDER = 'plooum_camrecorder'; // the CamRecorder integration's domain

const REASONS = {
  missing: 'Camera not found',
  unavailable: 'Camera unavailable',
  error: 'No stream',
  stalled: 'Stream stalled',
  black: 'Black picture',
  retry: 'Reconnecting…',
};

// "16:9", "16/9", "1.78" -> CSS aspect-ratio "16 / 9"; null when invalid.
function cssRatio(value) {
  const m = String(value ?? '').trim().match(/^(\d+(?:\.\d+)?)\s*(?:[:/x]\s*(\d+(?:\.\d+)?))?$/);
  if (!m) return null;
  const w = Number(m[1]);
  const h = m[2] === undefined ? 1 : Number(m[2]);
  return w > 0 && h > 0 ? `${w} / ${h}` : null;
}

// A tiny copy of a playing video or a loaded picture: whether it is black, and a signature to tell
// whether it changes. Null when it can't be read (not loaded yet, or another origin).
function sample(media) {
  const w = media.videoWidth || media.naturalWidth;
  if (!w) return null;
  const canvas = sample.canvas || (sample.canvas = document.createElement('canvas'));
  canvas.width = 32;
  canvas.height = 18;
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(media, 0, 0, 32, 18);
    const px = ctx.getImageData(0, 0, 32, 18).data;
    let brightest = 0;
    let sig = 0;
    for (let i = 0; i < px.length; i += 4) {
      const v = Math.max(px[i], px[i + 1], px[i + 2]);
      if (v > brightest) brightest = v;
      sig = (sig * 31 + px[i] + px[i + 1] * 3 + px[i + 2] * 7) >>> 0;
    }
    return { black: brightest < BLACK_LEVEL, sig };
  } catch (err) {
    return null;
  }
}

// The media element Home Assistant's player shows: { video, fatal } for WebRTC / HLS, { img } for MJPEG.
function findMedia(stream) {
  const root = stream && stream.shadowRoot;
  if (!root) return null;
  const players = [...root.querySelectorAll('ha-hls-player, ha-web-rtc-player')];
  const visible = players.filter((p) => !p.classList.contains('hidden'));
  for (const player of visible.length ? visible : players) {
    const sr = player.shadowRoot;
    if (!sr) continue;
    const video = sr.querySelector('video');
    const fatal = !!sr.querySelector('ha-alert.fatal');
    if (video || fatal) return { video, fatal };
  }
  const img = root.querySelector('img');
  return img ? { img } : null;
}

// Whether a stream shows its first picture yet: a video that plays, or a loaded MJPEG picture.
function streamPlaying(stream) {
  const media = findMedia(stream);
  if (!media) return false;
  if (media.video) return media.video.readyState >= 2 && media.video.currentTime > 0;
  return !!(media.img && media.img.complete && media.img.naturalWidth);
}

/* ==========================================================================
   MAIN CARD : ha-plooum-camera-card
   ========================================================================== */
class HaPlooumCameraCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _active: { state: true },
      _probe: { state: true },
      _ready: { state: true },
      _zoom: { state: true },
      _toast: { state: true },
      _busy: { state: true },
      _tick: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement('ha-plooum-camera-card-editor');
  }

  static getStubConfig(hass) {
    const camera = hass && Object.keys(hass.states).find((id) => id.startsWith('camera.'));
    return { entity: camera || '' };
  }

  constructor() {
    super();
    this._active = 'main';
    this._probe = null;
    this._faults = {}; // source key -> { reason, at }
    this._watch = {}; // 'active' / 'probe' -> what the checks learnt of that stream
    this._ready = !!customElements.get('ha-camera-stream');
    this._zoom = { s: 1, x: 0, y: 0 };
    this._pointers = new Map();
    this._toast = null;
    this._busy = false;
    this._localRec = {}; // camera -> start (ms), for cameras without a Recording switch
    this._tick = 0;
    this._retryInterval = RETRY_INTERVAL; // shorter in the UI tests
    this._onVisibility = () => { if (!document.hidden) this._resetWatch(); };
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-CAMERA-CARD %c ${CARD_VERSION} `,
      'color: white; background: #03a9f4; font-weight: 700;',
      'color: #03a9f4; background: white; font-weight: 700;'
    );
    this._timer = setInterval(() => this._check(), CHECK_INTERVAL);
    document.addEventListener('visibilitychange', this._onVisibility);
    // Browsers pause a muted video out of sight: the checks wait until the card shows.
    this._visible = false;
    this._observer = new IntersectionObserver((entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible && !this._visible) this._resetWatch();
      this._visible = visible;
    });
    this._observer.observe(this);
    if (!this._ready) this._loadPlayer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
    clearInterval(this._waitTimer);
    this._waitTimer = null;
    if (this._observer) this._observer.disconnect();
    clearTimeout(this._toastTimer);
    document.removeEventListener('visibilitychange', this._onVisibility);
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    if (!config.entity) throw new Error('Pick a camera (entity)');
    this.config = { ...DEFAULTS, ...config };
    this._faults = {};
    this._active = 'main';
    this._probe = null;
    this._resetWatch();
    this._zoom = { s: 1, x: 0, y: 0 };
  }

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 4 };
  }

  // Home Assistant's camera player is loaded lazily by its own cards: a picture-entity card in live
  // view loads it.
  async _loadPlayer() {
    try {
      if (!customElements.get('ha-camera-stream') && window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        const card = await helpers.createCardElement({ type: 'picture-entity', entity: this.config.entity, camera_view: 'live' });
        if (this.hass) card.hass = this.hass;
      }
      await Promise.race([
        customElements.whenDefined('ha-camera-stream'),
        new Promise((resolve) => setTimeout(resolve, LOAD_TIMEOUT)),
      ]);
    } catch (err) {
      // Shows the fallback below.
    }
    this._ready = !!customElements.get('ha-camera-stream');
    if (!this._ready) this._showToast("Home Assistant's camera player isn't available");
  }

  // --- Sources ---

  /** The streams, in order of preference: { key, entity }. */
  get _sources() {
    const list = [{ key: 'main', entity: this.config.entity }];
    if (this.config.sd_entity) list.push({ key: 'sd', entity: this.config.sd_entity });
    return list;
  }

  _source(key) {
    return this._sources.find((s) => s.key === key);
  }

  // 'missing' / 'unavailable' from the entity's state, else null.
  _entityFault(entity) {
    const st = this.hass && this.hass.states[entity];
    if (!st) return 'missing';
    return st.state === 'unavailable' ? 'unavailable' : null;
  }

  // Follows the entities' availability, and picks the stream to show: the first one without a fault.
  willUpdate(changed) {
    if (!this.config || !this.hass) return;
    if (!changed.has('hass') && !changed.has('config') && !changed.has('_active')) return;
    const now = Date.now();
    for (const { key, entity } of this._sources) {
      const reason = this._entityFault(entity);
      const fault = this._faults[key];
      if (reason) {
        if (!fault || fault.reason !== reason) this._faults[key] = { reason, at: now };
      } else if (fault && (fault.reason === 'unavailable' || fault.reason === 'missing')) {
        // Back: tried in the background at once, shown once it plays.
        this._faults[key] = { reason: 'retry', at: 0 };
      }
    }
    const first = this._sources.find((s) => !this._faults[s.key]);
    const wanted = first ? first.key : 'preview';
    if (wanted !== this._active) this._setActive(wanted);
    if (this._probe && this._entityFault(this._source(this._probe).entity)) this._endProbe();
  }

  _setActive(key) {
    if (this._probe === key) this._probe = null;
    this._active = key;
    this._watch.active = null;
  }

  _fail(key, reason) {
    const now = Date.now();
    this._faults[key] = { reason, at: now, tries: 0 };
    // The fallbacks' old stream faults (not their entity's) are stale: try them again right away.
    const order = this._sources.map((s) => s.key);
    for (const k of order.slice(order.indexOf(key) + 1)) {
      const f = this._faults[k];
      if (f && f.reason !== 'unavailable' && f.reason !== 'missing' && now - f.at >= this._retryInterval) delete this._faults[k];
    }
    const first = this._sources.find((s) => !this._faults[s.key]);
    this._setActive(first ? first.key : 'preview');
  }

  _endProbe() {
    this._probe = null;
    this._watch.probe = null;
  }

  _resetWatch() {
    this._watch = {};
  }

  // --- Checks ---

  _check() {
    if (!this.config || !this.hass || document.hidden || !this.isConnected || !this._visible) return;
    const now = Date.now();
    if (this._sources.some((s) => s.key === this._active)) {
      const verdict = this._watchStream('active', this.renderRoot.querySelector('.stream.active'), now);
      if (verdict && verdict !== 'ok') this._fail(this._active, verdict);
    }
    if (this._probe) {
      const verdict = this._watchStream('probe', this.renderRoot.querySelector('.stream.probe'), now);
      if (verdict === 'ok') {
        const key = this._probe;
        delete this._faults[key];
        this._endProbe();
        this._setActive(key);
      } else if (verdict) {
        const tries = ((this._faults[this._probe] || {}).tries || 0) + 1;
        this._faults[this._probe] = { reason: verdict, at: now, tries };
        this._endProbe();
      }
    } else {
      this._startProbe(now);
    }
    if (this._recordingOf(this._activeCamera)) this._tick++;
  }

  // Tries in the background the best failed stream above the one shown: FIRST_RETRY after it failed, then
  // every RETRY_INTERVAL.
  _startProbe(now) {
    const order = this._sources.map((s) => s.key);
    const limit = this._active === 'preview' ? order.length : order.indexOf(this._active);
    for (const key of order.slice(0, limit)) {
      const fault = this._faults[key];
      if (!fault || fault.reason === 'unavailable' || fault.reason === 'missing') continue;
      if (now - fault.at < (fault.tries ? this._retryInterval : Math.min(FIRST_RETRY, this._retryInterval))) continue;
      this._probe = key;
      this._watch.probe = null;
      return;
    }
  }

  /**
   * One check of a stream element. Returns null while undecided, 'ok' (a probe that plays and
   * isn't black), or the fault: 'error', 'stalled', 'black'.
   */
  _watchStream(slot, el, now) {
    if (!el) return null;
    let w = this._watch[slot];
    if (!w || w.el !== el) {
      w = this._watch[slot] = { el, start: now, frames: 0, last: null, progress: now, sig: null, sigAt: now, black: 0, good: 0 };
    }
    const media = findMedia(el);
    if (media && media.fatal) return 'error';
    const video = media && media.video;
    const img = media && media.img;
    let fresh = false;
    if (video) {
      if (video.readyState >= 2 && video.currentTime !== w.last) {
        if (w.last !== null || video.currentTime > 0) fresh = true;
        w.last = video.currentTime;
      }
    } else if (img && img.complete && img.naturalWidth) {
      fresh = true; // MJPEG: no frame counter, see the frozen check below
    }
    if (fresh) {
      w.frames++;
      w.progress = now;
    }
    if (!w.frames) return now - w.start > START_TIMEOUT ? 'error' : null;
    if (video && now - w.progress > STALL_TIMEOUT) return 'stalled';
    const shot = sample(video || img);
    if (shot) {
      if (shot.sig !== w.sig) {
        w.sig = shot.sig;
        w.sigAt = now;
      } else if (img && now - w.sigAt > FROZEN_TIMEOUT) {
        return 'stalled';
      }
      w.black = shot.black ? w.black + 1 : 0;
      w.good = shot.black ? 0 : w.good + 1;
      if (w.black >= BLACK_CHECKS) return 'black';
    } else {
      w.good++; // unreadable (another origin): playing is all we can tell
    }
    return slot === 'probe' && w.good >= OK_CHECKS ? 'ok' : null;
  }

  // --- Recording (Plooum CamRecorder) ---

  // Which CamRecorder actions exist ({ photo, video }); Home Assistant keeps an empty domain once
  // its actions are removed.
  get _recorder() {
    const services = (this.hass && this.hass.services && this.hass.services[RECORDER]) || {};
    const photo = 'snapshot' in services;
    const video = 'start_recording' in services && 'stop_recording' in services;
    return photo || video ? { photo, video } : null;
  }

  get _activeCamera() {
    const src = this._source(this._active);
    return src ? src.entity : null;
  }

  // The integration's Recording switch of a camera (attribute camera_entity), if it has one.
  _recordSwitch(camera) {
    if (!this.hass || !camera) return null;
    return Object.values(this.hass.states).find((s) => s.entity_id.startsWith('switch.')
      && s.attributes.camera_entity === camera && 'started' in s.attributes) || null;
  }

  /** { start (ms) } while the camera records, else null. */
  _recordingOf(camera) {
    if (!camera) return null;
    const sw = this._recordSwitch(camera);
    if (sw) {
      if (sw.state !== 'on') return null;
      const t = Date.parse(sw.attributes.started);
      return { start: Number.isNaN(t) ? Date.parse(sw.last_changed) : t };
    }
    return this._localRec[camera] ? { start: this._localRec[camera] } : null;
  }

  async _photo() {
    const camera = this._activeCamera;
    if (!camera || this._busy) return;
    this._busy = true;
    try {
      await this.hass.callService(RECORDER, 'snapshot', { entity_id: camera });
      this._flash();
      this._showToast('Photo saved');
    } catch (err) {
      this._showToast(`Photo failed: ${err.message || err}`);
    } finally {
      this._busy = false;
    }
  }

  async _record() {
    const camera = this._activeCamera;
    if (!camera || this._busy) return;
    const recording = this._recordingOf(camera);
    this._busy = true;
    try {
      if (recording) {
        await this.hass.callService(RECORDER, 'stop_recording', { entity_id: camera });
        delete this._localRec[camera];
        this._showToast('Video saved');
      } else {
        await this.hass.callService(RECORDER, 'start_recording', { entity_id: camera });
        if (!this._recordSwitch(camera)) this._localRec[camera] = Date.now();
        this._showToast('Recording…');
      }
    } catch (err) {
      if (recording) delete this._localRec[camera];
      this._showToast(`${recording ? 'Stop' : 'Recording'} failed: ${err.message || err}`);
    } finally {
      this._busy = false;
    }
  }

  _flash() {
    const el = this.renderRoot.querySelector('.flash');
    if (!el) return;
    el.classList.remove('on');
    void el.offsetWidth; // restart the animation
    el.classList.add('on');
  }

  _showToast(text) {
    this._toast = text;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this._toast = null; }, 3500);
  }

  // --- Zoom ---

  get _maxZoom() {
    const m = Number(this.config.max_zoom);
    return Number.isFinite(m) && m >= 1 ? m : DEFAULTS.max_zoom;
  }

  // Zoom to `s` keeping the point (px, py) of the viewport (px from its top left) still.
  _zoomAt(s, px, py) {
    const view = this.renderRoot.querySelector('.viewport');
    if (!view) return;
    const z = this._zoom;
    s = Math.min(this._maxZoom, Math.max(1, s));
    const k = s / z.s;
    this._zoom = this._clamp({ s, x: px - (px - z.x) * k, y: py - (py - z.y) * k }, view);
  }

  _clamp(z, view) {
    const w = view.clientWidth;
    const h = view.clientHeight;
    return {
      s: z.s,
      x: Math.min(0, Math.max(w - w * z.s, z.x)),
      y: Math.min(0, Math.max(h - h * z.s, z.y)),
    };
  }

  _resetZoom() {
    this._zoom = { s: 1, x: 0, y: 0 };
  }

  _local(ev) {
    const r = this.renderRoot.querySelector('.viewport').getBoundingClientRect();
    return [ev.clientX - r.left, ev.clientY - r.top];
  }

  _onWheel(ev) {
    ev.preventDefault();
    const [x, y] = this._local(ev);
    this._zoomAt(this._zoom.s * Math.exp(-ev.deltaY * 0.0015), x, y);
  }

  _onDblClick(ev) {
    if (ev.target.closest && ev.target.closest('.controls')) return;
    const [x, y] = this._local(ev);
    if (this._zoom.s > 1) this._resetZoom();
    else this._zoomAt(Math.min(2.5, this._maxZoom), x, y);
  }

  _onPointerDown(ev) {
    if (ev.target.closest && ev.target.closest('.controls')) return;
    this._pointers.set(ev.pointerId, this._local(ev));
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (err) { /* synthetic events */ }
    this._gesture = null;
  }

  _onPointerMove(ev) {
    if (!this._pointers.has(ev.pointerId)) return;
    const prev = new Map(this._pointers);
    this._pointers.set(ev.pointerId, this._local(ev));
    const view = this.renderRoot.querySelector('.viewport');
    if (this._pointers.size >= 2) {
      // Pinch: zoom by the change of the distance between two fingers, move with their middle.
      const [a, b] = [...this._pointers.values()];
      const [pa, pb] = [...prev.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const pd = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) || d;
      const cx = (a[0] + b[0]) / 2;
      const cy = (a[1] + b[1]) / 2;
      this._zoomAt(this._zoom.s * (d / pd), cx, cy);
      const z = this._zoom;
      this._zoom = this._clamp({ ...z, x: z.x + cx - (pa[0] + pb[0]) / 2, y: z.y + cy - (pa[1] + pb[1]) / 2 }, view);
      ev.preventDefault();
    } else if (this._zoom.s > 1) {
      const [x0, y0] = prev.get(ev.pointerId);
      const [x1, y1] = this._pointers.get(ev.pointerId);
      const z = this._zoom;
      this._zoom = this._clamp({ ...z, x: z.x + x1 - x0, y: z.y + y1 - y0 }, view);
      ev.preventDefault();
    }
  }

  _onPointerUp(ev) {
    this._pointers.delete(ev.pointerId);
  }

  _fullscreen() {
    const card = this.renderRoot.querySelector('ha-card');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (card && card.requestFullscreen) card.requestFullscreen().catch(() => {});
  }

  // --- Render ---

  // The preview's picture (`preview_entity`), or null.
  get _previewUrl() {
    const id = this.config.preview_entity;
    const st = id && this.hass.states[id];
    return (st && st.state !== 'unavailable' && st.attributes.entity_picture) || null;
  }

  _renderStream(key, slot) {
    const src = this._source(key);
    const st = src && this.hass.states[src.entity];
    if (!st || !this._ready) return nothing;
    const stream = html`
      <ha-camera-stream
        class="stream ${slot}"
        .hass=${this.hass}
        .stateObj=${st}
        .muted=${slot === 'probe' || this.config.muted !== false}
        .controls=${false}
        .allowExoPlayer=${true}
        .aspectRatio=${cssRatio(this.config.aspect_ratio) || '16 / 9'}
        .fitMode=${this.config.fit === 'cover' ? 'cover' : 'contain'}
      ></ha-camera-stream>`;
    if (slot === 'probe') return keyed(`${slot}:${src.entity}`, stream);
    // A real camera's stream takes seconds to start (HLS), and so does the still picture Home
    // Assistant shows meanwhile: until the first picture, the preview shows over it, with a spinner.
    // The live's class isn't bound: _watchFirstPicture() adds `playing` to it.
    const url = this._previewUrl;
    return keyed(`${slot}:${src.entity}`, html`
      <div class="live">
        ${stream}
        <div class="wait">
          ${url ? html`<img src=${url} alt="" style="object-fit: ${this.config.fit === 'cover' ? 'cover' : 'contain'}" />` : nothing}
          <div class="spinner"></div>
        </div>
      </div>
    `);
  }

  updated() {
    if (!this._waitTimer && this.renderRoot.querySelector('.live:not(.playing)')) {
      this._waitTimer = setInterval(() => this._watchFirstPicture(), WAIT_INTERVAL);
    }
  }

  // Takes the waiting picture away as soon as the stream shows its own.
  _watchFirstPicture() {
    const waiting = [...this.renderRoot.querySelectorAll('.live:not(.playing)')];
    for (const live of waiting) {
      if (streamPlaying(live.querySelector('ha-camera-stream'))) live.classList.add('playing');
    }
    if (!waiting.some((live) => !live.classList.contains('playing'))) {
      clearInterval(this._waitTimer);
      this._waitTimer = null;
    }
  }

  // Why the shown picture is not the camera's own stream: the reason of the main stream's fault.
  get _reason() {
    const fault = this._faults.main;
    return fault ? REASONS[fault.reason] || fault.reason : null;
  }

  _renderPreview() {
    const id = this.config.preview_entity;
    const st = id && this.hass.states[id];
    const url = this._previewUrl;
    const when = st && Date.parse(st.state);
    const age = when && !Number.isNaN(when)
      ? new Date(when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
    return html`
      ${url ? html`<img class="preview" src=${url} alt="" style="object-fit: ${this.config.fit === 'cover' ? 'cover' : 'contain'}" />`
        : html`<div class="nothing"><ha-icon icon="mdi:cctv-off"></ha-icon></div>`}
      <div class="banner">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>${this._reason || REASONS.error}${url && age ? html` · picture from ${age}` : ''}</span>
      </div>
    `;
  }

  _renderControls() {
    if (this.config.show_controls === false) return nothing;
    const camera = this._activeCamera;
    const recorder = camera ? this._recorder : null;
    const recording = recorder && recorder.video && this._recordingOf(camera);
    return html`
      <div class="controls">
        ${this._zoom.s > 1 ? html`
          <button class="btn zoom-reset" title="Reset zoom" @click=${this._resetZoom}>
            <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
          </button>` : nothing}
        ${recorder && recorder.photo ? html`
          <button class="btn photo" title="Take a photo" ?disabled=${this._busy} @click=${this._photo}>
            <ha-icon icon="mdi:camera"></ha-icon>
          </button>` : nothing}
        ${recorder && recorder.video ? html`
          <button class="btn record ${recording ? 'on' : ''}" title=${recording ? 'Stop recording' : 'Record a video'}
            ?disabled=${this._busy} @click=${this._record}>
            <ha-icon icon=${recording ? 'mdi:stop' : 'mdi:record'}></ha-icon>
          </button>` : nothing}
        ${document.fullscreenEnabled ? html`
          <button class="btn fullscreen" title="Full screen" @click=${this._fullscreen}>
            <ha-icon icon=${document.fullscreenElement ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}></ha-icon>
          </button>` : nothing}
      </div>
    `;
  }

  _renderRec() {
    const recorder = this._recorder;
    const rec = recorder && recorder.video && this._recordingOf(this._activeCamera);
    if (!rec) return nothing;
    const s = Math.max(0, Math.floor((Date.now() - rec.start) / 1000));
    const time = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    return html`<div class="rec"><span class="dot"></span>REC ${time}</div>`;
  }

  render() {
    if (!this.config || !this.hass) return nothing;
    const ratio = cssRatio(this.config.aspect_ratio) || '16 / 9';
    const name = this.config.name ?? (this.hass.states[this.config.entity]?.attributes.friendly_name || '');
    const z = this._zoom;
    const preview = this._active === 'preview';
    return html`
      <ha-card>
        <div class="viewport ${z.s > 1 ? 'zoomed' : ''} ${preview ? 'on-preview' : ''}" style="aspect-ratio: ${ratio}"
          @wheel=${this._onWheel}
          @dblclick=${this._onDblClick}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}>
          <div class="zoom" style="transform: translate(${z.x}px, ${z.y}px) scale(${z.s})">
            ${preview ? this._renderPreview() : this._renderStream(this._active, 'active')}
          </div>
          ${this._probe ? html`<div class="probe-box">${this._renderStream(this._probe, 'probe')}</div>` : nothing}
          ${this.config.show_name !== false && name ? html`<div class="name">${name}</div>` : nothing}
          <div class="badges">
            ${this._renderRec()}
            ${this._active === 'sd' ? html`<div class="badge sd" title=${this._reason || ''}>SD</div>` : nothing}
            ${z.s > 1 ? html`<div class="badge">×${z.s.toFixed(1)}</div>` : nothing}
          </div>
          ${this._renderControls()}
          <div class="flash"></div>
          ${this._toast ? html`<div class="toast">${this._toast}</div>` : nothing}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        overflow: hidden;
        background: #000;
      }
      .viewport {
        position: relative;
        width: 100%;
        overflow: hidden;
        background: #000;
        touch-action: pan-x pan-y;
        user-select: none;
        -webkit-user-select: none;
      }
      .viewport.zoomed {
        touch-action: none;
        cursor: grab;
      }
      ha-card:fullscreen .viewport {
        height: 100%;
        aspect-ratio: auto !important;
      }
      .zoom {
        position: absolute;
        inset: 0;
        transform-origin: 0 0;
        will-change: transform;
      }
      .zoom ha-camera-stream,
      .zoom .preview,
      .live,
      .probe-box ha-camera-stream {
        display: block;
        width: 100%;
        height: 100%;
      }
      .zoom ha-camera-stream {
        --video-max-height: 100%;
      }
      .preview {
        object-fit: contain;
      }
      .live {
        position: relative;
      }
      .wait {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        transition: opacity 0.3s;
      }
      .wait img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .live.playing .wait {
        opacity: 0;
      }
      .spinner {
        position: relative;
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      .live.playing .spinner {
        animation: none;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .probe-box {
        position: absolute;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        z-index: -1;
      }
      .nothing {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: rgba(255, 255, 255, 0.35);
        --mdc-icon-size: 64px;
      }
      .banner {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 0.9em;
        --mdc-icon-size: 18px;
        pointer-events: none;
      }
      .name {
        position: absolute;
        top: 8px;
        left: 10px;
        padding: 2px 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-size: 0.95em;
        pointer-events: none;
      }
      .badges {
        position: absolute;
        top: 8px;
        right: 10px;
        display: flex;
        gap: 6px;
        pointer-events: none;
      }
      .badge,
      .rec {
        padding: 2px 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-size: 0.85em;
        font-weight: 600;
      }
      .badge.sd {
        background: rgba(255, 152, 0, 0.85);
      }
      .rec {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(200, 0, 0, 0.8);
      }
      .rec .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #fff;
        animation: blink 1s infinite;
      }
      @keyframes blink {
        50% { opacity: 0.2; }
      }
      .controls {
        position: absolute;
        right: 8px;
        bottom: 8px;
        display: flex;
        gap: 6px;
      }
      .controls {
        z-index: 1;
      }
      .viewport.on-preview .controls {
        bottom: 40px;
      }
      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        cursor: pointer;
        --mdc-icon-size: 22px;
      }
      .btn:hover {
        background: rgba(0, 0, 0, 0.7);
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .btn.record ha-icon {
        color: #ff3b30;
      }
      .btn.record.on {
        background: rgba(200, 0, 0, 0.85);
      }
      .btn.record.on ha-icon {
        color: #fff;
      }
      .flash {
        position: absolute;
        inset: 0;
        background: #fff;
        opacity: 0;
        pointer-events: none;
      }
      .flash.on {
        animation: flash 0.4s ease-out;
      }
      @keyframes flash {
        from { opacity: 0.8; }
        to { opacity: 0; }
      }
      .toast {
        position: absolute;
        left: 50%;
        bottom: 56px;
        transform: translateX(-50%);
        max-width: 80%;
        padding: 6px 12px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.75);
        color: #fff;
        font-size: 0.9em;
        text-align: center;
        pointer-events: none;
      }
    `;
  }
}

/* ==========================================================================
   EDITOR : ha-plooum-camera-card-editor
   ========================================================================== */
const SCHEMA = [
  { name: 'entity', required: true, selector: { entity: { domain: 'camera' } } },
  { name: 'sd_entity', selector: { entity: { domain: 'camera' } } },
  { name: 'preview_entity', selector: { entity: { domain: 'image' } } },
  { name: 'name', selector: { text: {} } },
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'aspect_ratio', selector: { text: {} } },
      {
        name: 'fit',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'contain', label: 'Whole picture' },
              { value: 'cover', label: 'Fill (crop)' },
            ],
          },
        },
      },
      { name: 'max_zoom', selector: { number: { min: 1, max: 10, step: 0.5, mode: 'box' } } },
    ],
  },
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'show_name', selector: { boolean: {} } },
      { name: 'muted', selector: { boolean: {} } },
      { name: 'show_controls', selector: { boolean: {} } },
    ],
  },
];

const LABELS = {
  entity: 'Camera',
  sd_entity: 'Fallback stream (SD)',
  preview_entity: 'Preview picture (CamPreview)',
  name: 'Name',
  aspect_ratio: 'Aspect ratio',
  fit: 'Fit',
  max_zoom: 'Maximum zoom',
  show_name: 'Show name',
  muted: 'Muted',
  show_controls: 'Show buttons',
};

const HELPERS = {
  sd_entity: "Shown when the camera's stream fails, is unavailable or black (typically its substream).",
  preview_entity: 'Last good picture shown when no stream plays, e.g. image.<camera>_preview of Plooum CamPreview.',
  aspect_ratio: 'e.g. 16:9, 4:3',
};

class HaPlooumCameraCardEditor extends LitElement {
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
      const v = config[key];
      if (v === '' || v === undefined || v === null || (key in DEFAULTS && v === DEFAULTS[key] && !(key in this._config))) {
        delete config[key];
      }
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
    const recorder = 'snapshot' in ((this.hass.services && this.hass.services[RECORDER]) || {});
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ ...DEFAULTS, ...this._config }}
        .schema=${SCHEMA}
        .computeLabel=${(s) => LABELS[s.name] || s.name}
        .computeHelper=${(s) => HELPERS[s.name]}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="hint">
        ${recorder
          ? 'Photo and video buttons save on the server through Plooum CamRecorder.'
          : html`Install <a href="https://github.com/plooum/HA-Plooum-CamRecorder" target="_blank" rel="noreferrer">Plooum CamRecorder</a>
            to get the photo and video buttons.`}
      </div>
      <div class="hint">Zoom with the wheel, a pinch or a double tap; drag to move.</div>
    `;
  }

  static get styles() {
    return css`
      .hint {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        padding-top: 8px;
      }
      .hint a {
        color: var(--primary-color);
      }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get('ha-plooum-camera-card')) {
  customElements.define('ha-plooum-camera-card', HaPlooumCameraCard);
}
if (!customElements.get('ha-plooum-camera-card-editor')) {
  customElements.define('ha-plooum-camera-card-editor', HaPlooumCameraCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-camera-card')) {
  window.customCards.push({
    type: 'ha-plooum-camera-card',
    name: 'Ha Plooum Camera Card',
    description: 'A live camera with zoom, photo and video buttons (Plooum CamRecorder), and a fallback stream then a preview picture when it fails.',
    preview: true,
  });
}
