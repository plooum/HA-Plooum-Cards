# 32 — Nouvelle carte : ciel (dôme), partie 1 : dôme + `time_control: rotate`

Dépôt : HA-Plooum-Cards, ton propre worktree. Charge les skills `pilot-subagent`, `pr-workflow` et `ha-dev-testing`. Branche : `feature/sky-card`. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans les Questions ouvertes de ton rapport et **arrête-toi** (n'attends jamais, ne scrute jamais). Chat, PR et commits en français ; code, chaînes de l'UI, commentaires et docs (README.md, docs/) en anglais, README.fr.md en français.

## Objectif (décision de l'utilisateur, fixe)

Une nouvelle carte qui montre le ciel au-dessus de la maison comme un **dôme** : zénith au centre, horizon au bord, points cardinaux, en suivant CLAUDE.md, « Adding a new card ». Dessinés : les étoiles brillantes, les lignes et les noms des constellations, les planètes, la Lune avec sa phase, le Soleil quand il est levé, et la couleur du fond selon le jour / le crépuscule / la nuit. Position tirée d'HA (`hass.config.latitude` / `longitude`), modifiable dans la config. Calculs avec **astronomy-engine** (npm, MIT). On fait défiler le temps sur **±6 h** en faisant tourner le ciel au doigt (`time_control: rotate`) ; double-tap = maintenant.

Le bandeau « prochain événement » (éclipses, conjonctions...) est la **partie 2**, un autre prompt : ne le fais pas.

## Conception (choix du pilote, ne les rouvre pas)

- Dossier `src/cards/sky/`, fichier `ha-plooum-sky-card.js`, éléments `ha-plooum-sky-card` / `ha-plooum-sky-card-editor`, classe `HaPlooumSkyCard`, `CARD_VERSION = '1.0.0'` avec la même bannière console que les autres cartes. Motif classe / éditeur / enregistrement avec gardes `customElements.get` et une entrée `window.customCards`, comme `src/cards/berlin-clock/ha-plooum-berlin-clock-card.js` (282 lignes, le modèle le plus proche : timer dans `connectedCallback` / `disconnectedCallback`, `ha-form` + `.computeLabel`).
- **Une seule exception à « un seul fichier par carte »** : les données dans `src/cards/sky/sky-data.js` (module ES exportant des tableaux compacts), avec en tête un commentaire source + licence. Rien d'autre hors du fichier de la carte.
- `npm install astronomy-engine` (dépendance, `package.json` + lock) ; `import * as Astronomy from 'astronomy-engine';` Rollup a déjà node-resolve + commonjs.
- Données, à générer une fois depuis **d3-celestial** (github.com/ofrohn/d3-celestial, BSD-3, `data/stars.6.json`, `data/constellations.lines.json`, `data/constellations.json` pour les noms et leur position) ; le script de génération n'est **pas** commité (garde-le dans ton dossier temporaire) :
  - étoiles de magnitude ≤ 4.5 : `[ra_deg, dec_deg, mag]` arrondis (0.01° / 0.1 mag) ;
  - lignes des 88 constellations : polylignes de `[ra_deg, dec_deg]` ;
  - noms : `[name_en, ra_deg, dec_deg]`.
- Rendu en **SVG** (`viewBox` carré, s'adapte à la largeur : colonne de tableau de bord et téléphone ~360 px). Projection **stéréographique** centrée sur le zénith, rayon = horizon ; **nord en haut, est à gauche** (on regarde vers le haut). Seul ce qui est au-dessus de l'horizon est dessiné. N / E / S / W sur le bord.
- Taille des étoiles selon la magnitude ; les étoiles et les constellations s'estompent quand le ciel est clair.
- Planètes : Mercure, Vénus, Mars, Jupiter, Saturne (point coloré + nom court) ; Soleil ; Lune avec sa **phase** (`Astronomy.MoonPhase` / `Illumination`), le côté éclairé tourné vers le Soleil sur le dôme.
- Fond selon l'altitude du Soleil : jour (> 0°), crépuscule civil (> -6°), nautique (> -12°), astronomique (> -18°), nuit ; un dégradé radial simple suffit.
- Une méthode **statique pure** `HaPlooumSkyCard.skyAt(date, lat, lon)` qui renvoie `{ sunAlt, stars: [{alt, az, mag}], planets: [{name, alt, az}], moon: {alt, az, phase}, sun: {alt, az} }` (alt / az en degrés, az depuis le nord vers l'est) ; `render()` l'utilise. Elle sert aussi aux tests.
- Temps : `this._offset` en minutes, borné à ±360. **Glisser horizontalement** sur le dôme (pointer events, souris et doigt) : toute la largeur du dôme = 6 h ; glisser vers la droite avance le temps. **Double-tap / double-clic** : retour à 0. Sous le dôme, une ligne : l'heure affichée (`HH:MM`, fuseau du navigateur) et, quand le décalage n'est pas nul, le décalage (`+2 h 15`, `-0 h 30`). Rafraîchissement toutes les 60 s.
- Options (toutes optionnelles) :
  - `title` : chaîne, affichée au-dessus quand elle est définie ;
  - `latitude`, `longitude` : nombres, par défaut ceux de `hass.config` ;
  - `time_control` : `rotate` (seule valeur pour l'instant, par défaut) ;
  - `show_constellations` : bool, par défaut `true` (lignes + noms).
- Éditeur : `ha-form` avec ces 5 options (`latitude` / `longitude` en nombres, `time_control` en select à une valeur), libellés via `.computeLabel`, `config-changed`.
- `getStubConfig()` : `{}`.

## Aussi (CLAUDE.md, « Adding a new card »)

- `src/index.js` : ligne d'import, ordre alphabétique (après multistatus... vérifie l'ordre actuel : il suit les noms de dossier).
- `docs/sky.md` (tableau des options, comment lire le dôme, comment faire défiler le temps), ligne + courte section avec l'aperçu `docs/previews/sky.png` dans README.md **et** README.fr.md (comme la carte berlin-clock), et l'arborescence de fichiers des deux README.
- `dev/ha-config/dashboards/plooum-test.yaml` : une vue `title: Sky`, `path: sky` avec deux cartes : par défaut ; `title: Sydney` + `latitude: -33.87` + `longitude: 151.21` + `show_constellations: false` ; et une carte dans la vue `all`.

## Tests (seulement ceux-là)

1. **Un** test dans `dev/tests/cards-smoke.json`, comme celui de berlin-clock (~ligne 56), `path: /plooum-test/sky` :
   - `T.card.rendered('ha-plooum-sky-card', 2)` ;
   - `skyAt(new Date('2026-10-15T22:00:00Z'), 48.86, 2.35)` : `sunAlt < -18`, et l'étoile la plus proche de la Polaire (ra 37.95°, dec 89.26°, à retrouver dans `stars` par son index dans `sky-data.js`) a une altitude à ±1° de 48.86 ;
   - la première carte a au moins 100 étoiles dans son SVG ;
   - glisser de la moitié de la largeur du dôme vers la droite → le décalage affiché est `+3 h 00` (± quelques minutes), puis un double-clic → plus de décalage ;
   - `T.card.editorRenders(S.cards[0])`.
2. Lance toute la suite smoke (`dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json`) : tout PASS ; colle la sortie.
3. `dev/shot.py` sur `/plooum-test/sky` sort avec le code 0.

**Captures (2)**, jamais avec le pane intégré (headless seulement), à une heure de nuit à Paris (glisse le temps, ou remplace `Date` dans le `--js` si nécessaire) : `sky-view.png` (la vue, les deux cartes) et `sky-phone.png` (la carte par défaut à 360 px de large : `dev/shot.py --width 360`). La première, recadrée sur la carte par défaut, est aussi `docs/previews/sky.png` (commitée). Les autres restent hors du dépôt (`dev/shots/`).

À la fin : **ne fais pas** `dev/ha.sh stop` : garde ta HA, le pilote la regardera.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, la taille du bundle avant / après (`ls -l ha-plooum-cards.js`), sortie des tests, chemins des captures, écarts, Questions ouvertes, Frictions.
