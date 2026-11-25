import { LitElement, html, css, nothing, render as litRender } from "lit";

const CARD_VERSION = '1.2.0';

/*
 * Climate schedule card: the interface of the Plooum Climate Scheduler integration
 * (https://github.com/plooum/HA-Plooum-ClimateScheduler), which stores the schedules and applies them.
 *
 * The card shows, per program (a set of thermostats), the temperature of the current slot and the next
 * change, manual overrides, and the house-wide profile (Default, Holidays…). Its "Schedule" button opens a
 * dialog with the week of a program under a profile: a column per day where slots are drawn, painted with
 * the palette, resized by their edges, tapped to change their temperature or delete them, and days copied
 * onto others. On a narrow screen the dialog shows one day at a time, with a round + button to add a slot.
 *
 * Everything goes through the integration's websocket API (plooum_climate_scheduler/*): the card keeps no
 * schedule in its own config, only which programs it shows.
 *
 * A week is a step function: each point {at, value} holds until the next one, the last point of a day runs
 * on into the next day. While editing, every day gets a point at 00:00 (the value carried from the day
 * before), so each day reads on its own; points are kept in minutes and saved as "HH:MM".
 */

const WS = 'plooum_climate_scheduler/';
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const OFF = 'off';
const STEP = 5; // minutes
const DAY_MIN = 1440;
const DEFAULT_TEMP = 19;
const TEMP_STEP = 0.5;
const NARROW = 700; // px: below, the dialog fills the screen with a compact week
const DRAG_THRESHOLD = 6; // px before a press on a day becomes a drawing

/* ==========================================================================
   LANGUAGES: English, French when Home Assistant's language is French
   ========================================================================== */

const DAYS_I18N = {
  en: {
    names: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    letter: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  },
  fr: {
    names: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
    short: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    letter: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  },
};

// English text -> French. A missing key shows the English text.
const FR = {
  'Heating': 'Chauffage',
  'The Plooum Climate Scheduler integration is not installed.': "L'intégration Plooum Climate Scheduler n'est pas installée.",
  'Off': 'Éteint',
  'Default': 'Défaut',
  'Loading…': 'Chargement…',
  'No program yet: open the schedule to create one.': 'Aucun programme : ouvrez la programmation pour en créer un.',
  'Schedule off': 'Programmation désactivée',
  'No schedule': 'Pas de programmation',
  '→ {value} at {time}': '→ {value} à {time}',
  'midnight': 'minuit',
  'tomorrow {time}': 'demain {time}',
  '{name}: {value} by hand': '{name} : {value} à la main',
  '{name}: {value} by hand until {time}': "{name} : {value} à la main jusqu'à {time}",
  'Resume': 'Reprendre',
  'Schedule': 'Programmer',
  'Discard your unsaved changes?': 'Abandonner les modifications non enregistrées ?',
  'New program': 'Nouveau programme',
  'Give the program a name.': 'Donnez un nom au programme.',
  'Times are set by {step} minutes.': 'Les heures vont de {step} en {step} minutes.',
  'The slot must end after it starts.': 'Le créneau doit finir après son début.',
  'Enter a temperature.': 'Saisissez une température.',
  'Pick at least one day.': 'Choisissez au moins un jour.',
  'Delete the program {name}? Its thermostats will no longer be scheduled.': 'Supprimer le programme {name} ? Ses thermostats ne seront plus programmés.',
  'Heating schedule': 'Programmation du chauffage',
  'Unsaved': 'Non enregistré',
  'Active profile': 'Profil actif',
  'No thermostat': 'Aucun thermostat',
  'Profiles': 'Profils',
  'Program settings': 'Réglages du programme',
  '{profile} week of {program}.': 'Semaine {profile} de {program}.',
  'Use the {default} week instead': 'Utiliser plutôt la semaine {default}',
  'Under {profile}, {program} follows its {default} week.': 'En {profile}, {program} suit sa semaine {default}.',
  'Make its own {profile} week': 'Lui faire sa propre semaine {profile}',
  'No schedule.': 'Pas de programmation.',
  'No program.': 'Aucun programme.',
  'Paint with it: draw or tap slots': 'Peindre avec : dessinez ou touchez des créneaux',
  'Edit the palette': 'Modifier la palette',
  'Cancel': 'Annuler',
  'Save': 'Enregistrer',
  'Close': 'Fermer',
  'Add a slot': 'Ajouter un créneau',
  'Copy {day} to other days': "Copier {day} vers d'autres jours",
  'Copy the day': 'Copier le jour',
  'New slot · {day}': 'Nouveau créneau · {day}',
  'Day': 'Jour',
  'From': 'De',
  'To': 'À',
  'Colder': 'Moins chaud',
  'Warmer': 'Plus chaud',
  'Temperature': 'Température',
  'Delete': 'Supprimer',
  'Add': 'Ajouter',
  'Copy {day} to': 'Copier {day} vers',
  'Mon – Fri': 'Lun – Ven',
  'Sat – Sun': 'Sam – Dim',
  'Every day': 'Tous les jours',
  'Copy': 'Copier',
  'Program': 'Programme',
  'Name': 'Nom',
  'Thermostats': 'Thermostats',
  'in {name}': 'dans {name}',
  'No climate entity in Home Assistant.': 'Aucune entité climate dans Home Assistant.',
  'Mode when a slot turns the heating on': 'Mode quand un créneau rallume le chauffage',
  'Automatic (current mode, else heat)': 'Automatique (mode actuel, sinon chauffage)',
  'Schedule on': 'Programmation active',
  'The thermostat turns itself off (eco mode, standby)': "Le thermostat s'éteint tout seul (mode éco, veille)",
  'Going off by itself is then no manual change, and the schedule only turns back on what an Off slot turned off.': "Son extinction n'est alors pas un changement manuel, et la programmation ne rallume que ce qu'un créneau Éteint a éteint.",
  'Profiles of the house': 'Profils de la maison',
  'Profile name': 'Nom du profil',
  'Delete {name}': 'Supprimer {name}',
  'default': 'par défaut',
  'New profile (Holidays…)': 'Nouveau profil (Vacances…)',
  'A program without a week for a profile follows its {default} week.': 'Un programme sans semaine pour un profil suit sa semaine {default}.',
  'Save profiles': 'Enregistrer les profils',
  'Palette': 'Palette',
  'Remove {value}': 'Retirer {value}',
  'Shortcuts only: a slot takes any temperature. Shared by the whole house.': "De simples raccourcis : un créneau accepte n'importe quelle température. Commune à toute la maison.",
  'Done': 'Terminé',
  'Painting {value}: draw on a day or tap slots. Tap the color again to stop.': 'Peinture {value} : dessinez sur un jour ou touchez des créneaux. Touchez de nouveau la couleur pour arrêter.',
  'Draw on a day to add a slot, tap a slot to change it, drag its top edge to move it. A color of the palette paints.': 'Dessinez sur un jour pour ajouter un créneau, touchez un créneau pour le modifier, faites glisser son bord haut pour le déplacer. Une couleur de la palette peint.',
  'Title (Heating)': 'Titre (Chauffage)',
  'Programs shown (none checked: all)': 'Programmes affichés (aucun coché : tous)',
  'Show the profile switch': 'Afficher le choix du profil',
  'This card needs the Plooum Climate Scheduler integration (HACS), which stores and applies the schedules.': "Cette carte nécessite l'intégration Plooum Climate Scheduler (HACS), qui enregistre et applique les programmes.",
  'Programs, profiles and the week of each program are edited in the card itself: Schedule.': 'Les programmes, les profils et la semaine de chaque programme se modifient dans la carte elle-même : Programmer.',
};

let LANG = 'en';

/** Follow Home Assistant's language (the user's profile setting). */
function setLanguage(hass) {
  const lang = (hass && ((hass.locale && hass.locale.language) || hass.language)) || 'en';
  LANG = lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function t(text, vars = {}) {
  const out = (LANG === 'fr' && FR[text]) || text;
  return out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

const dayName = (i) => DAYS_I18N[LANG].names[i];
const dayShort = (i) => DAYS_I18N[LANG].short[i];
const dayLetter = (i) => DAYS_I18N[LANG].letter[i];
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/* ==========================================================================
   SCHEDULE HELPERS (pure)
   ========================================================================== */

const toMin = (text) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text || '');
  return m ? Math.min(DAY_MIN, Number(m[1]) * 60 + Number(m[2])) : NaN;
};
const fmtTime = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const sameValue = (a, b) => (a === OFF || b === OFF ? a === b : Math.abs(Number(a) - Number(b)) < 1e-6);
const clone = (o) => JSON.parse(JSON.stringify(o));

/** Engine week ({mon: [{at: "HH:MM", value}]}) -> editing week ({mon: [{at: minutes, value}]}). */
function weekFromEngine(week) {
  const out = {};
  for (const d of DAYS) {
    out[d] = ((week && week[d]) || []).map((p) => ({ at: toMin(p.at), value: p.value }))
      .filter((p) => !Number.isNaN(p.at) && p.at < DAY_MIN)
      .sort((a, b) => a.at - b.at);
  }
  return out;
}

function weekToEngine(week) {
  const out = {};
  for (const d of DAYS) out[d] = merge(week[d]).map((p) => ({ at: fmtTime(p.at), value: p.value }));
  return out;
}

/** The value holding when day `index` starts: the last point of the days before (cyclic), or null. */
function carried(week, index) {
  for (let k = 1; k <= 7; k++) {
    const pts = week[DAYS[(index - k + 7) % 7]] || [];
    if (pts.length) return pts[pts.length - 1].value;
  }
  return null;
}

/** Every day starts with a point at 00:00 (the carried value; `fallback` for an empty week). */
function normalizeWeek(week, fallback = DEFAULT_TEMP) {
  const out = clone(week);
  const starts = DAYS.map((_, i) => carried(week, i));
  DAYS.forEach((d, i) => {
    if (!out[d].length || out[d][0].at > 0) out[d].unshift({ at: 0, value: starts[i] ?? fallback });
  });
  return out;
}

/** Drop points that repeat the value before them (the 00:00 point stays). */
function merge(points) {
  const out = [];
  for (const p of [...points].sort((a, b) => a.at - b.at)) {
    if (out.length && out[out.length - 1].at === p.at) out[out.length - 1] = { ...p };
    else if (!out.length || p.at === 0 || !sameValue(out[out.length - 1].value, p.value)) out.push({ ...p });
  }
  return out;
}

/** Slots of a normalized day: [{start, end, value}]. */
function segments(points) {
  return points.map((p, i) => ({ start: p.at, end: i + 1 < points.length ? points[i + 1].at : DAY_MIN, value: p.value }));
}

function valueAt(points, minute) {
  let v = points.length ? points[0].value : null;
  for (const p of points) if (p.at <= minute) v = p.value;
  return v;
}

/** Give [start, end) the value; what follows `end` keeps its value. */
function setRange(points, start, end, value) {
  const after = valueAt(points, end);
  let out = points.filter((p) => p.at < start || p.at >= end);
  out.push({ at: start, value });
  if (end < DAY_MIN && !out.some((p) => p.at === end)) out.push({ at: end, value: after });
  return merge(out);
}

/** Remove the slot starting at `start`: the slot before takes its time (the first slot takes the next one's value). */
function removeSlot(points, start) {
  if (points.length < 2) return points;
  if (start === 0) {
    const out = points.slice(1);
    out[0] = { at: 0, value: out[0].value };
    return merge(out);
  }
  return merge(points.filter((p) => p.at !== start));
}

function resolveWeek(program, profileId) {
  const profiles = (program && program.profiles) || {};
  if (profiles[profileId]) return { profile: profileId, week: profiles[profileId] };
  if (profiles.default) return { profile: 'default', week: profiles.default };
  return { profile: null, week: null };
}

/** Today's slots of an engine week, for the card's day strip. */
function todaySegments(week, now = new Date()) {
  if (!week) return [];
  const w = weekFromEngine(week);
  if (!DAYS.some((d) => w[d].length)) return [];
  const index = (now.getDay() + 6) % 7;
  return segments(normalizeWeek(w)[DAYS[index]]);
}

/** Slot colors: blue when cold, pale around 18 °C, amber then red when warm; off is grey (CSS). */
const TEMP_STOPS = [
  [12, [111, 168, 220]],
  [16, [159, 197, 232]],
  [18, [207, 226, 243]],
  [19, [255, 229, 153]],
  [20.5, [249, 203, 156]],
  [22, [246, 178, 107]],
  [24, [224, 102, 102]],
];

function tempColors(value) {
  if (value === OFF || value === null || value === undefined) return { bg: '', fg: '' };
  const t = Number(value);
  let rgb = TEMP_STOPS[TEMP_STOPS.length - 1][1];
  if (t <= TEMP_STOPS[0][0]) rgb = TEMP_STOPS[0][1];
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    const [t0, c0] = TEMP_STOPS[i - 1];
    const [t1, c1] = TEMP_STOPS[i];
    if (t >= t0 && t <= t1) {
      const k = (t - t0) / (t1 - t0);
      rgb = c0.map((c, n) => Math.round(c + (c1[n] - c) * k));
      break;
    }
  }
  return { bg: `rgb(${rgb.join(',')})`, fg: '#212121' };
}

/* ==========================================================================
   MAIN CARD : ha-plooum-climate-schedule-card
   ========================================================================== */
class HaPlooumClimateScheduleCard extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      config: { attribute: false },
      _data: { state: true },
      _error: { state: true },
      _profileMenu: { state: true },
    };
  }

  static getConfigElement() {
    return document.createElement('ha-plooum-climate-schedule-card-editor');
  }

  static getStubConfig() {
    return {};
  }

  constructor() {
    super();
    this._data = null;
    this._error = '';
    this._profileMenu = false;
    this._dlg = null;
    this._unsub = null;
    this._onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (this._dlg && this._dlg.panel) this._dlgSet({ panel: null, sel: null });
      else this._closeDialog();
    };
    this._tick = null;
  }

  connectedCallback() {
    super.connectedCallback();
    console.info(
      `%c HA-PLOOUM-CLIMATE-SCHEDULE-CARD %c ${CARD_VERSION} `,
      'color: white; background: #e8833a; font-weight: 700;',
      'color: #e8833a; background: white; font-weight: 700;'
    );
    if (this.hass) this._subscribe();
    // The "now" marks move with the clock.
    this._tick = setInterval(() => { this.requestUpdate(); this._renderDialog(); }, 60000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._tick);
    this._closeDialog(true);
    this._unsubscribe();
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    if (config.programs !== undefined && !Array.isArray(config.programs)) throw new Error('programs must be a list');
    this.config = { ...config };
  }

  getCardSize() {
    return 1 + this._programs.length;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 4 };
  }

  willUpdate(changed) {
    if (changed.has('hass')) setLanguage(this.hass);
  }

  updated(changed) {
    if (changed.has('hass') && this.hass && !this._unsub && this.isConnected) this._subscribe();
  }

  // --- Engine ---

  _subscribe() {
    if (this._unsub || !this.hass) return;
    this._unsub = this.hass.connection
      .subscribeMessage((msg) => { this._data = msg; this._error = ''; this._renderDialog(); }, { type: WS + 'subscribe' })
      .catch((err) => {
        this._unsub = null;
        this._error = err && err.code === 'unknown_command'
          ? t('The Plooum Climate Scheduler integration is not installed.')
          : `Plooum Climate Scheduler: ${(err && err.message) || err}`;
        throw err;
      });
    this._unsub.catch(() => {});
  }

  _unsubscribe() {
    if (this._unsub) this._unsub.then((unsub) => unsub()).catch(() => {});
    this._unsub = null;
  }

  async _ws(type, data = {}) {
    return this.hass.callWS({ type: WS + type, ...data });
  }

  get _engine() {
    return (this._data && this._data.config) || { profiles: [], programs: [], palette: [], active_profile: 'default' };
  }

  get _status() {
    return (this._data && this._data.status) || {};
  }

  /** The programs this card shows (by id or name), in the engine's order (all when the config lists none). */
  get _programs() {
    const all = this._engine.programs;
    const keys = this.config && this.config.programs;
    return keys && keys.length ? all.filter((p) => keys.includes(p.id) || keys.includes(p.name)) : all;
  }

  get _unit() {
    return (this.hass && this.hass.config && this.hass.config.unit_system && this.hass.config.unit_system.temperature) || '°C';
  }

  _fmtValue(value, unit = false) {
    if (value === OFF) return t('Off');
    if (value === null || value === undefined) return '—';
    const n = Number(value);
    let text = Number.isInteger(n) ? String(n) : n.toFixed(1);
    if (LANG === 'fr') text = text.replace('.', ',');
    return unit ? `${text} ${this._unit}` : `${text}°`;
  }

  _profileName(id) {
    const p = this._engine.profiles.find((x) => x.id === id);
    if (!p) return id;
    // The engine names its default profile "Default": shown in the user's language until renamed.
    return p.id === 'default' && p.name === 'Default' ? t('Default') : p.name;
  }

  _entityName(entity) {
    const st = this.hass && this.hass.states[entity];
    return (st && st.attributes.friendly_name) || entity;
  }

  _fmtClock(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const time = fmtTime(d.getHours() * 60 + d.getMinutes());
    const days = Math.round((new Date(d.toDateString()) - new Date(now.toDateString())) / 86400000);
    if (days === 0) return time;
    if (days === 1) return time === '00:00' ? t('midnight') : t('tomorrow {time}', { time });
    return `${dayShort((d.getDay() + 6) % 7)} ${time}`;
  }

  async _activateProfile(id) {
    this._profileMenu = false;
    try {
      await this._ws('profile/activate', { profile_id: id });
    } catch (err) {
      this._error = err.message || String(err);
    }
  }

  async _resume(programId, entity) {
    try {
      await this._ws('override/clear', { program_id: programId, entity_id: [entity] });
    } catch (err) {
      this._error = err.message || String(err);
    }
  }

  // --- Card ---

  render() {
    if (!this.config) return nothing;
    const title = this.config.title ?? t('Heating');
    const engine = this._engine;
    const showProfile = this.config.show_profile !== false && engine.profiles.length > 1;
    return html`
      <ha-card>
        <div class="header">
          <ha-icon icon="mdi:calendar-clock"></ha-icon>
          <span class="title">${title}</span>
          ${showProfile ? html`
            <div class="profile">
              <button class="chip" @click=${() => { this._profileMenu = !this._profileMenu; }}
                aria-haspopup="listbox" aria-expanded=${this._profileMenu ? 'true' : 'false'}>
                ${this._profileName(engine.active_profile)}<ha-icon icon="mdi:menu-down"></ha-icon>
              </button>
              ${this._profileMenu ? html`
                <div class="menu" role="listbox">
                  ${engine.profiles.map((p) => html`
                    <button role="option" aria-selected=${p.id === engine.active_profile ? 'true' : 'false'}
                      class=${p.id === engine.active_profile ? 'current' : ''} @click=${() => this._activateProfile(p.id)}>
                      <ha-icon icon=${p.id === engine.active_profile ? 'mdi:check' : 'mdi:blank'}></ha-icon>${this._profileName(p.id)}
                    </button>`)}
                </div>` : nothing}
            </div>` : nothing}
        </div>
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        ${!this._data && !this._error ? html`<div class="empty">${t('Loading…')}</div>` : nothing}
        ${this._data && !this._programs.length ? html`<div class="empty">${t('No program yet: open the schedule to create one.')}</div>` : nothing}
        ${this._programs.map((p) => this._renderRow(p))}
        ${this._data ? html`
          <div class="footer">
            <button class="open" @click=${() => this._openDialog()}>
              <ha-icon icon="mdi:calendar-week"></ha-icon>${t('Schedule')}
            </button>
          </div>` : nothing}
      </ha-card>
    `;
  }

  _renderRow(program) {
    const st = this._status[program.id] || {};
    const overrides = Object.entries(st.overrides || {});
    let detail;
    if (!program.enabled) detail = html`<span class="muted">${t('Schedule off')}</span>`;
    else if (st.value === null || st.value === undefined) detail = html`<span class="muted">${t('No schedule')}</span>`;
    else {
      detail = html`<span class="now">${this._fmtValue(st.value)}</span>${st.next_change ? html`
        <span class="muted">${t('→ {value} at {time}', { value: this._fmtValue(st.next_value), time: this._fmtClock(st.next_change) })}</span>` : nothing}`;
    }
    const { week } = resolveWeek(program, this._engine.active_profile);
    const segs = program.enabled ? todaySegments(week) : [];
    const now = new Date();
    const nowPct = ((now.getHours() * 60 + now.getMinutes()) / DAY_MIN) * 100;
    return html`
      <div class="row" data-program=${program.id}>
        <button class="row-main" @click=${() => this._openDialog(program.id)}>
          <span class="name">${program.name}</span>
          <span class="value">${detail}</span>
        </button>
        ${segs.length ? html`
          <div class="strip" aria-hidden="true">
            ${segs.map((s) => {
              const c = tempColors(s.value);
              return html`<span class=${s.value === OFF ? 'off' : ''}
                style="left:${(s.start / DAY_MIN) * 100}%;width:${((s.end - s.start) / DAY_MIN) * 100}%;background:${c.bg}"></span>`;
            })}
            <i style="left:${nowPct}%"></i>
          </div>` : nothing}
        ${overrides.map(([entity, o]) => html`
          <div class="override" data-entity=${entity}>
            <ha-icon icon="mdi:hand-back-right"></ha-icon>
            <span>${this._overrideText(entity, o)}</span>
            <button class="link" @click=${() => this._resume(program.id, entity)}>${t('Resume')}</button>
          </div>`)}
      </div>
    `;
  }

  _overrideText(entity, o) {
    const vars = { name: this._entityName(entity), value: this._fmtValue(o.value), time: o.until ? this._fmtClock(o.until) : '' };
    return o.until ? t('{name}: {value} by hand until {time}', vars) : t('{name}: {value} by hand', vars);
  }

  /* ==========================================================================
     DIALOG (rendered in a container on document.body, so no card ancestor can clip or trap it)
     ========================================================================== */

  _openDialog(programId) {
    if (this._dlgHost) return;
    const programs = this._programs;
    const engine = this._engine;
    this._dlg = {
      programId: programId || (programs[0] && programs[0].id) || null,
      profileId: engine.active_profile,
      day: (new Date().getDay() + 6) % 7,
      drafts: {}, // program id (or "new:<n>") -> edited program, weeks in minutes
      sel: null, // {day, start}: the selected slot
      panel: null, // 'slot' | 'add' | 'copy' | 'program' | 'profiles' | 'palette'
      form: null, // values of the open panel
      brush: null, // palette value painted by drawing (desktop)
      drag: null,
      error: '',
      saving: false,
      newCount: 0,
    };
    if (!this._dlg.programId) this._newProgram();
    const host = document.createElement('div');
    host.setAttribute('data-plooum-climate-schedule-dialog', '');
    const root = host.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [DIALOG_STYLES.styleSheet];
    document.body.appendChild(host);
    this._dlgHost = host;
    this._resize = () => this._renderDialog();
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('resize', this._resize);
    this._renderDialog();
  }

  _closeDialog(force = false) {
    if (!this._dlgHost) return;
    if (!force && this._dirtyIds().length && !window.confirm(t('Discard your unsaved changes?'))) return;
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('resize', this._resize);
    this._dlgHost.remove();
    this._dlgHost = null;
    this._dlg = null;
  }

  /** The dialog's shadow root while it is open (for tests). */
  get dialogRoot() {
    return this._dlgHost ? this._dlgHost.shadowRoot : null;
  }

  _renderDialog() {
    if (this._dlgHost && this._dlg) litRender(this._dialogTemplate(), this._dlgHost.shadowRoot, { host: this });
  }

  _dlgSet(patch) {
    Object.assign(this._dlg, patch);
    this._renderDialog();
  }

  get _narrow() {
    return window.innerWidth < NARROW;
  }

  /** A touch screen: drawing is off (a drag scrolls), slots are added with the round + button. */
  get _touch() {
    return this._narrow || window.matchMedia('(pointer: coarse)').matches;
  }

  // --- Drafts ---

  _engineProgram(id) {
    return this._engine.programs.find((p) => p.id === id) || null;
  }

  /** The program being edited: its draft, else the engine's (read only until a change makes a draft). */
  _program(id = this._dlg.programId) {
    if (this._dlg.drafts[id]) return this._dlg.drafts[id];
    const p = this._engineProgram(id);
    if (!p) return null;
    const profiles = {};
    for (const [pid, week] of Object.entries(p.profiles || {})) profiles[pid] = weekFromEngine(week);
    return { ...clone(p), profiles };
  }

  _draft(id = this._dlg.programId) {
    if (!this._dlg.drafts[id]) this._dlg.drafts[id] = this._program(id);
    return this._dlg.drafts[id];
  }

  _dirtyIds() {
    return this._dlg ? Object.keys(this._dlg.drafts) : [];
  }

  /** The week shown: the program's week for the edited profile, normalized; `own` false when it falls back on Default. */
  _week(program = this._program()) {
    if (!program) return { week: null, own: false, from: null };
    const profileId = this._dlg.profileId;
    const own = !!program.profiles[profileId];
    const from = own ? profileId : (program.profiles.default ? 'default' : null);
    const week = from ? program.profiles[from] : null;
    return { week: week ? normalizeWeek(week) : null, own, from };
  }

  /** Change the edited week (creating the draft, and the profile's own week when it fell back on Default). */
  _editWeek(fn) {
    const program = this._draft();
    const { week } = this._week(program);
    const base = week || normalizeWeek(Object.fromEntries(DAYS.map((d) => [d, []])));
    program.profiles[this._dlg.profileId] = fn(clone(base)) || base;
    this._renderDialog();
  }

  _editDay(dayIndex, fn) {
    this._editWeek((week) => {
      week[DAYS[dayIndex]] = fn(week[DAYS[dayIndex]]);
      return week;
    });
  }

  _newProgram() {
    const id = `new:${++this._dlg.newCount}`;
    const week = normalizeWeek(Object.fromEntries(DAYS.map((d) => [d, []])));
    this._dlg.drafts[id] = { id: null, name: t('New program'), entities: [], enabled: true, hvac_mode: null, self_off: false, profiles: { default: week } };
    this._dlg.programId = id;
    this._dlg.profileId = 'default';
    this._dlg.sel = null;
    this._dlg.panel = 'program';
    this._dlg.form = this._programForm(this._dlg.drafts[id]);
  }

  async _save() {
    const ids = this._dirtyIds();
    if (!ids.length) return this._closeDialog(true);
    this._dlgSet({ saving: true, error: '' });
    try {
      for (const id of ids) {
        const d = this._dlg.drafts[id];
        if (!d.name || !d.name.trim()) throw new Error(t('Give the program a name.'));
        const profiles = {};
        for (const [pid, week] of Object.entries(d.profiles)) profiles[pid] = weekToEngine(week);
        const program = { id: d.id || undefined, name: d.name.trim(), entities: d.entities, enabled: d.enabled, hvac_mode: d.hvac_mode || null, profiles };
        // self_off came with the engine's 0.2.0: an older engine refuses the key, so it is only sent when known or set.
        if (d.self_off || this._engine.programs.some((p) => 'self_off' in p)) program.self_off = !!d.self_off;
        const saved = await this._ws('program/save', { program });
        delete this._dlg.drafts[id];
        if (this._dlg.programId === id) this._dlg.programId = saved.id;
      }
      this._closeDialog(true);
    } catch (err) {
      if (this._dlg) this._dlgSet({ saving: false, error: err.message || String(err) });
    }
  }

  // --- Pointer on the week ---

  _minuteAt(e, col) {
    const rect = col.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    return Math.max(0, Math.min(DAY_MIN, Math.round(((y / rect.height) * DAY_MIN) / STEP) * STEP));
  }

  _onDown(e, dayIndex) {
    if (e.button !== 0) return;
    const col = e.currentTarget;
    const handle = e.target.closest('.handle');
    const { week } = this._week();
    if (!week) return;
    try { col.setPointerCapture(e.pointerId); } catch (_) { /* synthetic events */ }
    if (handle) {
      e.preventDefault();
      this._dlg.drag = { mode: 'move', day: dayIndex, at: Number(handle.dataset.at), col };
      return;
    }
    // Drawing is a desktop gesture; on a touch screen a press only selects (the page must stay scrollable).
    const draw = !this._touch && e.pointerType !== 'touch';
    this._dlg.drag = { mode: 'press', day: dayIndex, col, y0: e.clientY, from: this._minuteAt(e, col), draw };
  }

  _onMove(e) {
    const drag = this._dlg && this._dlg.drag;
    if (!drag) return;
    const minute = this._minuteAt(e, drag.col);
    if (drag.mode === 'move') {
      const points = this._week().week[DAYS[drag.day]];
      const i = points.findIndex((p) => p.at === drag.at);
      if (i <= 0) return;
      const lo = points[i - 1].at + STEP;
      const hi = (i + 1 < points.length ? points[i + 1].at : DAY_MIN) - STEP;
      const at = Math.max(lo, Math.min(hi, minute));
      if (at === drag.at) return;
      this._editDay(drag.day, (pts) => pts.map((p) => (p.at === drag.at ? { ...p, at } : p)));
      if (this._dlg.sel && this._dlg.sel.day === drag.day && this._dlg.sel.start === drag.at) this._dlg.sel = { day: drag.day, start: at };
      drag.at = at;
      return;
    }
    if (drag.mode === 'press' && drag.draw && Math.abs(e.clientY - drag.y0) >= DRAG_THRESHOLD) drag.mode = 'draw';
    if (drag.mode === 'draw') {
      drag.to = minute;
      this._renderDialog();
    }
  }

  _onUp(e) {
    const drag = this._dlg && this._dlg.drag;
    if (!drag) return;
    this._dlg.drag = null;
    if (drag.mode === 'draw') {
      let start = Math.min(drag.from, drag.to ?? drag.from);
      let end = Math.max(drag.from, drag.to ?? drag.from);
      if (end - start < STEP) end = Math.min(DAY_MIN, start + STEP);
      if (end === start) start = end - STEP;
      const value = this._dlg.brush ?? this._lastTemp();
      this._editDay(drag.day, (pts) => setRange(pts, start, end, value));
      if (this._dlg.brush !== null && this._dlg.brush !== undefined) this._dlgSet({ sel: null, panel: null });
      else this._selectSlot(drag.day, start);
    } else if (drag.mode === 'press') {
      const minute = Math.min(DAY_MIN - 1, this._minuteAt(e, drag.col));
      const seg = segments(this._week().week[DAYS[drag.day]]).find((s) => s.start <= minute && minute < s.end);
      if (!seg) return;
      if (this._dlg.brush !== null && this._dlg.brush !== undefined && !this._touch) {
        this._editDay(drag.day, (pts) => setRange(pts, seg.start, seg.end, this._dlg.brush));
      } else {
        this._selectSlot(drag.day, seg.start);
      }
    } else {
      this._renderDialog();
    }
  }

  _lastTemp() {
    return this._dlg.lastTemp ?? DEFAULT_TEMP;
  }

  _selectSlot(dayIndex, start) {
    const seg = segments(this._week().week[DAYS[dayIndex]]).find((s) => s.start === start);
    if (!seg) return;
    this._dlgSet({
      sel: { day: dayIndex, start },
      panel: 'slot',
      form: { from: fmtTime(seg.start), to: fmtTime(seg.end % DAY_MIN), value: seg.value, lastTemp: seg.value === OFF ? this._lastTemp() : seg.value },
      error: '',
    });
  }

  // --- Slot panel (edit or add) ---

  _openAdd() {
    const day = this._dlg.sel ? this._dlg.sel.day : this._dlg.day;
    this._dlgSet({
      sel: null,
      panel: 'add',
      form: { day, from: '08:00', to: '09:00', value: this._lastTemp(), lastTemp: this._lastTemp() },
      error: '',
    });
  }

  _formRange() {
    const f = this._dlg.form;
    const start = toMin(f.from);
    let end = toMin(f.to);
    if (end === 0) end = DAY_MIN;
    if (Number.isNaN(start) || Number.isNaN(end) || start % STEP || end % STEP) return { error: t('Times are set by {step} minutes.', { step: STEP }) };
    if (end <= start) return { error: t('The slot must end after it starts.') };
    return { start, end };
  }

  _setFormValue(value) {
    const f = this._dlg.form;
    f.value = value;
    if (value !== OFF) f.lastTemp = value;
    this._renderDialog();
  }

  _stepTemp(delta) {
    const f = this._dlg.form;
    const base = f.value === OFF ? f.lastTemp : Number(f.value);
    this._setFormValue(Math.round((base + delta) / TEMP_STEP) * TEMP_STEP);
  }

  _applySlot() {
    const f = this._dlg.form;
    const range = this._formRange();
    if (range.error) return this._dlgSet({ error: range.error });
    const value = f.value === OFF ? OFF : Number(f.value);
    if (value !== OFF && (!Number.isFinite(value) || value < -50 || value > 100)) return this._dlgSet({ error: t('Enter a temperature.') });
    const day = this._dlg.panel === 'add' ? f.day : this._dlg.sel.day;
    if (this._dlg.panel === 'slot') {
      const old = this._dlg.sel.start;
      this._editDay(day, (pts) => setRange(removeSlot(pts, old), range.start, range.end, value));
    } else {
      this._editDay(day, (pts) => setRange(pts, range.start, range.end, value));
    }
    if (value !== OFF) this._dlg.lastTemp = value;
    this._dlgSet({ sel: null, panel: null, form: null, error: '' });
  }

  _deleteSlot() {
    const { day, start } = this._dlg.sel;
    this._editDay(day, (pts) => removeSlot(pts, start));
    this._dlgSet({ sel: null, panel: null, form: null });
  }

  // --- Copy a day ---

  _openCopy(dayIndex) {
    this._dlgSet({ sel: null, panel: 'copy', form: { from: dayIndex, to: [] }, error: '' });
  }

  _toggleCopyDay(i) {
    const to = this._dlg.form.to;
    this._dlg.form.to = to.includes(i) ? to.filter((x) => x !== i) : [...to, i];
    this._renderDialog();
  }

  _setCopyDays(list) {
    this._dlg.form.to = list.filter((i) => i !== this._dlg.form.from);
    this._renderDialog();
  }

  _applyCopy() {
    const { from, to } = this._dlg.form;
    if (!to.length) return this._dlgSet({ error: t('Pick at least one day.') });
    this._editWeek((week) => {
      for (const i of to) week[DAYS[i]] = clone(week[DAYS[from]]);
      return week;
    });
    this._dlgSet({ panel: null, form: null, error: '' });
  }

  // --- Profile week (own or Default) ---

  _createProfileWeek() {
    this._editWeek((week) => week);
  }

  _removeProfileWeek() {
    const program = this._draft();
    delete program.profiles[this._dlg.profileId];
    this._dlgSet({ sel: null, panel: null });
  }

  // --- Program panel ---

  _programForm(program) {
    return { name: program.name, entities: [...program.entities], enabled: program.enabled, hvac_mode: program.hvac_mode || '', self_off: !!program.self_off };
  }

  _openProgram() {
    this._dlgSet({ sel: null, panel: 'program', form: this._programForm(this._program()), error: '' });
  }

  _applyProgram() {
    const f = this._dlg.form;
    if (!f.name.trim()) return this._dlgSet({ error: t('Give the program a name.') });
    Object.assign(this._draft(), { name: f.name.trim(), entities: f.entities, enabled: f.enabled, hvac_mode: f.hvac_mode || null, self_off: f.self_off });
    this._dlgSet({ panel: null, form: null, error: '' });
  }

  async _deleteProgram() {
    const id = this._dlg.programId;
    const program = this._program();
    if (!window.confirm(t('Delete the program {name}? Its thermostats will no longer be scheduled.', { name: program.name }))) return;
    delete this._dlg.drafts[id];
    try {
      if (program.id) await this._ws('program/delete', { program_id: program.id });
    } catch (err) {
      return this._dlgSet({ error: err.message || String(err) });
    }
    const left = this._dialogPrograms().filter((p) => p.key !== id);
    this._dlgSet({ programId: left.length ? left[0].key : null, panel: null, form: null, sel: null, error: '' });
    if (!left.length) {
      this._newProgram();
      this._renderDialog();
    }
  }

  /** Climate entities and the program that already has each one (a thermostat belongs to one program). */
  _climates() {
    const owners = {};
    for (const p of this._engine.programs) for (const e of p.entities) owners[e] = { key: p.id, name: p.name };
    for (const [key, d] of Object.entries(this._dlg.drafts)) {
      for (const [e, o] of Object.entries(owners)) if (o.key === key && !d.entities.includes(e)) delete owners[e];
      for (const e of d.entities) owners[e] = { key, name: d.name };
    }
    return Object.keys(this.hass.states).filter((e) => e.startsWith('climate.')).sort()
      .map((e) => ({ entity: e, owner: owners[e] }));
  }

  // --- Profiles panel ---

  _openProfiles() {
    this._dlgSet({ sel: null, panel: 'profiles', form: { profiles: this._engine.profiles.map((p) => ({ ...p })), name: '' }, error: '' });
  }

  async _saveProfiles() {
    const f = this._dlg.form;
    const profiles = f.profiles.map((p) => ({ id: p.id, name: p.name.trim() }));
    if (f.name.trim()) profiles.push({ name: f.name.trim() });
    try {
      const saved = await this._ws('profiles/save', { profiles });
      const ids = saved.map((p) => p.id);
      for (const d of Object.values(this._dlg.drafts)) {
        for (const pid of Object.keys(d.profiles)) if (!ids.includes(pid)) delete d.profiles[pid];
      }
      this._dlgSet({ panel: null, form: null, error: '', profileId: ids.includes(this._dlg.profileId) ? this._dlg.profileId : 'default' });
    } catch (err) {
      this._dlgSet({ error: err.message || String(err) });
    }
  }

  // --- Palette ---

  _palette() {
    return this._engine.palette || [];
  }

  _pickBrush(value) {
    if (this._dlg.panel === 'slot' || this._dlg.panel === 'add') return this._setFormValue(value);
    if (this._touch) {
      // No painting on a touch screen: a color starts a new slot with it.
      this._openAdd();
      return this._setFormValue(value);
    }
    this._dlgSet({ brush: this._dlg.brush !== null && sameValue(this._dlg.brush, value) ? null : value });
  }

  async _savePalette(values) {
    try {
      await this._ws('palette/save', { palette: values });
      this._dlgSet({ error: '' });
    } catch (err) {
      this._dlgSet({ error: err.message || String(err) });
    }
  }

  _addPaletteValue() {
    const f = this._dlg.form || {};
    const value = Number(String(f.paletteValue ?? '').replace(',', '.'));
    if (!Number.isFinite(value)) return this._dlgSet({ error: t('Enter a temperature.') });
    this._dlg.form = { ...f, paletteValue: '' };
    this._savePalette([...this._palette(), value]);
  }

  // --- Dialog template ---

  /** Tabs: the programs of this card, then new drafts. */
  _dialogPrograms() {
    const shown = this._programs.map((p) => ({ key: p.id, name: (this._dlg.drafts[p.id] || p).name }));
    const drafts = Object.entries(this._dlg.drafts).filter(([k]) => k.startsWith('new:')).map(([k, d]) => ({ key: k, name: d.name }));
    return [...shown, ...drafts];
  }

  _dialogTemplate() {
    const dlg = this._dlg;
    const engine = this._engine;
    const program = this._program();
    const narrow = this._narrow;
    const dirty = this._dirtyIds();
    const { week, own, from } = this._week(program);
    const st = program && program.id ? this._status[program.id] : null;
    return html`
      <div class="backdrop" @click=${() => this._closeDialog()}></div>
      <div class="dialog ${narrow ? 'narrow' : ''} ${this._touch ? 'touch' : ''}" role="dialog" aria-modal="true" aria-label=${t('Heating schedule')}>
        <div class="top">
          <div class="tabs" role="tablist">
            ${this._dialogPrograms().map((p) => html`
              <button role="tab" class="tab ${p.key === dlg.programId ? 'on' : ''}" aria-selected=${p.key === dlg.programId ? 'true' : 'false'}
                @click=${() => this._dlgSet({ programId: p.key, sel: null, panel: null, error: '' })}>
                ${p.name}${dirty.includes(p.key) ? html`<span class="dot" title=${t('Unsaved')}></span>` : nothing}
              </button>`)}
            <button class="tab icon" title=${t('New program')} aria-label=${t('New program')} @click=${() => { this._newProgram(); this._renderDialog(); }}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
          <button class="icon-btn" title=${t('Close')} aria-label=${t('Close')} @click=${() => this._closeDialog()}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${program ? html`
          <div class="bar">
            <div class="profiles">
              ${engine.profiles.map((p) => html`
                <button class="chip ${p.id === dlg.profileId ? 'on' : ''}" data-profile=${p.id}
                  title=${p.id === engine.active_profile ? t('Active profile') : ''}
                  @click=${() => this._dlgSet({ profileId: p.id, sel: null, panel: null })}>
                  ${p.id === engine.active_profile ? html`<ha-icon icon="mdi:home-thermometer"></ha-icon>` : nothing}${this._profileName(p.id)}
                </button>`)}
              <button class="icon-btn small" title=${t('Profiles')} aria-label=${t('Profiles')} @click=${() => this._openProfiles()}><ha-icon icon="mdi:pencil"></ha-icon></button>
            </div>
            <div class="program-info">
              ${program.entities.length
                ? html`<span class="muted">${program.entities.map((e) => this._entityName(e)).join(', ')}</span>`
                : html`<span class="warn">${t('No thermostat')}</span>`}
              ${!program.enabled ? html`<span class="warn">${t('Off')}</span>` : nothing}
              <button class="icon-btn small" title=${t('Program settings')} aria-label=${t('Program settings')} @click=${() => this._openProgram()}><ha-icon icon="mdi:cog"></ha-icon></button>
            </div>
          </div>

          ${dlg.profileId !== 'default' ? html`
            <div class="note">
              ${own
                ? html`<span>${t('{profile} week of {program}.', { profile: this._profileName(dlg.profileId), program: program.name })}</span>
                    <button class="link" @click=${() => this._removeProfileWeek()}>${t('Use the {default} week instead', { default: this._profileName('default') })}</button>`
                : html`<span>${t('Under {profile}, {program} follows its {default} week.', { profile: this._profileName(dlg.profileId), program: program.name, default: from ? this._profileName('default') : '' })}</span>
                    <button class="link" @click=${() => this._createProfileWeek()}>${t('Make its own {profile} week', { profile: this._profileName(dlg.profileId) })}</button>`}
            </div>` : nothing}

          ${st && Object.keys(st.overrides || {}).length ? html`
            <div class="note">
              ${Object.entries(st.overrides).map(([e, o]) => html`<span>${this._overrideText(e, o)}</span>`)}
            </div>` : nothing}

          <div class="week-wrap ${dlg.profileId !== 'default' && !own ? 'inherited' : ''}">
            ${week ? this._weekView(week) : html`<div class="empty">${t('No schedule.')}</div>`}
          </div>
          ${this._panelTemplate()}
        ` : html`<div class="empty">${t('No program.')}</div>`}

        <div class="bottom">
          <div class="palette">
            ${this._palette().map((v) => {
              const c = tempColors(v);
              const on = dlg.brush !== null && sameValue(dlg.brush, v);
              return html`<button class="swatch ${on ? 'on' : ''}" style="background:${c.bg};color:${c.fg}" data-value=${v}
                title=${narrow ? '' : t('Paint with it: draw or tap slots')} @click=${() => this._pickBrush(v)}>${this._fmtValue(v)}</button>`;
            })}
            <button class="swatch off ${dlg.brush === OFF ? 'on' : ''}" data-value="off" @click=${() => this._pickBrush(OFF)}>${t('Off')}</button>
            <button class="icon-btn small" title=${t('Edit the palette')} aria-label=${t('Edit the palette')}
              @click=${() => this._dlgSet({ panel: 'palette', sel: null, form: { paletteValue: '' }, error: '' })}><ha-icon icon="mdi:palette-outline"></ha-icon></button>
          </div>
          ${dlg.error ? html`<div class="error">${dlg.error}</div>` : nothing}
          <div class="actions">
            <button class="btn" @click=${() => this._closeDialog()}>${t('Cancel')}</button>
            <button class="btn primary" ?disabled=${dlg.saving} @click=${() => this._save()}>${dirty.length ? t('Save') : t('Close')}</button>
          </div>
        </div>
        ${program && week && !dlg.panel ? html`<button class="fab" title=${t('Add a slot')} aria-label=${t('Add a slot')} @click=${() => this._openAdd()}><ha-icon icon="mdi:plus"></ha-icon></button>` : nothing}
      </div>
    `;
  }

  _nowMinute() {
    const now = new Date();
    return { day: (now.getDay() + 6) % 7, minute: now.getHours() * 60 + now.getMinutes() };
  }

  _column(week, dayIndex) {
    const dlg = this._dlg;
    const segs = segments(week[DAYS[dayIndex]]);
    const now = this._nowMinute();
    const drag = dlg.drag && dlg.drag.mode === 'draw' && dlg.drag.day === dayIndex ? dlg.drag : null;
    return html`
      <div class="col" data-day=${dayIndex}
        @pointerdown=${(e) => this._onDown(e, dayIndex)} @pointermove=${(e) => this._onMove(e)}
        @pointerup=${(e) => this._onUp(e)} @pointercancel=${() => { this._dlg.drag = null; this._renderDialog(); }}>
        ${[6, 12, 18].map((h) => html`<i class="hour" style="top:${(h / 24) * 100}%"></i>`)}
        ${segs.map((s) => {
          const c = tempColors(s.value);
          const sel = dlg.sel && dlg.sel.day === dayIndex && dlg.sel.start === s.start;
          return html`
            <div class="slot ${s.value === OFF ? 'off' : ''} ${sel ? 'sel' : ''}" data-start=${s.start}
              style="top:${(s.start / DAY_MIN) * 100}%;height:${((s.end - s.start) / DAY_MIN) * 100}%;background:${c.bg};color:${c.fg}">
              ${s.start > 0 ? html`<div class="handle" data-at=${s.start} title=${fmtTime(s.start)}></div>` : nothing}
              ${(s.end - s.start) >= 25 ? html`<span class="label">${this._fmtValue(s.value)}</span>` : nothing}
            </div>`;
        })}
        ${drag && drag.to !== undefined ? html`
          <div class="ghost" style="top:${(Math.min(drag.from, drag.to) / DAY_MIN) * 100}%;height:${(Math.abs(drag.to - drag.from) / DAY_MIN) * 100}%">
            <span>${fmtTime(Math.min(drag.from, drag.to))} – ${fmtTime(Math.max(drag.from, drag.to) % DAY_MIN)}</span>
          </div>` : nothing}
        ${now.day === dayIndex ? html`<i class="now" style="top:${(now.minute / DAY_MIN) * 100}%"></i>` : nothing}
      </div>
    `;
  }

  _hours() {
    return html`<div class="hours">${[0, 3, 6, 9, 12, 15, 18, 21].map((h) => html`<span style="top:${(h / 24) * 100}%">${String(h).padStart(2, '0')}</span>`)}</div>`;
  }

  _weekView(week) {
    const today = this._nowMinute().day;
    return html`
      <div class="week">
        <div class="head"><span></span>${DAYS.map((d, i) => html`
          <button class="day ${i === today ? 'today' : ''}" title=${t('Copy {day} to other days', { day: dayName(i) })} @click=${() => this._openCopy(i)}>
            ${dayShort(i)}<ha-icon icon="mdi:content-copy"></ha-icon>
          </button>`)}</div>
        <div class="grid">${this._hours()}${DAYS.map((_, i) => this._column(week, i))}</div>
      </div>
    `;
  }

  _panelTemplate() {
    const dlg = this._dlg;
    const f = dlg.form;
    switch (dlg.panel) {
      case 'slot':
      case 'add': {
        const value = f.value;
        const c = tempColors(value);
        return html`
          <div class="panel" data-panel=${dlg.panel}>
            <div class="panel-title">${dlg.panel === 'add' ? t('New slot · {day}', { day: dayName(f.day) }) : capitalize(dayName(dlg.sel.day))}</div>
            ${dlg.panel === 'add' ? html`
              <div class="days" role="radiogroup" aria-label=${t('Day')}>
                ${DAYS.map((d, i) => html`<button class="chip day-chip ${i === f.day ? 'on' : ''}" role="radio" aria-checked=${i === f.day ? 'true' : 'false'}
                  aria-label=${dayName(i)} data-day=${i} @click=${() => { f.day = i; this._renderDialog(); }}>${dayLetter(i)}</button>`)}
              </div>` : nothing}
            <div class="times">
              <label>${t('From')} <input type="time" step=${STEP * 60} .value=${f.from} @change=${(e) => { f.from = e.target.value; }}></label>
              <label>${t('To')} <input type="time" step=${STEP * 60} .value=${f.to} @change=${(e) => { f.to = e.target.value; }}></label>
            </div>
            <div class="temp">
              <button class="round" aria-label=${t('Colder')} @click=${() => this._stepTemp(-TEMP_STEP)}><ha-icon icon="mdi:minus"></ha-icon></button>
              <span class="temp-value ${value === OFF ? 'off' : ''}" style="background:${c.bg};color:${c.fg}">
                ${value === OFF ? t('Off') : html`<input type="number" step="0.5" .value=${String(value)} aria-label=${t('Temperature')}
                  @change=${(e) => this._setFormValue(Number(String(e.target.value).replace(',', '.')))}>`}
                ${value === OFF ? nothing : this._unit}
              </span>
              <button class="round" aria-label=${t('Warmer')} @click=${() => this._stepTemp(TEMP_STEP)}><ha-icon icon="mdi:plus"></ha-icon></button>
              <button class="chip ${value === OFF ? 'on' : ''}" @click=${() => this._setFormValue(value === OFF ? f.lastTemp : OFF)}>
                <ha-icon icon="mdi:power"></ha-icon>${t('Off')}
              </button>
            </div>
            <div class="panel-actions">
              ${dlg.panel === 'slot' ? html`<button class="btn danger" @click=${() => this._deleteSlot()}><ha-icon icon="mdi:delete"></ha-icon>${t('Delete')}</button>` : nothing}
              <span class="spacer"></span>
              <button class="btn" @click=${() => this._dlgSet({ panel: null, sel: null, form: null, error: '' })}>${t('Cancel')}</button>
              <button class="btn primary" @click=${() => this._applySlot()}>${dlg.panel === 'add' ? t('Add') : 'OK'}</button>
            </div>
          </div>`;
      }
      case 'copy':
        return html`
          <div class="panel" data-panel="copy">
            <div class="panel-title">${capitalize(t('Copy {day} to', { day: dayName(f.from) }))}</div>
            <div class="chips">
              ${DAYS.map((d, i) => html`<button class="chip ${f.to.includes(i) ? 'on' : ''}" ?disabled=${i === f.from} data-day=${i}
                @click=${() => this._toggleCopyDay(i)}>${dayShort(i)}</button>`)}
            </div>
            <div class="chips">
              <button class="link" @click=${() => this._setCopyDays([0, 1, 2, 3, 4])}>${t('Mon – Fri')}</button>
              <button class="link" @click=${() => this._setCopyDays([5, 6])}>${t('Sat – Sun')}</button>
              <button class="link" @click=${() => this._setCopyDays([0, 1, 2, 3, 4, 5, 6])}>${t('Every day')}</button>
            </div>
            <div class="panel-actions">
              <span class="spacer"></span>
              <button class="btn" @click=${() => this._dlgSet({ panel: null, form: null, error: '' })}>${t('Cancel')}</button>
              <button class="btn primary" @click=${() => this._applyCopy()}>${t('Copy')}</button>
            </div>
          </div>`;
      case 'program': {
        const climates = this._climates();
        const modes = new Set();
        for (const e of f.entities) for (const m of ((this.hass.states[e] || {}).attributes || {}).hvac_modes || []) if (m !== 'off') modes.add(m);
        return html`
          <div class="panel" data-panel="program">
            <div class="panel-title">${t('Program')}</div>
            <label class="field">${t('Name')} <input type="text" .value=${f.name} @input=${(e) => { f.name = e.target.value; }}></label>
            <div class="field">${t('Thermostats')}</div>
            <div class="checks">
              ${climates.length ? climates.map(({ entity, owner }) => {
                const mine = f.entities.includes(entity);
                const taken = !mine && owner && owner.key !== dlg.programId;
                return html`<label class=${taken ? 'taken' : ''}>
                  <input type="checkbox" .checked=${mine} ?disabled=${taken} data-entity=${entity}
                    @change=${(e) => { f.entities = e.target.checked ? [...f.entities, entity] : f.entities.filter((x) => x !== entity); this._renderDialog(); }}>
                  ${this._entityName(entity)}${taken ? html`<small>${t('in {name}', { name: owner.name })}</small>` : nothing}
                </label>`;
              }) : html`<span class="muted">${t('No climate entity in Home Assistant.')}</span>`}
            </div>
            <label class="field">${t('Mode when a slot turns the heating on')}
              <select @change=${(e) => { f.hvac_mode = e.target.value; }}>
                <option value="" ?selected=${!f.hvac_mode}>${t('Automatic (current mode, else heat)')}</option>
                ${[...modes].map((m) => html`<option value=${m} ?selected=${f.hvac_mode === m}>${m}</option>`)}
              </select>
            </label>
            <label class="switch"><input type="checkbox" data-field="self_off" .checked=${f.self_off} @change=${(e) => { f.self_off = e.target.checked; }}> ${t('The thermostat turns itself off (eco mode, standby)')}</label>
            <div class="hint">${t('Going off by itself is then no manual change, and the schedule only turns back on what an Off slot turned off.')}</div>
            <label class="switch"><input type="checkbox" .checked=${f.enabled} @change=${(e) => { f.enabled = e.target.checked; }}> ${t('Schedule on')}</label>
            <div class="panel-actions">
              <button class="btn danger" @click=${() => this._deleteProgram()}><ha-icon icon="mdi:delete"></ha-icon>${t('Delete')}</button>
              <span class="spacer"></span>
              <button class="btn" @click=${() => this._dlgSet({ panel: null, form: null, error: '' })}>${t('Cancel')}</button>
              <button class="btn primary" @click=${() => this._applyProgram()}>OK</button>
            </div>
          </div>`;
      }
      case 'profiles':
        return html`
          <div class="panel" data-panel="profiles">
            <div class="panel-title">${t('Profiles of the house')}</div>
            ${f.profiles.map((p, i) => html`
              <div class="profile-row">
                <input type="text" .value=${p.name} aria-label=${t('Profile name')} @input=${(e) => { p.name = e.target.value; }}>
                ${p.id === 'default' ? html`<span class="muted">${t('default')}</span>` : html`
                  <button class="icon-btn small" title=${t('Delete')} aria-label=${t('Delete {name}', { name: p.name })}
                    @click=${() => { f.profiles.splice(i, 1); this._renderDialog(); }}><ha-icon icon="mdi:delete"></ha-icon></button>`}
              </div>`)}
            <div class="profile-row">
              <input type="text" placeholder=${t('New profile (Holidays…)')} .value=${f.name} @input=${(e) => { f.name = e.target.value; }}>
            </div>
            <div class="hint">${t('A program without a week for a profile follows its {default} week.', { default: this._profileName('default') })}</div>
            <div class="panel-actions">
              <span class="spacer"></span>
              <button class="btn" @click=${() => this._dlgSet({ panel: null, form: null, error: '' })}>${t('Cancel')}</button>
              <button class="btn primary" @click=${() => this._saveProfiles()}>${t('Save profiles')}</button>
            </div>
          </div>`;
      case 'palette':
        return html`
          <div class="panel" data-panel="palette">
            <div class="panel-title">${t('Palette')}</div>
            <div class="chips">
              ${this._palette().map((v) => html`
                <span class="swatch" style="background:${tempColors(v).bg};color:${tempColors(v).fg}">${this._fmtValue(v)}
                  <button class="x" aria-label=${t('Remove {value}', { value: this._fmtValue(v) })} @click=${() => this._savePalette(this._palette().filter((x) => !sameValue(x, v)))}>
                    <ha-icon icon="mdi:close"></ha-icon></button>
                </span>`)}
            </div>
            <div class="profile-row">
              <input type="number" step="0.5" placeholder=${t('Temperature')} .value=${f.paletteValue ?? ''}
                @input=${(e) => { f.paletteValue = e.target.value; }}
                @keydown=${(e) => { if (e.key === 'Enter') this._addPaletteValue(); }}>
              <button class="btn" @click=${() => this._addPaletteValue()}><ha-icon icon="mdi:plus"></ha-icon>${t('Add')}</button>
            </div>
            <div class="hint">${t('Shortcuts only: a slot takes any temperature. Shared by the whole house.')}</div>
            <div class="panel-actions">
              <span class="spacer"></span>
              <button class="btn" @click=${() => this._dlgSet({ panel: null, form: null, error: '' })}>${t('Done')}</button>
            </div>
          </div>`;
      default:
        return this._narrow ? nothing : html`<div class="hint center">
          ${this._dlg.brush !== null && this._dlg.brush !== undefined
            ? t('Painting {value}: draw on a day or tap slots. Tap the color again to stop.', { value: this._fmtValue(this._dlg.brush) })
            : t('Draw on a day to add a slot, tap a slot to change it, drag its top edge to move it. A color of the palette paints.')}
        </div>`;
    }
  }

  static get styles() {
    return css`
      ha-card {
        padding: 12px 16px 8px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .header > ha-icon {
        color: var(--state-climate-heat-color, #ff8100);
      }
      .title {
        flex: 1;
        font-size: 16px;
        font-weight: 500;
      }
      .profile {
        position: relative;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 4px 6px 4px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color, #ddd);
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .chip ha-icon {
        --mdc-icon-size: 18px;
      }
      .menu {
        position: absolute;
        right: 0;
        top: calc(100% + 4px);
        z-index: 5;
        min-width: 160px;
        padding: 4px 0;
        border-radius: 12px;
        background: var(--card-background-color, #fff);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      }
      .menu button {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: none;
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .menu button.current {
        color: var(--primary-color);
      }
      .menu ha-icon {
        --mdc-icon-size: 18px;
      }
      .row {
        padding: 8px 0;
        border-top: 1px solid var(--divider-color, #eee);
      }
      .row:first-of-type {
        border-top: none;
      }
      .row-main {
        display: flex;
        width: 100%;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        padding: 0;
        border: none;
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .name {
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value {
        flex: none;
        font-size: 14px;
      }
      .now {
        font-weight: 500;
        margin-right: 4px;
      }
      .muted {
        color: var(--secondary-text-color);
      }
      .strip {
        position: relative;
        height: 6px;
        margin-top: 6px;
        border-radius: 3px;
        overflow: hidden;
        background: var(--divider-color, #eee);
      }
      .strip span {
        position: absolute;
        top: 0;
        bottom: 0;
      }
      .strip span.off {
        background: var(--secondary-background-color, #e0e0e0);
      }
      .strip i {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        margin-left: -1px;
        background: var(--primary-text-color);
      }
      .override {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        font-size: 12px;
        color: var(--warning-color, #ff9800);
      }
      .override ha-icon {
        --mdc-icon-size: 16px;
      }
      .override span {
        flex: 1;
      }
      .link {
        padding: 0;
        border: none;
        background: none;
        color: var(--primary-color);
        font: inherit;
        font-size: 12px;
        cursor: pointer;
        text-decoration: underline;
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 4px;
      }
      .open {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: none;
        border-radius: 18px;
        background: none;
        color: var(--primary-color);
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }
      .open ha-icon {
        --mdc-icon-size: 20px;
      }
      .empty,
      .error {
        padding: 8px 0;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .error {
        color: var(--error-color, #db4437);
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
    color: var(--primary-text-color, #212121);
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  .dialog {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(960px, calc(100vw - 32px));
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 12px 16px 16px;
    border-radius: 24px;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .dialog.narrow {
    width: 100vw;
    height: 100%;
    max-height: none;
    border-radius: 0;
    padding: 8px 12px 12px;
  }
  button {
    font: inherit;
    color: inherit;
  }
  ha-icon {
    --mdc-icon-size: 18px;
  }
  .top,
  .bar,
  .bottom .actions,
  .panel-actions,
  .days {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bar {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .tabs {
    flex: 1;
    display: flex;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tab {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: none;
    border-radius: 18px;
    background: none;
    font-size: 15px;
    cursor: pointer;
  }
  .tab.on {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }
  .tab.icon {
    padding: 8px;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .icon-btn {
    flex: none;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--secondary-text-color, #727272);
    cursor: pointer;
  }
  .icon-btn.small {
    width: 32px;
    height: 32px;
  }
  .profiles,
  .program-info,
  .chips,
  .palette {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .program-info {
    font-size: 13px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 16px;
    border: 1px solid var(--divider-color, #ddd);
    background: none;
    font-size: 13px;
    cursor: pointer;
  }
  .chip.on {
    border-color: var(--primary-color, #03a9f4);
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent);
    color: var(--primary-color, #03a9f4);
  }
  .chip:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .muted {
    color: var(--secondary-text-color, #727272);
  }
  .warn {
    color: var(--warning-color, #ff9800);
  }
  .note {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    align-items: center;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--secondary-background-color, #f5f5f5);
    font-size: 13px;
  }
  .link {
    padding: 0;
    border: none;
    background: none;
    color: var(--primary-color, #03a9f4);
    font-size: 13px;
    cursor: pointer;
    text-decoration: underline;
  }
  .week-wrap.inherited .col {
    opacity: 0.55;
  }
  .week .head,
  .grid {
    display: grid;
    grid-template-columns: 36px repeat(7, minmax(0, 1fr));
    gap: 4px;
  }
  .day {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px 0;
    border: none;
    border-radius: 8px;
    background: none;
    font-size: 13px;
    color: var(--secondary-text-color, #727272);
    cursor: pointer;
  }
  .day ha-icon {
    --mdc-icon-size: 14px;
    opacity: 0.4;
  }
  .day:hover ha-icon {
    opacity: 1;
  }
  .day.today {
    color: var(--primary-color, #03a9f4);
    font-weight: 500;
  }
  .grid {
    height: min(480px, calc(100vh - 330px));
    min-height: 288px;
  }
  .narrow .week .head,
  .narrow .grid {
    grid-template-columns: 24px repeat(7, minmax(0, 1fr));
    gap: 2px;
  }
  .narrow .grid {
    height: max(420px, calc(100vh - 250px));
  }
  .narrow .day {
    font-size: 12px;
  }
  .narrow .day ha-icon {
    display: none;
  }
  .narrow .hours span {
    right: 2px;
    font-size: 10px;
  }
  .narrow .slot {
    left: 1px;
    right: 1px;
  }
  .hours {
    position: relative;
  }
  .hours span {
    position: absolute;
    right: 4px;
    transform: translateY(-50%);
    font-size: 11px;
    color: var(--secondary-text-color, #727272);
  }
  .hours span:first-child {
    transform: none;
  }
  .col {
    position: relative;
    border-radius: 8px;
    background: var(--secondary-background-color, #f5f5f5);
    touch-action: none;
    user-select: none;
    cursor: crosshair;
  }
  .narrow .col {
    touch-action: pan-y;
    cursor: pointer;
  }
  .hour {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed var(--divider-color, #ddd);
    pointer-events: none;
  }
  .slot {
    position: absolute;
    left: 2px;
    right: 2px;
    box-sizing: border-box;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
  }
  .slot.off {
    background: repeating-linear-gradient(45deg, var(--divider-color, #ddd) 0 4px, transparent 4px 9px) !important;
    color: var(--secondary-text-color, #727272) !important;
  }
  .slot.sel {
    outline: 3px solid var(--primary-color, #03a9f4);
    z-index: 2;
  }
  .label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none;
    overflow: hidden;
  }
  .handle {
    position: absolute;
    left: 0;
    right: 0;
    top: -6px;
    height: 12px;
    z-index: 3;
    cursor: ns-resize;
    touch-action: none;
  }
  .handle::after {
    content: '';
    position: absolute;
    left: 35%;
    right: 35%;
    top: 4px;
    height: 4px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0;
  }
  .slot:hover .handle::after,
  .narrow .handle::after,
  .slot.sel .handle::after {
    opacity: 0.6;
  }
  .ghost {
    position: absolute;
    left: 2px;
    right: 2px;
    z-index: 4;
    border-radius: 6px;
    border: 2px dashed var(--primary-color, #03a9f4);
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }
  .now {
    position: absolute;
    left: -2px;
    right: -2px;
    z-index: 5;
    border-top: 2px solid var(--error-color, #db4437);
    pointer-events: none;
  }
  .days {
    flex-wrap: wrap;
    gap: 4px;
  }
  .day-chip {
    width: 36px;
    justify-content: center;
    padding: 6px 0;
  }
  .day-chip.today:not(.on) {
    color: var(--primary-color, #03a9f4);
  }
  .panel {
    position: sticky;
    bottom: 0;
    z-index: 6;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 16px;
    border: 1px solid var(--divider-color, #ddd);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.25);
  }
  .panel-title {
    font-weight: 500;
  }
  .times,
  .temp {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .times label,
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--secondary-text-color, #727272);
  }
  input,
  select {
    font: inherit;
    font-size: 15px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid var(--divider-color, #ccc);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }
  .round {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--divider-color, #ccc);
    background: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .temp-value {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 500;
  }
  .temp-value.off {
    background: var(--divider-color, #ddd) !important;
    min-width: 72px;
    justify-content: center;
  }
  .temp-value input {
    width: 64px;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 18px;
    font-weight: 500;
    text-align: right;
    padding: 2px;
  }
  .checks {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 180px;
    overflow-y: auto;
    font-size: 14px;
  }
  .checks label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .checks label.taken {
    color: var(--secondary-text-color, #727272);
  }
  .checks small {
    margin-left: auto;
    font-size: 12px;
  }
  .switch {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  .profile-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .profile-row input {
    flex: 1;
    min-width: 0;
  }
  .hint {
    font-size: 12px;
    color: var(--secondary-text-color, #727272);
  }
  .hint.center {
    text-align: center;
  }
  .spacer {
    flex: 1;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid var(--divider-color, #ccc);
    background: none;
    font-size: 14px;
    cursor: pointer;
  }
  .btn.primary {
    border-color: var(--primary-color, #03a9f4);
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }
  .btn.primary:disabled {
    opacity: 0.6;
  }
  .btn.danger {
    color: var(--error-color, #db4437);
  }
  .bottom {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid var(--divider-color, #eee);
    padding-top: 8px;
  }
  .bottom .actions {
    justify-content: flex-end;
  }
  .swatch {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-width: 44px;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 16px;
    border: 2px solid transparent;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .swatch.off {
    background: var(--divider-color, #ddd);
    color: var(--secondary-text-color, #727272);
  }
  .swatch.on {
    border-color: var(--primary-text-color, #212121);
  }
  .swatch .x {
    display: inline-flex;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }
  .swatch .x ha-icon {
    --mdc-icon-size: 14px;
  }
  .error {
    font-size: 13px;
    color: var(--error-color, #db4437);
  }
  .empty {
    padding: 24px;
    text-align: center;
    color: var(--secondary-text-color, #727272);
  }
  .fab {
    flex: none;
    position: absolute;
    right: 20px;
    bottom: 76px;
    z-index: 7;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .fab ha-icon {
    --mdc-icon-size: 28px;
  }
  .narrow .fab {
    position: sticky;
    align-self: flex-end;
    right: auto;
    bottom: 72px;
    margin-top: -64px;
  }
  .dialog:not(.touch) .fab {
    display: none;
  }
`;

/* ==========================================================================
   VISUAL EDITOR
   ========================================================================== */

const LABELS = {
  title: 'Title (Heating)',
  programs: 'Programs shown (none checked: all)',
  show_profile: 'Show the profile switch',
};

class HaPlooumClimateScheduleCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      _config: { state: true },
      _programs: { state: true },
      _missing: { state: true },
    };
  }

  constructor() {
    super();
    this._programs = null;
    this._missing = false;
  }

  setConfig(config) {
    this._config = config;
  }

  willUpdate(changed) {
    if (changed.has('hass')) setLanguage(this.hass);
  }

  updated(changed) {
    if (changed.has('hass') && this.hass && this._programs === null && !this._loading) {
      this._loading = true;
      this.hass.callWS({ type: WS + 'get' })
        .then((r) => { this._programs = r.config.programs.map((p) => ({ value: p.id, label: p.name })); })
        .catch(() => { this._programs = []; this._missing = true; });
    }
  }

  get _schema() {
    return [
      { name: 'title', selector: { text: {} } },
      ...(this._programs && this._programs.length
        ? [{ name: 'programs', selector: { select: { multiple: true, mode: 'list', options: this._programs } } }]
        : []),
      { name: 'show_profile', selector: { boolean: {} } },
    ];
  }

  _valueChanged(ev) {
    const config = { ...ev.detail.value };
    for (const key of Object.keys(config)) {
      const empty = config[key] === '' || config[key] === undefined || config[key] === null
        || (Array.isArray(config[key]) && !config[key].length);
      if (empty) delete config[key];
    }
    if (config.show_profile === true) delete config.show_profile;
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const data = { show_profile: true, ...this._config };
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${this._schema}
        .computeLabel=${(s) => (LABELS[s.name] ? t(LABELS[s.name]) : s.name)}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="hint">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        ${this._missing
          ? t('This card needs the Plooum Climate Scheduler integration (HACS), which stores and applies the schedules.')
          : t('Programs, profiles and the week of each program are edited in the card itself: Schedule.')}
      </div>
    `;
  }

  static get styles() {
    return css`
      .hint {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        color: var(--secondary-text-color);
        font-size: 0.9em;
        padding-top: 8px;
      }
      .hint ha-icon {
        flex: none;
        --mdc-icon-size: 18px;
      }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get('ha-plooum-climate-schedule-card')) {
  customElements.define('ha-plooum-climate-schedule-card', HaPlooumClimateScheduleCard);
}
if (!customElements.get('ha-plooum-climate-schedule-card-editor')) {
  customElements.define('ha-plooum-climate-schedule-card-editor', HaPlooumClimateScheduleCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-climate-schedule-card')) {
  window.customCards.push({
    type: 'ha-plooum-climate-schedule-card',
    name: 'Ha Plooum Climate Schedule Card',
    description: 'Week schedules of your thermostats, with house-wide profiles (needs the Plooum Climate Scheduler integration).',
    preview: true,
  });
}
