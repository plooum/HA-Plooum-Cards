# Feuille de route

Le suivi par l'utilisateur de ce qui est prévu, tenu par le pilote (demande de l'utilisateur, 2026-10-14). Commité directement sur `main` avec le handoff, sans PR. Une ligne par étape, avec son statut ; la section **State** du handoff donne le détail (branche, PR, sous-agent) de ce qui est en cours. [BACKLOG.md](BACKLOG.md) garde les petits restes.

Statuts : `à faire`, `suivant` (le prochain lancement du pilote), `en cours`, `en relecture` (PR qui attend l'utilisateur), `fait`, `en attente` (attend une décision de l'utilisateur).

_Dernière mise à jour : 2026-10-14._

## Carte horloge de Berlin

| # | Étape | Statut |
| :--- | :--- | :--- |
| B1 | Carte `ha-plooum-berlin-clock-card` 1.0.0 (prompt 27) | fait, [#56](https://github.com/plooum/HA-Plooum-Cards/pull/56) |
| B2 | Release **V1.4.0** (mineure : nouvelle carte) | en attente : feu vert de l'utilisateur |

## Carte ciel (planétarium)

Décidé le 2026-10-14 : un dôme (zénith au centre, horizon au bord, points cardinaux), position tirée d'HA (latitude / longitude de `hass.config`, modifiable dans la config), calculs avec **astronomy-engine** (MIT, ~110 Ko dans le bundle). On fait défiler le temps sur **±6 h** ; la façon de le faire devient une option à choisir parmi cinq (maquettes montrées le 2026-10-14) : `rotate` (faire tourner le ciel au doigt, double-tap = maintenant), `ring` (une bague de 12 h autour du dôme), `strip` (une frise colorée selon la nuit sous le dôme, avec les levers / couchers), `wheel` (une molette verticale des heures), `filmstrip` (sept vignettes toutes les 2 h).

| # | Étape | Statut |
| :--- | :--- | :--- |
| S1 | V1 : le dôme (étoiles brillantes, lignes et noms des constellations, planètes, Lune avec sa phase, points cardinaux, couleur du ciel selon le crépuscule / la nuit), `time_control: rotate`, et un bandeau **prochain événement** calculé localement : éclipses, conjonctions, oppositions, pleines lunes / super-lunes, équinoxes / solstices, pluies d'étoiles filantes (table embarquée, avec la phase de la Lune) ; un tap amène le dôme sur l'événement quand il tombe dans les ±6 h | suivant |
| S2 | `time_control: strip` | à faire |
| S3 | `time_control: ring` | à faire |
| S4 | `time_control: wheel` | à faire |
| S5 | `time_control: filmstrip` | à faire |
| S6 | V2 : les comètes brillantes via l'API COBS (cobs.si), dessinées sur le dôme avec leur magnitude ; d'abord un test de faisabilité de l'appel depuis le navigateur (CORS), sinon en passant par HA (capteur REST) | à faire |
| S7 | Release(s) : la carte à son `CARD_VERSION` initial, puis des releases mineures au fil des étapes | sur feu vert de l'utilisateur |

## Plus tard / idées (non décidées)

- **Notifications des événements du ciel** : un dépôt d'intégration séparé, « Plooum Sky », qui expose un **calendrier** HA des événements astronomiques (éclipses, pluies d'étoiles filantes, conjonctions, comètes brillantes) pour que des automatisations les envoient sur le téléphone ; la carte ciel lirait alors ce calendrier.
- **Passages de l'ISS** sur le dôme, lus dans l'entité de l'intégration HACS ISS Spotter.
- **Thèmes de couleur** pour la carte ciel : vision nocturne (rouge) et atlas papier (maquettes C et D, 2026-10-14).
- **Horloge astronomique** (cadran façon Prague) : proposée le 2026-10-14, pas encore choisie.
- **Aspirateur robot Ultenic** : l'utilisateur vérifie le modèle et l'appli (Ultenic ou Smart Life / Tuya). Si c'est un appareil Tuya : intégration Tuya / LocalTuya, puis peut-être une carte aspirateur ici ; sinon, un projet d'intégration séparé.
