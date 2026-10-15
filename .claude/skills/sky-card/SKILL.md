---
name: sky-card
description: Travailler sur la carte ciel (src/cards/sky/) - plan des fichiers, méthodes statiques testables, pièges d'astronomy-engine. À charger avant de modifier la carte ciel ou ses calculs astronomiques.
---

# Carte ciel

## Fichiers

- `src/cards/sky/ha-plooum-sky-card.js` : la carte, son éditeur, l'enregistrement. Seule exception à « un fichier par carte » : les données dans `src/cards/sky/sky-data.js` (`STARS`, `CONSTELLATION_LINES`, `CONSTELLATION_NAMES` de d3-celestial, `METEOR_SHOWERS` de l'IMO).
- Calculs avec `astronomy-engine` (`import * as Astronomy`), dans des **méthodes statiques pures** que les tests appellent directement : `skyAt(date, lat, lon)`, `eventsBetween(start, end, lat, lon)`, `nextEvent(now, lat, lon)`.
- Le temps affiché = `this._now` + `this._offset` (minutes, ±360). Les tests fixent `_now` puis le remettent à `new Date()`.
- `shouldUpdate` ignore un simple changement de `hass` : ne pas redessiner le ciel à chaque état d'HA.

## Tests

- Le test `sky:` de `dev/tests/cards-smoke.json` (`--only sky:`), sur `/plooum-test/sky` (Paris + Sydney). La position du HA de dev est Paris (48.8566, 2.3522).
- Les assertions sur des dates portent sur une fenêtre fixe (`eventsBetween` sur des dates de 2026) : vérifie les valeurs attendues avec astronomy-engine dans `node` avant de les écrire.

## Pièges d'astronomy-engine

- `SearchRelativeLongitude(body, 0, t)` = **opposition** d'une planète extérieure ; 180 = conjonction avec le Soleil.
- `SearchSunLongitude` et `SearchRelativeLongitude` **ratent** une longitude atteinte dans les heures qui suivent le début de la recherche (elles renvoient l'occurrence suivante, un an plus tard) : démarre la recherche 30 jours plus tôt et filtre par la fenêtre.
- Éclipses : `SearchLocalSolarEclipse` (lieu, `peak.altitude`) ; `SearchLunarEclipse` est globale, vérifie l'altitude de la Lune au pic avec `Equator` + `Horizon`.
