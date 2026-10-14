# Roadmap

The user's follow-up of what is planned, kept by the pilot (user's request, 2026-10-14). Committed straight to `main` with the handoff, no PR. One line per step, with its status; the handoff's **State** has the details (branch, PR, sub-agent) of what is in progress. [BACKLOG.md](BACKLOG.md) keeps the small leftovers.

Status: `todo`, `next` (the pilot's next launch), `in progress`, `review` (PR waiting for the user), `done`, `on hold` (waiting for a user decision).

_Last update: 2026-10-14._

## Berlin clock card

| # | Step | Status |
| :--- | :--- | :--- |
| B1 | Card `ha-plooum-berlin-clock-card` 1.0.0 (prompt 27) | done, [#56](https://github.com/plooum/HA-Plooum-Cards/pull/56) |
| B2 | Release **V1.4.0** (minor: new card) | on hold: the user's go |

## Sky card (planetarium)

Decided 2026-10-14: a dome (zenith at the centre, horizon on the edge, cardinal points), position from HA (`hass.config` latitude / longitude, overridable), computed with **astronomy-engine** (MIT, ~110 KB in the bundle). The time is scrolled **±6 h**; the way to scroll it becomes an option chosen among five (mockups shown 2026-10-14): `rotate` (turn the sky with the finger, double-tap = now), `ring` (a 12 h bezel around the dome), `strip` (a night-coloured strip under the dome with rise / set marks), `wheel` (a vertical hour picker), `filmstrip` (seven thumbnails every 2 h).

| # | Step | Status |
| :--- | :--- | :--- |
| S1 | V1: the dome (bright stars, constellation lines and names, planets, Moon with its phase, cardinal points, sky colour following twilight / night), `time_control: rotate`, and a **next event** banner computed locally: eclipses, conjunctions, oppositions, full / super moons, equinoxes / solstices, meteor showers (embedded table, with the Moon's phase); a tap brings the dome to the event when it is within ±6 h | next |
| S2 | `time_control: strip` | todo |
| S3 | `time_control: ring` | todo |
| S4 | `time_control: wheel` | todo |
| S5 | `time_control: filmstrip` | todo |
| S6 | V2: bright comets from the COBS API (cobs.si), drawn on the dome with their magnitude; first a feasibility check that the API can be called from the browser (CORS), otherwise through HA (REST sensor) | todo |
| S7 | Release(s): the card at its initial `CARD_VERSION`, then minor releases as steps land | on the user's go |

## Later / ideas (not decided)

- **Notifications for sky events**: a separate integration repo, "Plooum Sky", exposing an HA **calendar** of astronomical events (eclipses, meteor showers, conjunctions, bright comets) so automations can push them to the phone; the sky card would then read that calendar.
- **ISS passes** on the dome, read from the HACS integration ISS Spotter's entity.
- **Colour themes** for the sky card: night vision (red) and paper atlas (mockups C and D, 2026-10-14).
- **Astronomical clock** (Prague-like dial): proposed 2026-10-14, not chosen yet.
- **Ultenic robot vacuum**: the user checks the model and the app (Ultenic or Smart Life / Tuya). If it's a Tuya device: Tuya / LocalTuya integration, then maybe a vacuum card here; otherwise a separate integration project.
