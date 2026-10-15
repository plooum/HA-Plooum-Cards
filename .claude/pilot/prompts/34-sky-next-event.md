# 34 — Carte ciel, partie 2 : bandeau « prochain événement »

Dépôt : HA-Plooum-Cards, ton propre worktree. Charge les skills `pilot-subagent`, `pr-workflow` et `ha-dev-testing`. Branche : `feature/sky-next-event`. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans les Questions ouvertes de ton rapport et **arrête-toi** (n'attends jamais, ne scrute jamais). Chat, PR et commits en français ; code, chaînes de l'UI, commentaires et docs (README.md, docs/) en anglais, README.fr.md en français.

## Objectif (décision de l'utilisateur, fixe)

Sous le dôme de la carte ciel (`src/cards/sky/ha-plooum-sky-card.js`, 493 lignes), un bandeau qui annonce le **prochain événement** du ciel, calculé localement avec astronomy-engine (déjà en dépendance) : éclipses, conjonctions, oppositions, pleines lunes / super-lunes, équinoxes / solstices, pluies d'étoiles filantes (table embarquée, avec la phase de la Lune). **Un tap sur le bandeau amène le dôme sur l'événement quand il tombe dans les ±6 h** (le décalage `_offset` existant).

## Conception (choix du pilote, ne les rouvre pas)

- Tout dans le fichier de la carte ; la table des pluies d'étoiles filantes va dans `sky-data.js` (export `METEOR_SHOWERS`, source en commentaire : IMO, International Meteor Organization). `CARD_VERSION` **inchangé** (PR à part).
- Méthode **statique pure** `HaPlooumSkyCard.eventsBetween(start, end, lat, lon)` → tableau trié par date de `{ type, date, name, ...détails }`, `name` = le texte anglais affiché. Types :
  - `solar_eclipse` : `Astronomy.SearchLocalSolarEclipse` / `NextLocalSolarEclipse` (seulement celles visibles du lieu), date = le pic, détail `kind` (partial / annular / total) et `obscuration` ; garde-la seulement si le Soleil est levé au pic (`peak.altitude > 0`).
  - `lunar_eclipse` : `SearchLunarEclipse` / `NextLunarEclipse`, **sans les pénombrales**, et seulement si la Lune est au-dessus de l'horizon du lieu au pic ; détail `kind`.
  - `conjunction` : deux planètes parmi Mercure, Vénus, Mars, Jupiter, Saturne dont la séparation angulaire géocentrique (`AngleBetween(GeoVector(a), GeoVector(b))`) passe par un **minimum < 2°**, à plus de **15° du Soleil** ; balayage jour par jour puis affinage à l'heure près ; détails `bodies`, `separation`.
  - `opposition` : Mars, Jupiter, Saturne, avec `SearchRelativeLongitude(body, 0, t)` (**0 = opposition** pour une planète extérieure, 180 serait la conjonction avec le Soleil).
  - `full_moon` : `SearchMoonQuarter` / `NextMoonQuarter`, `quarter === 2` ; détail `supermoon: true` quand la distance géocentrique de la Lune au moment de la pleine lune est **< 361 500 km** (le nom devient « Supermoon »).
  - `equinox` / `solstice` : `Astronomy.Seasons(year)`.
  - `meteor_shower` : `METEOR_SHOWERS` = `[name, solarLongitudePeak, zhr]` pour Quadrantids (283.15, 110), Lyrids (32.32, 18), Eta Aquariids (45.5, 50), Perseids (140.0, 100), Orionids (208, 20), Leonids (235.27, 15), Geminids (262.2, 150), Ursids (270.7, 10) ; date du pic = `SearchSunLongitude(lon, t, 366)` ; détails `zhr` et `moon` = fraction éclairée de la Lune au pic (`Illumination('Moon', t).phase_fraction`, en %).
- `HaPlooumSkyCard.nextEvent(now, lat, lon)` = le premier de `eventsBetween(now − 6 h, now + 400 jours, …)`. Un événement passé depuis moins de 6 h reste donc affiché (on peut encore taper pour y aller).
- **Coût** : ne recalcule pas à chaque rendu. Garde le résultat en cache sur l'instance, recalculé quand la position change ou quand `now` dépasse la date de l'événement + 6 h. `shouldUpdate` (~ligne 181) ne doit toujours pas redessiner sur un simple changement de `hass`. Mesure le temps d'un `eventsBetween` sur 400 jours et mets-le dans le rapport ; s'il dépasse ~200 ms, calcule-le hors du premier rendu (`setTimeout` après la première peinture).
- Bandeau : une ligne sous `.info` (~ligne 333), classe `.event`, par exemple `Perseids meteor shower · Wed 12 Aug, 18:47 · in 3 days · Moon 2 %` ; `Partial solar eclipse (92 %)`, `Venus–Jupiter conjunction (1.6°)`, `Jupiter at opposition`, `Supermoon`, `September equinox`, `Total lunar eclipse`. Date avec `Intl.DateTimeFormat(undefined, …)` (fuseau du navigateur, comme l'heure existante) ; délai relatif `in 3 days` / `in 5 h` / `2 h ago`.
- Tap / clic sur le bandeau : si `|date − now| ≤ 6 h`, `_offset` = l'écart en minutes ; sinon rien. Le bandeau n'a `cursor: pointer` (et une légère mise en avant) que quand il est dans la fenêtre.
- Option `show_next_event` (bool, défaut `true`) ; dans l'éditeur (`SCHEMA` / `LABELS`, ~ligne 406) : « Show the next sky event ».
- Docs : `docs/sky.md` (section « Next event » : la liste des types et leurs règles en une phrase chacune, le tap ; la ligne d'option), et la courte description de la carte dans README.md **et** README.fr.md si elle énumère ce que montre la carte.

## Tests (seulement ceux-là)

Ajoute les assertions au test existant `sky: ...` de `dev/tests/cards-smoke.json` (~ligne 67, renomme-le `sky: renders, computes the sky, drags the time, next event, editor`). Dates vérifiées par le pilote avec astronomy-engine :

1. `E = C.eventsBetween(new Date('2026-08-01T00:00:00Z'), new Date('2026-09-30T00:00:00Z'), 48.86, 2.35)` est trié et contient : `meteor_shower` Perseids à ±1 h de `2026-08-12T16:48Z` ; `solar_eclipse` `partial` à ±1 h de `2026-08-12T18:17Z` ; `lunar_eclipse` `partial` à ±1 h de `2026-08-28T04:13Z` ; `equinox` à ±1 h de `2026-09-23T00:06Z`.
2. Sur `2026-05-25 → 2026-06-25` : une `conjunction` Venus/Jupiter à ±1 jour de `2026-06-10`, séparation < 2°.
3. Sur `2026-10-20 → 2026-12-01` : la pleine lune du `2026-10-26` n'est pas une super-lune, celle du `2026-11-24` (360 753 km) en est une.
4. Bandeau : sur la première carte, fixe `_now` à 3 h avant le pic des Perseids, le bandeau affiche « Perseids » ; un clic dessus → le décalage affiché est `+3 h 00` (± quelques minutes). Puis remets `_now = new Date()` et l'offset à 0 (comme le fait déjà le test).
5. `setConfig({ ...config, show_next_event: false })` sur la première carte → plus de `.event` ; remets la config d'origine (rien à changer dans le YAML).

Lance seulement `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json --only sky:` et `dev/shot.py` sur `/plooum-test/sky` (code 0). Colle les sorties.

**Captures (1)**, headless seulement (jamais le pane intégré) : `sky-event.png`, la carte par défaut recadrée, avec `_now` 3 h avant le pic des Perseids et le dôme amené sur l'événement (dans `dev/shots/`, non commitée).

À la fin : **ne fais pas** `dev/ha.sh stop` : garde ta HA, le pilote la regardera.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, taille du bundle avant / après (`ls -l ha-plooum-cards.js`), temps de `eventsBetween` sur 400 jours, sortie des tests, chemin de la capture, écarts, Questions ouvertes, Frictions.
