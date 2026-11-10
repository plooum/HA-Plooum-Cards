# Prompt 40 : climate-jar

Tu travailles dans ton worktree sur la branche **`feature/climate-jar`**, à partir d'un `main` à jour. Charge les skills : `pilot-subagent`, `pr-workflow`, `floorplan-card`, `ha-dev-testing`. Démarre ton propre HA (`dev/ha.sh start`, puis `npm run build`) et teste dans le **navigateur intégré de Claude, dans ton propre onglet** (`tabs_create`) ; `dev/shot.py` seulement en repli. `dev/ha.sh stop` à la fin. Ouvre la PR, ne la fusionne jamais. Une question que tu ne peux pas trancher : arrête-toi et signale-la (Questions ouvertes), n'attends pas.

## Objectif

Dans la vue 3D de la carte floorplan, chaque pièce montre sa température et son humidité par un objet en verre posé au sol : le **« bocal embué »** (choisi par l'utilisateur sur maquette, 2026-11-10). Exigences fixes :

- **Le bocal** : un cylindre (ou prisme à 12–16 pans) en verre transparent, ≈ 0,22 de diamètre et ≈ 0,45 de haut (unités de grille). Dedans, de **l'eau** dont la hauteur = humidité (0–100 % de la hauteur du bocal).
- **Le thermomètre** : un tube de verre fin qui plonge au centre du bocal et le dépasse (≈ 0,55 de haut), avec un réservoir rond en bas ; une colonne de liquide dont la hauteur suit la température entre `temp_min` et `temp_max` (10 % à 90 % du tube) et **dont la couleur est celle du sol** : `tempRgb(temp, min, max)`.
- **Humidité normale** : eau bleu clair translucide. **Trop humide** (humidité ≥ `humidity_max`, nouvelle option, défaut **60**) : l'eau passe au **violet** (`#7F77DD`, pas de rouge ni d'ambre, réservés aux températures chaudes) et des **bulles** remontent (`bubbles()`, animé).
- **Buée** : le verre du bocal devient plus blanc / opaque à mesure que l'humidité monte (de 35 % à 65 % : de l'alpha du verre normal vers ≈ 0,45 de blanc). Quelques gouttes sur le verre si c'est simple ; sinon la buée seule suffit.
- **L'étiquette** : une petite plaque de verre verticale à côté du bocal avec `21.5°` et, en dessous, l'humidité `52 %` (en violet + ⚠ quand trop humide). Texture canvas comme `_roomLabel`, orientée vers le spectateur avec le même quart de tour (`labelTurn`). Textes : `roomClimate()` (même format que le label).
- **Données manquantes** : température seule → le tube seul, sans bocal ni eau ; humidité seule → le bocal et l'eau sans tube ; état non numérique / indisponible → la grandeur est absente (comme dans `roomClimate`). Rien → pas d'objet.
- **Où** : sur l'étage du haut quand le toit est retiré (mêmes conditions que `_roomLabel`, `cutaway && room.main`), pièces intérieures seulement. Position : à l'endroit du capteur de température placé dans la pièce (`room.temps[0].x/.y`), sinon du capteur d'humidité, sinon au centre de la pièce décalé pour ne pas recouvrir le label.
- **Plus de doublon** : quand le bocal est affiché, le label au sol ne garde que le nom (et l'icône), sans la ligne température · humidité.
- **Nouvelle option `climate_display`** : `thermometer` (défaut, le bocal) ou `label` (le comportement actuel, rien ne change). Dans l'éditeur, à côté de `temp_min` / `temp_max` : un sélecteur « Room climate in 3D » (« Glass thermometer » / « Floor label ») et `humidity_max` (« Too humid from (%) »).

## Conception (fixe)

- Fichier : `src/cards/floorplan/ha-plooum-floorplan-card.js` (≈ 9 100 lignes ; lis seulement les sections citées).
  - Une fonction `climateJar(x, y, z, o)` près de `modelMeshes()` (~l. 1354) qui renvoie ses meshes, comme les modèles ; verre = `new Mesh(MODE.flat, { transparent: true })` comme la vitre de l'aquarium (~l. 1386–1388), eau idem, `bubbles()` (~l. 1282) pour les bulles, `tube()` pour le thermomètre (comme le conduit du poêle, ~l. 1563).
  - Appel dans `_buildScene`, boucle des pièces (~l. 4510–4530, à côté de `this._roomLabel(...)`) ; l'étiquette par une méthode voisine de `_roomLabel` (~l. 4769) qui en reprend le canvas et le cache par `key`.
  - Couleurs : `tempRgb` (~l. 353), `min`/`max` déjà calculés (~l. 3347). Humidité : moyenne de `room.hums` comme `roomClimate` (~l. 626) ; factorise une petite fonction `roomHumidity(room)` à côté de `roomTemperature` si elle n'existe pas, utilisée par les deux.
  - Options : `climate_display`, `humidity_max` lus comme `temp_min` / `temp_max` ; éditeur ~l. 6725 ; la liste de nettoyage ~l. 8217.
- Docs : `docs/floorplan.md` (tableau des options ~l. 130 ; ligne humidité ~l. 207) : les deux options et le bocal. Pas de README. Pas de `CARD_VERSION`.

## Vérifications (strict minimum)

Vue `/plooum-test/floorplan` (`dev/ha-config/dashboards/plooum-test.yaml` ~l. 460–600) : Living Room a température + humidité placées (x 6 / 6.5, y 1), Kitchen la température seule (x 10.5, y 0.5), Bedroom (étage) une humidité de pièce + une température. Pilotage : `input_number.living_room_humidity`, `input_number.living_room_temperature`.

1. Captures, même orbite fixée (`card._orbit`), toit retiré au rez-de-chaussée, cadrées sur Living Room + Kitchen : `jar-normal.png` (humidité 50 %, 21 °C) et `jar-humid.png` (humidité 75 %, 26 °C : eau violette, bulles, buée, tube rouge-orangé). Kitchen montre le tube seul.
2. Une suite `dev/tests/floorplan-climate.json` (2–3 tests, pas plus) : le bocal de Living Room existe avec un mesh `animated` seulement quand l'humidité ≥ 60 ; Kitchen n'a pas d'eau ; `climate_display: label` → aucun bocal et le label a sa ligne climat. Lance-la une fois à la fin, plus `dev/ui_test.py dev/tests/cards-smoke.json --only floorplan:`.
3. Éditeur dans `/plooum-edit` : les deux champs émettent `config-changed` (vérification à la main, pas de test).
4. Console sans erreur.

## Livraison

PR « Carte floorplan : un bocal embué montre la température et l'humidité de chaque pièce en 3D » sur `feature/climate-jar`. Joins les deux captures dans ton rapport (chemins absolus). Rapport au format de `pilot-subagent`. Les frictions comptent.
