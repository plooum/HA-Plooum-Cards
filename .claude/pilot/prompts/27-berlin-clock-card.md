# 27 — New card: Berlin clock (Mengenlehreuhr)

Repo: HA-Plooum-Cards, your own worktree. Load the skills `pilot-subagent`, `pr-workflow` and `ha-dev-testing`. Branch: `feature/berlin-clock-card`. Open the PR, **never merge it**. If you need an answer, put the question in your report's Open questions and **stop** (never wait or poll).

## Goal (user's decision, fixed)

A new card showing the time as a **Berlin clock** (Mengenlehreuhr), following CLAUDE.md, "Adding a new card".

The reading, top to bottom (24 lamps):
- 1 round **seconds** lamp, lit on even seconds (it blinks);
- row 1: 4 blocks of **5 hours** (red);
- row 2: 4 blocks of **1 hour** (red);
- row 3: 11 blocks of **5 minutes** (yellow, but the 3rd, 6th and 9th, the quarters, red);
- row 4: 4 blocks of **1 minute** (yellow).

## Design (pilot's choices, don't reopen)

- Folder `src/cards/berlin-clock/`, file `ha-plooum-berlin-clock-card.js`, elements `ha-plooum-berlin-clock-card` / `ha-plooum-berlin-clock-card-editor`, class `HaPlooumBerlinClockCard`, `CARD_VERSION = '1.0.0'` with the same console banner as the other cards (see `src/cards/gridicons/ha-plooum-gridicons-card.js` top and ~line 229). Class / editor / registration pattern with `customElements.get` guards and a `window.customCards` entry, like gridicons.
- A pure **static** method `HaPlooumBerlinClockCard.lamps(h, m, s)` returning `{ seconds: bool, rows: [[bool×4], [bool×4], [bool×11], [bool×4]] }`; `render()` uses it. A timer refreshes every second, started in `connectedCallback`, cleared in `disconnectedCallback`.
- Options (all optional):
  - `title`: string, shown above the clock when set.
  - `colors`: `classic` (default: the real clock's red `#e53935` / yellow `#fdd835`, unlit lamps a dim grey) or `theme` (lit = `var(--state-active-color, var(--primary-color))`, quarters `var(--error-color)`, unlit `var(--disabled-color)` at low opacity).
  - `show_time`: bool, default `false`: the time in digits (`HH:MM:SS`) under the clock.
  - `time_zone`: `local` (default, the browser) or `server` (HA's `hass.config.time_zone`, via `Intl.DateTimeFormat` with `timeZone`).
- Each row has a `title` attribute (tooltip) with its value, e.g. "10 h", "3 h", "35 min", "2 min".
- Rounded blocks, card background as the other cards (`ha-card`). Must look right at a dashboard column width and on a phone (~360 px): blocks scale with the width (flex/grid, no fixed px width).
- Editor: `ha-form` with the 4 options (`title` text, `colors` select, `show_time` boolean, `time_zone` select), labels through `.computeLabel` (CLAUDE.md gotcha), dispatching `config-changed`.
- `getStubConfig()`: `{}`.

## Also (CLAUDE.md, "Adding a new card")

- `src/index.js`: import line (keep alphabetical: after button-badge).
- `docs/berlin-clock.md` (options table + how to read it), row + short section with a preview `docs/previews/berlin-clock.png` in **both** README.md and README.fr.md (look at the gridicons rows / section ~line 18 and ~50, and the file tree ~line 113).
- `dev/ha-config/dashboards/plooum-test.yaml`: a view `title: Berlin Clock`, `path: berlin-clock` with three cards: default; `colors: theme` + `show_time: true` + `title: Server time` + `time_zone: server`; and one in the `all` view.

## Tests (only these)

1. Add **one** test to `dev/tests/cards-smoke.json`, like the gridicons one (~line 41), `path: /plooum-test/berlin-clock`:
   - `T.card.rendered('ha-plooum-berlin-clock-card', 2)`;
   - the first card has 24 lamps;
   - `customElements.get('ha-plooum-berlin-clock-card').lamps(13, 37, 42)` gives rows lit 2 / 3 / 7 / 2 and `seconds === true`; `lamps(0, 0, 1)` gives nothing lit;
   - `T.card.editorRenders(S.cards[0])`.
2. Run the whole smoke suite (`dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json`): all PASS; paste the output.
3. `dev/shot.py` on `/plooum-test/berlin-clock` exits 0.

**Screenshots (2)**, never with the built-in pane (headless only): `berlin-clock-view.png` (the view, both cards) and `berlin-clock-phone.png` (the default card at a 360 px wide viewport: `dev/shot.py --width 360`). The first one, cropped to the default card, is also `docs/previews/berlin-clock.png` (committed). Other screenshots stay out of the repo (`dev/shots/`).

At the end: `dev/ha.sh stop` is **not** wanted: keep your HA running, the pilot will look at it.

## Report

As in `pilot-subagent`: PR URL, what was done, test output, screenshot paths, deviations, Open questions, Friction.
