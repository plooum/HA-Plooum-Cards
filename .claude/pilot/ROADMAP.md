# Feuille de route

Le suivi par l'utilisateur de ce qui est prévu, tenu par le pilote (demande de l'utilisateur, 2026-10-14). Commité directement sur `main` avec le handoff, sans PR. Une ligne par étape, avec son statut ; la section **State** du handoff donne le détail (branche, PR, sous-agent) de ce qui est en cours. [BACKLOG.md](BACKLOG.md) garde les petits restes.

Statuts : `à faire`, `suivant` (le prochain lancement du pilote), `en cours`, `en relecture` (PR qui attend l'utilisateur), `fait`, `en attente` (attend une décision de l'utilisateur).

_Dernière mise à jour : 2026-10-15._

## Carte horloge de Berlin

| # | Étape | Statut |
| :--- | :--- | :--- |
| B1 | Carte `ha-plooum-berlin-clock-card` 1.0.0 (prompt 27) | fait, [#56](https://github.com/plooum/HA-Plooum-Cards/pull/56) |
| B2 | Release **V1.4.0** (mineure : nouvelle carte) | fait, [V1.4.0](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.4.0) |

## Carte ciel (planétarium)

Décidé le 2026-10-14 : un dôme (zénith au centre, horizon au bord, points cardinaux), position tirée d'HA (latitude / longitude de `hass.config`, modifiable dans la config), calculs avec **astronomy-engine** (MIT, ~110 Ko dans le bundle). On fait défiler le temps sur **±6 h** ; seul `rotate` existe (faire tourner le ciel au doigt, double-tap = maintenant) : les autres modes (`ring`, `strip`, `wheel`, `filmstrip`) ont été retirés par l'utilisateur le 2026-10-15.

| # | Étape | Statut |
| :--- | :--- | :--- |
| S1 | V1 : le dôme (étoiles brillantes, lignes et noms des constellations, planètes, Lune avec sa phase, points cardinaux, couleur du ciel selon le crépuscule / la nuit), `time_control: rotate`, et un bandeau **prochain événement** calculé localement : éclipses, conjonctions, oppositions, pleines lunes / super-lunes, équinoxes / solstices, pluies d'étoiles filantes (table embarquée, avec la phase de la Lune) ; un tap amène le dôme sur l'événement quand il tombe dans les ±6 h | partie 1 faite (dôme + `rotate`, [#59](https://github.com/plooum/HA-Plooum-Cards/pull/59)) ; partie 2 faite (bandeau prochain événement, [#64](https://github.com/plooum/HA-Plooum-Cards/pull/64)) |
| S2 | Position choisie sur une carte dans l'éditeur, maison par défaut, sans service externe (prompt 35) | fait, [#66](https://github.com/plooum/HA-Plooum-Cards/pull/66) |
| S6 | V2 : les comètes brillantes via l'API COBS (cobs.si), dessinées sur le dôme avec leur magnitude ; d'abord un test de faisabilité de l'appel depuis le navigateur (CORS), sinon en passant par HA (capteur REST) | à faire |
| S7 | Release(s) : la carte à son `CARD_VERSION` initial, puis des releases mineures au fil des étapes | [V1.5.0](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.5.0) publiée le 2026-10-15 (partie 1), [V1.5.1](https://github.com/plooum/HA-Plooum-Cards/releases/tag/V1.5.1) (ciel de jour, fond noir corrigé) ; les suivantes sur feu vert |

## Plus tard / idées (non décidées)

- **Notifications des événements du ciel** : un dépôt d'intégration séparé, « Plooum Sky », qui expose un **calendrier** HA des événements astronomiques (éclipses, pluies d'étoiles filantes, conjonctions, comètes brillantes) pour que des automatisations les envoient sur le téléphone ; la carte ciel lirait alors ce calendrier.
- **Passages de l'ISS** sur le dôme, lus dans l'entité de l'intégration HACS ISS Spotter.
- **Thèmes de couleur** pour la carte ciel : vision nocturne (rouge) et atlas papier (maquettes C et D, 2026-10-14).
- **Horloge astronomique** (cadran façon Prague) : proposée le 2026-10-14, pas encore choisie.
- **Aspirateur robot Ultenic** : l'utilisateur vérifie le modèle et l'appli (Ultenic ou Smart Life / Tuya). Si c'est un appareil Tuya : intégration Tuya / LocalTuya, puis peut-être une carte aspirateur ici ; sinon, un projet d'intégration séparé.
