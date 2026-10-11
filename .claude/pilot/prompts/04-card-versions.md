# Prompt 04: a CARD_VERSION for every card

You work on HA-Plooum-Cards (a HACS bundle of Lovelace cards, see CLAUDE.md). Load the `pr-workflow` skill first, and `ha-dev-testing` for the check. You are in your own git worktree: start your own HA there (`dev/ha.sh start`, it picks a port from 8124), `npm run build` there, and `dev/ha.sh stop` when done.

## Goal (decided by the user, don't reopen)

Only three cards declare a version: floorplan (`1.8.0`), multistatus (`1.3.0`), vivarium (`1.0.0`). Give the six others one, the same way: **button-badge, cover, dpad, gridicons, tabbed, temp-humidity**.

## Design (fixed)

- Copy the pattern of `src/cards/multistatus/ha-plooum-multi-status-card.js` exactly: `const CARD_VERSION = '1.0.0';` near the top of the file (after the imports), and in the card class's `connectedCallback()` (create it if missing, calling `super.connectedCallback()` first; keep what an existing one already does after the log) the same `console.info` with the same two styles, labelled with the **custom element name upper-cased**: `HA-PLOOUM-BUTTONBADGE-CARD`, `HA-PLOOUM-COVER-CARD`, `HA-PLOOUM-DPAD-CARD`, `HA-PLOOUM-GRIDICONS-CARD`, `HA-PLOOUM-TABS-CARD`, `HA-PLOOUM-TEMP-HUMIDITY-CARD` (check each name against the file's `customElements.define`).
- Initial version **`1.0.0`** for all six. Nothing else changes: no shared helper (CLAUDE.md: cards don't share code), no README / docs change, no release.
- This PR *is* the version change the pr-workflow skill says to keep separate: adding these constants is the task.

## Check

No UI suite to write. Build, then load `/plooum-test/all` with `dev/shot.py` and print the console info lines (`--js` returning nothing is fine; use the built-in browser only if you have it, in your own tab): each of the nine cards logs its name and version once per card instance, and exit code 0 (no console errors). Paste the nine lines in the report.

## Delivery

Branch `feature/card-versions`, one commit, PR titled "A CARD_VERSION for every card". Open the PR, check CI, never merge. Report as `pr-workflow` says.

Screenshots: 1. `dev/shots/versions-all.png`: `/plooum-test/all`, full page (proves nothing broke); 2. `dev/shots/versions-console.png` if you have the built-in browser's console, otherwise skip it and paste the console lines instead.
