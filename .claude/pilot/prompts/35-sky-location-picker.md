# 35 — Carte ciel : choisir la position sur une carte dans l'éditeur

Dépôt : HA-Plooum-Cards, ton propre worktree. Charge les skills `pilot-subagent`, `pr-workflow`, `ha-dev-testing` et `sky-card`. Branche : `feature/sky-location-picker`. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans les Questions ouvertes de ton rapport et **arrête-toi** (n'attends jamais, ne scrute jamais). Chat, PR et commits en français ; code, chaînes de l'UI, commentaires et docs (README.md, docs/) en anglais, README.fr.md en français.

## Objectif (décision de l'utilisateur, fixe)

Dans l'éditeur de la carte ciel, la position se choisit **en cliquant sur une carte**, avec **la maison par défaut**, au lieu de taper latitude et longitude. **Aucun service externe** (pas de recherche d'adresse ni de géocodage).

## Conception (choix du pilote, ne les rouvre pas)

- La config **ne change pas** : `latitude` / `longitude` restent les options (pas de changement cassant) ; absentes = position de HA.
- Éditeur (`HaPlooumSkyCardEditor`, ~ligne 593 ; `SCHEMA` / `LABELS` ~ligne 575) : remplace les deux champs nombre `latitude` / `longitude` par **un** champ `location` avec le sélecteur natif de HA `{ location: { radius: false } }` (`ha-selector-location`, une carte où l'on déplace un marqueur), libellé « Location ».
  - Valeur montrée : `{ latitude, longitude }` de la config, sinon celles de `hass.config` (la maison).
  - Dans `_valueChanged`, `location` est retraduit en `latitude` / `longitude` (arrondis à 4 décimales) ; la clé `location` n'est jamais écrite dans la config.
  - Sous le champ, un bouton « Use the home location » (`mwc-button` ou `ha-button`, ce que les autres éditeurs du dépôt utilisent) visible seulement quand `latitude` / `longitude` sont définies : il les retire de la config (et émet `config-changed`).
  - Mets à jour la phrase `.hint` (~ligne 631) : la carte reprend la maison quand aucune position n'est choisie.
- Vérifie d'abord que `ha-selector-location` s'affiche bien dans ce HA (2026.10) dans le formulaire ; s'il ne s'affiche pas, **arrête-toi** et dis-le dans les Questions ouvertes.
- `docs/sky.md` : la ligne des options `latitude` / `longitude` dit qu'on les choisit sur la carte de l'éditeur ; README.md et README.fr.md seulement s'ils parlent de la saisie de la position.
- `CARD_VERSION` inchangé.

## Tests (seulement ceux-là)

Ajoute au test `sky:` de `dev/tests/cards-smoke.json` (~ligne 67), après l'étape `T.card.editorRenders` (voir `dev/ui_helpers.js` ~ligne 180 pour construire l'éditeur hors de la boîte de dialogue, dans `card.parentNode`) :

1. Éditeur de la première carte (sans position) : il contient un `ha-selector-location` dont la valeur vaut la position de `hass.config` ; pas de bouton « Use the home location ».
2. Un `value-changed` sur le `ha-form` avec `location: { latitude: -33.87, longitude: 151.21 }` → `config-changed` avec `latitude: -33.87`, `longitude: 151.21`, sans clé `location`.
3. Éditeur de la carte Sydney : le bouton est là ; un clic → `config-changed` sans `latitude` ni `longitude`.

Lance seulement `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json --only sky:`. Colle la sortie.

**Capture (1)**, headless (jamais le pane intégré) : `sky-editor-location.png`, l'éditeur de la carte Sydney ouvert dans `/plooum-edit/sky?edit=1` (helpers d'ouverture de la boîte de dialogue dans `ha-dev-testing`), dans `dev/shots/`, non commitée.

À la fin : **ne fais pas** `dev/ha.sh stop` : garde ta HA, le pilote la regardera.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, sortie du test, chemin de la capture, écarts, Questions ouvertes, Frictions.
