import { LitElement, html, css, nothing } from "lit";

const CARD_VERSION = '1.0.0';

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const CLIP_RE = /^(\d{2}):(\d{2}):(\d{2})-(\d{2}):(\d{2}):(\d{2})(?:\.[A-Za-z0-9]+)?$/;
const DAY_SECONDS = 86400;
const MAX_THUMB_JOBS = 2;
const THUMB_TIMEOUT_MS = 15000;

/* ==========================================================================
   MAIN CARD : ha-plooum-gallery-card
   ========================================================================== */
class HaPlooumGalleryCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _days: { state: true },       // [{ date, id }] ascending, null until loaded
      _dayIdx: { state: true },     // index in _days of the displayed day
      _clips: { state: true },      // clips of the displayed day, ascending
      _sel: { state: true },        // selected clip
      _src: { state: true },        // playable URL of the selected clip
      _playError: { state: true },
      _prevIdx: { state: true },    // nearest earlier / later day with videos, -1 = none
      _nextIdx: { state: true },
      _loading: { state: true },
      _error: { state: true },
      _thumbs: { state: true },     // media_content_id -> data URL
    };
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-gallery-card-editor");
  }

  static getStubConfig() {
    return { media_source: 'media-source://media_source/local' };
  }

  // Seconds since midnight of "HH:MM:SS" parts, or null when the title is not a clip name.
  static parseClip(title) {
    const m = CLIP_RE.exec(String(title || '').trim());
    if (!m) return null;
    const start = +m[1] * 3600 + +m[2] * 60 + +m[3];
    const end = +m[4] * 3600 + +m[5] * 60 + +m[6];
    return { start, end: Math.max(end, start), label: `${m[1]}:${m[2]}:${m[3]} – ${m[4]}:${m[5]}:${m[6]}`, time: `${m[1]}:${m[2]}` };
  }

  constructor() {
    super();
    this._days = null;
    this._dayIdx = -1;
    this._clips = [];
    this._sel = null;
    this._src = null;
    this._playError = false;
    this._prevIdx = -1;
    this._nextIdx = -1;
    this._loading = true;
    this._error = null;
    this._thumbs = {};
    this._dayCache = new Map();   // date -> clips
    this._thumbCache = new Map(); // media_content_id -> data URL | false (failed)
    this._thumbQueue = [];
    this._thumbActive = 0;
    this._nav = 0;                // navigation token: a stale async result is dropped
    this._started = false;
    this._firstOpen = true;
  }

  setConfig(config) {
    if (!config || !config.media_source) {
      throw new Error('media_source is required');
    }
    const first = !this.config;
    const changed = this.config && this.config.media_source !== config.media_source;
    this.config = { autoplay: false, muted: true, thumb_size: 140, show_timeline: true, ...config };
    if (changed) {
      this._dayCache.clear();
      this._started = false;
      this._firstOpen = true;
    }
    if (!first && changed && this.hass) this._start();
  }

  getCardSize() {
    return 6;
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-GALLERY-CARD %c ${CARD_VERSION} `,
      'color: white; background: #e53935; font-weight: 700;',
      'color: #e53935; background: white; font-weight: 700;'
    );
  }

  updated(changed) {
    if (changed.has('hass') && this.hass && !this._started && this.config) this._start();
  }

  /* ---------- media browsing ---------- */

  _browse(id) {
    return this.hass.callWS({ type: 'media_source/browse_media', media_content_id: id });
  }

  // Loads the day list, then opens the most recent day that has videos.
  async _start() {
    this._started = true;
    const nav = ++this._nav;
    this._loading = true;
    this._error = null;
    try {
      const root = await this._browse(this.config.media_source);
      if (nav !== this._nav) return;
      this._days = (root.children || [])
        .filter((c) => DAY_RE.test(String(c.title || '').trim()))
        .map((c) => ({ date: c.title.trim(), id: c.media_content_id }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));
      const idx = await this._scan(this._days.length, -1);
      if (nav !== this._nav) return;
      if (idx < 0) {
        this._dayIdx = -1;
        this._clips = [];
        this._sel = null;
        this._src = null;
        this._prevIdx = this._nextIdx = -1;
      } else {
        await this._showDay(idx, nav);
      }
    } catch (e) {
      if (nav === this._nav) this._error = e?.message || String(e);
    }
    if (nav === this._nav) this._loading = false;
  }

  // Clips of a day (cached).
  async _dayClips(idx) {
    const day = this._days[idx];
    if (this._dayCache.has(day.date)) return this._dayCache.get(day.date);
    const res = await this._browse(day.id);
    const clips = (res.children || [])
      .filter((c) => c.can_play)
      .map((c) => ({ c, p: HaPlooumGalleryCard.parseClip(c.title) }))
      .filter((x) => x.p)
      .map((x) => ({ id: x.c.media_content_id, ...x.p }))
      .sort((a, b) => a.start - b.start);
    this._dayCache.set(day.date, clips);
    return clips;
  }

  // Nearest day with videos from `from` (excluded) in direction dir (-1 earlier, +1 later), or -1.
  async _scan(from, dir) {
    for (let i = from + dir; i >= 0 && i < this._days.length; i += dir) {
      if ((await this._dayClips(i)).length) return i;
    }
    return -1;
  }

  async _showDay(idx, nav = ++this._nav) {
    const clips = await this._dayClips(idx);
    if (nav !== this._nav) return;
    this._dayIdx = idx;
    this._clips = clips;
    this._thumbQueue = [];
    this._queueThumbs();
    const play = this._firstOpen ? this.config.autoplay : false;
    this._firstOpen = false;
    this._select(clips[clips.length - 1], play);
    const [prev, next] = await Promise.all([this._scan(idx, -1), this._scan(idx, 1)]);
    if (nav !== this._nav) return;
    this._prevIdx = prev;
    this._nextIdx = next;
  }

  async _go(idx) {
    if (idx < 0) return;
    this._error = null;
    try {
      await this._showDay(idx);
    } catch (e) {
      this._error = e?.message || String(e);
    }
  }

  async _today() {
    this._started = true;
    this._firstOpen = false;
    this._dayCache.clear();
    await this._start();
  }

  /* ---------- playback ---------- */

  // The signed URL expires: it is resolved when the clip is selected.
  async _select(clip, play = true) {
    this._sel = clip || null;
    this._playError = false;
    this._src = null;
    if (!clip) return;
    const token = (this._selToken = (this._selToken || 0) + 1);
    try {
      const res = await this.hass.callWS({ type: 'media_source/resolve_media', media_content_id: clip.id });
      if (token !== this._selToken) return;
      this._src = this.hass.hassUrl ? this.hass.hassUrl(res.url) : res.url;
      if (play) {
        await this.updateComplete;
        this.renderRoot.querySelector('video')?.play?.().catch(() => {});
      }
    } catch (e) {
      if (token === this._selToken) this._playError = true;
    }
  }

  /* ---------- thumbnails ---------- */

  _queueThumbs() {
    for (const clip of [...this._clips].reverse()) {
      if (!this._thumbCache.has(clip.id) && !this._thumbQueue.includes(clip)) this._thumbQueue.push(clip);
    }
    this._pumpThumbs();
  }

  _pumpThumbs() {
    while (this._thumbActive < MAX_THUMB_JOBS && this._thumbQueue.length) {
      const clip = this._thumbQueue.shift();
      if (this._thumbCache.has(clip.id)) continue;
      this._thumbActive++;
      this._extract(clip)
        .catch(() => false)
        .then((url) => {
          this._thumbCache.set(clip.id, url);
          if (url) this._thumbs = { ...this._thumbs, [clip.id]: url };
          this._thumbActive--;
          this._pumpThumbs();
        });
    }
  }

  // A frame of the clip drawn in a canvas, off screen.
  async _extract(clip) {
    const res = await this.hass.callWS({ type: 'media_source/resolve_media', media_content_id: clip.id });
    const url = this.hass.hassUrl ? this.hass.hassUrl(res.url) : res.url;
    return new Promise((resolve, reject) => {
      const v = document.createElement('video');
      let done = false;
      const finish = (fn, val) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        v.removeAttribute('src');
        v.load();
        fn(val);
      };
      const timer = setTimeout(() => finish(reject, new Error('timeout')), THUMB_TIMEOUT_MS);
      v.muted = true;
      v.preload = 'metadata';
      v.addEventListener('error', () => finish(reject, new Error('video error')));
      v.addEventListener('loadedmetadata', () => {
        const d = Number.isFinite(v.duration) ? v.duration : 2;
        v.currentTime = Math.min(1, d / 2);
      });
      v.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = Math.round(320 * ((v.videoHeight || 9) / (v.videoWidth || 16)));
          canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
          finish(resolve, canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) {
          finish(reject, e);
        }
      });
      v.src = url;
    });
  }

  /* ---------- rendering ---------- */

  _dayLabel() {
    const date = this._days?.[this._dayIdx]?.date;
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    try {
      return new Date(y, m - 1, d).toLocaleDateString(this.hass?.locale?.language || undefined, { day: 'numeric', month: 'long' });
    } catch (e) {
      return date;
    }
  }

  _renderTimeline() {
    if (!this.config.show_timeline || !this._clips.length) return nothing;
    return html`
      <div class="timeline">
        <div class="track">
          ${this._clips.map((c) => html`
            <div class="seg ${this._sel === c ? 'sel' : ''}"
                 style="left: ${(c.start / DAY_SECONDS) * 100}%; width: ${((c.end - c.start) / DAY_SECONDS) * 100}%"
                 title=${c.label}
                 @click=${() => this._select(c)}></div>
          `)}
        </div>
        <div class="ticks">
          ${[0, 6, 12, 18, 24].map((h) => html`<span style="left: ${(h / 24) * 100}%">${String(h).padStart(2, '0')}h</span>`)}
        </div>
      </div>
    `;
  }

  _renderPlayer() {
    if (this._playError) return html`<div class="player msg">This video can't be played</div>`;
    if (!this._src) return html`<div class="player msg">${this._sel ? 'Loading…' : ''}</div>`;
    return html`<video class="player" controls playsinline
        .muted=${this.config.muted}
        src=${this._src}
        @error=${() => { this._playError = true; }}></video>`;
  }

  render() {
    if (!this.config) return nothing;
    const empty = this._days && this._dayIdx < 0 && !this._loading && !this._error;
    return html`
      <ha-card style="--tl-color: ${this.config.timeline_color || 'var(--accent-color)'}">
        ${this._error ? html`<div class="msg err">Could not browse the recordings: ${this._error}</div>` : nothing}
        ${this._loading && this._dayIdx < 0 ? html`<div class="msg">Loading…</div>` : nothing}
        ${empty ? html`<div class="msg">No recordings</div>` : nothing}
        ${this._dayIdx >= 0 ? html`
          ${this._renderPlayer()}
          <div class="bar">
            <button class="today" @click=${() => this._today()}>Today</button>
            <span class="spacer"></span>
            <button class="prev" ?disabled=${this._prevIdx < 0} @click=${() => this._go(this._prevIdx)} aria-label="Previous day">‹</button>
            <span class="date">${this._dayLabel()}</span>
            <button class="next" ?disabled=${this._nextIdx < 0} @click=${() => this._go(this._nextIdx)} aria-label="Next day">›</button>
          </div>
          ${this._renderTimeline()}
          <div class="grid" style="--thumb: ${Number(this.config.thumb_size) || 140}px">
            ${[...this._clips].reverse().map((c) => html`
              <button class="thumb ${this._sel === c ? 'sel' : ''}" title=${c.label} @click=${() => this._select(c)}
                      style=${this._thumbs[c.id] ? `background-image: url(${this._thumbs[c.id]})` : ''}>
                <span class="time">${c.time}</span>
              </button>
            `)}
          </div>
        ` : nothing}
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card { padding: 12px; overflow: hidden; }
      .msg { padding: 16px; text-align: center; color: var(--secondary-text-color); }
      .msg.err { color: var(--error-color); }
      .player { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; border-radius: 8px; }
      .player.msg { display: flex; align-items: center; justify-content: center; color: #ccc; }
      .bar { display: flex; align-items: center; gap: 4px; padding: 10px 0 6px; }
      .spacer { flex: 1; }
      .date { min-width: 7em; text-align: center; font-weight: 500; }
      button {
        font: inherit; cursor: pointer; color: var(--primary-text-color);
        background: var(--secondary-background-color); border: none; border-radius: 8px; padding: 6px 12px;
      }
      button:disabled { opacity: 0.4; cursor: default; }
      .prev, .next { padding: 6px 12px; font-size: 1.2em; line-height: 1; }
      .timeline { padding: 6px 0 4px; }
      .track {
        position: relative; height: 18px; border-radius: 6px;
        background: var(--secondary-background-color);
        background-image: repeating-linear-gradient(to right, transparent 0 calc(25% - 1px), var(--divider-color) calc(25% - 1px) 25%);
      }
      .seg {
        position: absolute; top: 2px; bottom: 2px; min-width: 4px; border-radius: 3px;
        background: var(--tl-color); opacity: 0.45; cursor: pointer;
      }
      .seg.sel { opacity: 1; }
      .ticks { position: relative; height: 1.2em; font-size: 0.75em; color: var(--secondary-text-color); }
      .ticks span { position: absolute; transform: translateX(-50%); }
      .ticks span:first-child { transform: none; }
      .ticks span:last-child { transform: translateX(-100%); }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, var(--thumb)); gap: 8px; padding-top: 8px; }
      .thumb {
        position: relative; width: var(--thumb); aspect-ratio: 16 / 9; padding: 0; overflow: hidden;
        background-color: var(--secondary-background-color); background-size: cover; background-position: center;
        border: 2px solid transparent;
      }
      .thumb.sel { border-color: var(--tl-color); }
      .time {
        position: absolute; left: 0; right: 0; bottom: 0; padding: 2px 6px; text-align: left;
        font-size: 0.8em; color: #fff; background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      }
    `;
  }
}

/* ==========================================================================
   EDITOR : ha-plooum-gallery-card-editor
   ========================================================================== */
const SCHEMA = [
  { name: 'media_source', selector: { text: {} } },
  { name: 'autoplay', selector: { boolean: {} } },
  { name: 'muted', selector: { boolean: {} } },
  { name: 'show_timeline', selector: { boolean: {} } },
  { name: 'thumb_size', selector: { number: { min: 60, max: 400, step: 10, mode: 'box', unit_of_measurement: 'px' } } },
];
const LABELS = {
  media_source: 'Media source folder (media-source://…)',
  autoplay: 'Play the selected clip when the card opens',
  muted: 'Muted',
  show_timeline: 'Show the 24 h timeline',
  thumb_size: 'Thumbnail width',
};

class HaPlooumGalleryCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { state: true },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _emit(config) {
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

  _valueChanged(ev) {
    this._emit({ ...ev.detail.value, ...(this._config?.timeline_color ? { timeline_color: this._config.timeline_color } : {}) });
  }

  _colorChanged(ev) {
    this._emit({ ...this._config, timeline_color: ev.target.value });
  }

  _colorCleared() {
    const config = { ...this._config };
    delete config.timeline_color;
    this._emit(config);
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const data = { autoplay: false, muted: true, thumb_size: 140, show_timeline: true, ...this._config };
    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${SCHEMA}
          .computeLabel=${(s) => LABELS[s.name] || s.name}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="color">
          <label for="tl-color">Timeline color</label>
          <input id="tl-color" type="color"
                 .value=${/^#[0-9a-f]{6}$/i.test(this._config.timeline_color || '') ? this._config.timeline_color : '#ff9800'}
                 @input=${this._colorChanged} />
          <ha-button @click=${this._colorCleared}>Use theme accent color</ha-button>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .color { display: flex; align-items: center; gap: 12px; padding-top: 8px; }
      .color label { flex: 1; }
      .color input { width: 48px; height: 32px; padding: 0; border: none; background: none; }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get("ha-plooum-gallery-card")) {
  customElements.define("ha-plooum-gallery-card", HaPlooumGalleryCard);
}
if (!customElements.get("ha-plooum-gallery-card-editor")) {
  customElements.define("ha-plooum-gallery-card-editor", HaPlooumGalleryCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === "ha-plooum-gallery-card")) {
  window.customCards.push({
    type: "ha-plooum-gallery-card",
    name: "Ha Plooum Gallery Card",
    description: "Browse a camera's recorded videos by day: player, 24 h timeline and thumbnails.",
    preview: false,
  });
}
