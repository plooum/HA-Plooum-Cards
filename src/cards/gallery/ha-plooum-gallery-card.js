import { LitElement, html, css, nothing } from "lit";

const CARD_VERSION = '1.1.0';

const DAY_SECONDS = 86400;

// File name / folder name formats. A pattern holds {start:FMT} (required) and {end:FMT}; the rest is
// literal. FMT tokens: X (Unix s), x (Unix ms), YYYY MM DD HH mm ss. The extension is ignored.
const FMT_TOKEN_RE = /X|x|YYYY|MM|DD|HH|mm|ss/g;
const FMT_DIGITS = { X: '\\d{9,11}', x: '\\d{12,14}', YYYY: '\\d{4}', MM: '\\d{2}', DD: '\\d{2}', HH: '\\d{2}', mm: '\\d{2}', ss: '\\d{2}' };
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const DEFAULT_FILE_FORMAT = 'auto';
const DEFAULT_FOLDER_FORMAT = 'YYYY-MM-DD';
const AUTO_FORMATS = ['{start:HH:mm:ss}-{end:HH:mm:ss}', '{start:X}-{end:X}'];

// Pattern -> { re, groups: [{ role: 'start' | 'end', tok }] } (throws on an invalid pattern).
function compileFormat(pattern) {
  const groups = [];
  const seen = new Set();
  let src = '';
  let last = 0;
  const place = /\{(start|end):([^{}]*)\}/g;
  const literal = (s) => {
    if (/[{}]/.test(s)) throw new Error(`Invalid format "${pattern}": unknown placeholder (use {start:FMT} and {end:FMT})`);
    return escapeRe(s);
  };
  let m;
  while ((m = place.exec(pattern))) {
    src += literal(pattern.slice(last, m.index));
    last = m.index + m[0].length;
    const role = m[1];
    if (seen.has(role)) throw new Error(`Invalid format "${pattern}": {${role}:…} appears twice`);
    seen.add(role);
    let pos = 0;
    let tok;
    FMT_TOKEN_RE.lastIndex = 0;
    while ((tok = FMT_TOKEN_RE.exec(m[2]))) {
      const lit = m[2].slice(pos, tok.index);
      if (/[A-Za-z]/.test(lit)) throw new Error(`Invalid format "${pattern}": unknown token "${lit}" (use X x YYYY MM DD HH mm ss)`);
      src += escapeRe(lit) + `(${FMT_DIGITS[tok[0]]})`;
      groups.push({ role, tok: tok[0] });
      pos = tok.index + tok[0].length;
    }
    const rest = m[2].slice(pos);
    if (/[A-Za-z]/.test(rest)) throw new Error(`Invalid format "${pattern}": unknown token "${rest}" (use X x YYYY MM DD HH mm ss)`);
    src += escapeRe(rest);
    if (!groups.some((g) => g.role === role)) throw new Error(`Invalid format "${pattern}": {${role}:…} has no token`);
  }
  src += literal(pattern.slice(last));
  if (!seen.has('start')) throw new Error(`Invalid format "${pattern}": {start:FMT} is required`);
  return { re: new RegExp(`^${src}(?:\\.[A-Za-z0-9]+)?$`), groups };
}

// Filename format option -> list of compiled patterns ('' / 'auto' = both built-in ones).
function compileFileFormats(format) {
  const f = String(format || '').trim();
  return (!f || f === DEFAULT_FILE_FORMAT ? AUTO_FORMATS : [f]).map(compileFormat);
}

// Day folder format option -> compiled pattern (must give the year, month and day).
function compileFolderFormat(format) {
  const f = String(format || '').trim() || DEFAULT_FOLDER_FORMAT;
  const c = compileFormat(`{start:${f}}`);
  const toks = c.groups.map((g) => g.tok);
  if (!['YYYY', 'MM', 'DD'].every((t) => toks.includes(t))) throw new Error(`Invalid folder_format "${f}": YYYY, MM and DD are required`);
  return c;
}

// Values captured for one role: { epoch } (seconds) or { date?, secs } of a wall clock.
function readRole(match, groups, role) {
  const f = {};
  groups.forEach((g, i) => { if (g.role === role) f[g.tok] = match[i + 1]; });
  if (f.X !== undefined) return { epoch: +f.X };
  if (f.x !== undefined) return { epoch: Math.floor(+f.x / 1000) };
  const n = (k) => (f[k] === undefined ? 0 : +f[k]);
  return {
    date: f.YYYY !== undefined && f.MM !== undefined && f.DD !== undefined ? `${f.YYYY}-${f.MM}-${f.DD}` : null,
    secs: n('HH') * 3600 + n('mm') * 60 + n('ss'),
  };
}

const pad2 = (n) => String(n).padStart(2, '0');
const hmsOf = (secs) => `${pad2(Math.floor(secs / 3600) % 24)}:${pad2(Math.floor(secs / 60) % 60)}:${pad2(secs % 60)}`;

function dayDiff(a, b) { // whole days from date a to date b ("YYYY-MM-DD")
  return Math.round((Date.parse(b) - Date.parse(a)) / (DAY_SECONDS * 1000));
}

// Unix seconds -> { date, secs } on the wall clock of `timeZone` (undefined = browser).
function localClock(t, timeZone) {
  const opts = { hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  let fmt;
  try {
    fmt = new Intl.DateTimeFormat('en-CA', { ...opts, timeZone });
  } catch (err) {
    fmt = new Intl.DateTimeFormat('en-CA', opts);
  }
  const o = {};
  for (const p of fmt.formatToParts(new Date(t * 1000))) o[p.type] = p.value;
  const hh = o.hour === '24' ? '00' : o.hour;
  return { date: `${o.year}-${o.month}-${o.day}`, secs: +hh * 3600 + +o.minute * 60 + +o.second };
}
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

  // Parses a clip name with a `filename_format` option ('' / 'auto' = both built-in formats; a compiled
  // list from compileFileFormats is accepted too). Unix times are read in `timeZone` (undefined =
  // browser), wall-clock tokens as they are. Returns { start, end (seconds since midnight, may pass
  // 86400), label, time, date } (date = day of the start, null when the name does not give it), or null
  // when the title is not a clip name.
  static parseClip(title, timeZone, format) {
    const name = String(title || '').trim();
    const formats = Array.isArray(format) ? format : compileFileFormats(format);
    for (const { re, groups } of formats) {
      const m = re.exec(name);
      if (!m) continue;
      const s = readRole(m, groups, 'start');
      const e = groups.some((g) => g.role === 'end') ? readRole(m, groups, 'end') : null;
      let date;
      let start;
      let end;
      let startLabel;
      let endLabel;
      if (s.epoch !== undefined) {
        const a = localClock(s.epoch, timeZone);
        const dur = e ? Math.max((e.epoch !== undefined ? e.epoch : s.epoch) - s.epoch, 0) : 0;
        ({ date, secs: start } = a);
        end = start + dur;
        startLabel = hmsOf(start);
        endLabel = hmsOf(localClock(s.epoch + dur, timeZone).secs);
      } else {
        ({ date, secs: start } = s);
        end = e ? (e.epoch !== undefined ? localClock(e.epoch, timeZone).secs : e.secs + (e.date && date ? dayDiff(date, e.date) * DAY_SECONDS : 0)) : start;
        end = Math.max(end, start);
        startLabel = hmsOf(start);
        endLabel = hmsOf(end);
      }
      return { start, end, label: e ? `${startLabel} – ${endLabel}` : startLabel, time: startLabel.slice(0, 5), date };
    }
    return null;
  }

  // Day of a folder name given the `folder_format` option (compiled by compileFolderFormat), or null.
  static parseFolder(title, compiled) {
    const m = compiled.re.exec(String(title || '').trim());
    return m ? readRole(m, compiled.groups, 'start').date : null;
  }

  // Time zone clip names are read in: HA's when the user's profile follows the server, else the browser's.
  _timeZone() {
    return this.hass?.locale?.time_zone === 'server' ? this.hass?.config?.time_zone : undefined;
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
    const fileFormats = compileFileFormats(config.filename_format);
    const folderFormat = compileFolderFormat(config.folder_format);
    const first = !this.config;
    const changed = this.config && ['media_source', 'filename_format', 'folder_format'].some((k) => this.config[k] !== config[k]);
    this._fileFormats = fileFormats;
    this._folderFormat = folderFormat;
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
      const tz = this._timeZone();
      const byDate = new Map();
      const entry = (date) => {
        if (!byDate.has(date)) byDate.set(date, { date, id: null, flat: [] });
        return byDate.get(date);
      };
      for (const c of root.children || []) {
        const title = String(c.title || '').trim();
        const folderDate = c.can_play ? null : HaPlooumGalleryCard.parseFolder(title, this._folderFormat);
        if (folderDate) {
          entry(folderDate).id = c.media_content_id;
        } else if (c.can_play) {
          const p = HaPlooumGalleryCard.parseClip(title, tz, this._fileFormats);
          if (p?.date) entry(p.date).flat.push({ id: c.media_content_id, ...p });
        }
      }
      this._days = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
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
    const tz = this._timeZone();
    const res = day.id ? await this._browse(day.id) : { children: [] };
    const clips = (res.children || [])
      .filter((c) => c.can_play)
      .map((c) => ({ c, p: HaPlooumGalleryCard.parseClip(c.title, tz, this._fileFormats) }))
      .filter((x) => x.p)
      .map((x) => ({ id: x.c.media_content_id, ...x.p }))
      .concat(day.flat)
      .sort((a, b) => a.start - b.start || a.end - b.end);
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
                 style="left: ${(c.start / DAY_SECONDS) * 100}%; width: ${((Math.min(c.end, DAY_SECONDS) - c.start) / DAY_SECONDS) * 100}%"
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
  { name: 'filename_format', selector: { text: {} } },
  { name: 'folder_format', selector: { text: {} } },
  { name: 'autoplay', selector: { boolean: {} } },
  { name: 'muted', selector: { boolean: {} } },
  { name: 'show_timeline', selector: { boolean: {} } },
  { name: 'thumb_size', selector: { number: { min: 60, max: 400, step: 10, mode: 'box', unit_of_measurement: 'px' } } },
];
const LABELS = {
  media_source: 'Media source folder (media-source://…)',
  filename_format: 'File name format (blank = auto)',
  folder_format: 'Day folder format',
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
    const data = { folder_format: DEFAULT_FOLDER_FORMAT, autoplay: false, muted: true, thumb_size: 140, show_timeline: true, ...this._config };
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
