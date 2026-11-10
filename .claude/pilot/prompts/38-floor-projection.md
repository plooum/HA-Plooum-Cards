# Prompt 38 : floor-projection

Tu travailles dans ton worktree sur la branche **`feature/floor-projection`**, à partir d'un `main` à jour. Charge les skills : `pilot-subagent`, `pr-workflow`, `floorplan-card`, `ha-dev-testing`. Démarre ton propre HA (`dev/ha.sh start`, puis `npm run build`) et teste dans le **navigateur intégré de Claude, dans ton propre onglet** (`tabs_create`) ; `dev/shot.py` seulement en repli. `dev/ha.sh stop` à la fin. Ouvre la PR, ne la fusionne jamais. Une question que tu ne peux pas trancher : arrête-toi et signale-la (Questions ouvertes), n'attends pas. Un autre sous-agent modifie en parallèle le modèle 3D de l'aquarium (`modelMeshes`) : ne touche pas à cette partie.

## Objectif

Dans la vue 3D de la carte floorplan, l'image projetée d'une caméra (`projection: true`) s'efface aujourd'hui sur toute surface vue en angle rasant (`PROJ_GRAZING = [10, 20]`) et s'arrête à `PROJ_REACH = 25`. L'utilisateur veut voir le **sol extérieur** loin de la caméra. Exigences fixes (utilisateur, 2026-11-10) :

- Sur le **sol** (surfaces horizontales tournées vers le haut : terrain, pièces extérieures/terrasses, sols des pièces), **pas de fondu selon l'angle** de vue.
- Le sol a une **distance limite de 30** (unités de plan ≈ m), avec le même fondu de fin que la portée actuelle (les derniers 30 %).
- **Rien ne change pour les murs** (ni les pans de toit) : fondu rasant 10–20° et portée 25 comme aujourd'hui.
- Constantes, pas d'option de configuration.

## Conception (fixe)

- Fichier : `src/cards/floorplan/ha-plooum-floorplan-card.js`. Constantes ~l. 86–89 : ajoute `PROJ_FLOOR_REACH = 30` à côté de `PROJ_REACH` (commentaire d'une ligne).
- Shader de projection, `uMode == 5` du `GL_FRAGMENT` (~l. 1845–1866) : la normale de la surface est dans `vUV.xyz` (posée par `poly()`, voir `MODE.picture`). Sol = `normalize(vUV.xyz).z > 0.9`. Pour le sol : saute le `smoothstep` rasant, et calcule le fondu de portée avec 30 au lieu de `uReach`. Pour le reste : inchangé.
- **Carte d'ombre** : sa profondeur est normalisée par `uReach` (`GL_DEPTH_FRAGMENT` ~l. 1929–1935, lue ~l. 1859). Au-delà de 25 elle sature, et un sol entre 25 et 30 serait jeté comme caché. Fais couvrir la carte d'ombre jusqu'à `max(PROJ_REACH, PROJ_FLOOR_REACH)` (passe cette portée au programme de profondeur et à la lecture `near`), en gardant la portée des murs à 25 dans le fondu. Point de départ : `reach: PROJ_REACH` dans `_buildScene` (~l. 4404) et l'usage de `proj.reach` dans `GlScene` (cherche `uReach`). Choisis le plus simple : par exemple un uniforme `uFloorReach`, ou `proj.reach` = 30 pour l'ombre et une constante 25 pour les murs.
- Docs : `docs/floorplan.md` l. 35 (phrase sur l'angle rasant) : dis que le sol n'a pas ce fondu et que l'image du sol s'arrête à 30 m de la caméra (murs : 25). Pas de README (pas de changement de fonctionnalité listée). Pas de `CARD_VERSION`.

## Vérifications (strict minimum)

Vue `/plooum-test/floorplan`, carte « Home in 3D », `camera.garden_camera` (extérieure, projetée). Pas de nouvelle suite.

1. Capture `garden-floor-far.png` : vue 3D orbitée pour voir le terrain au loin devant la caméra du jardin. Le damier du terrain continue là où il s'effaçait avant (fais la même capture sur `main` avant ta modification : `garden-floor-far-before.png`).
2. Les murs : dans la même vue, la façade garde son image comme avant (vérifie à l'œil sur les deux captures).
3. `dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-projected-windows.json` passe (lancé une fois, à la fin).
4. Console sans erreur (shader qui compile).

## Livraison

PR « Carte floorplan : l'image projetée couvre le sol extérieur jusqu'à 30 m, quel que soit l'angle » sur `feature/floor-projection`. Joins les deux captures dans ton rapport (chemins absolus). Rapport au format de `pilot-subagent`. Les frictions comptent.
