# Prompt 39 : aquarium-lamp

Tu travailles dans ton worktree sur la branche **`feature/aquarium-lamp`**, à partir d'un `main` à jour. Charge les skills : `pilot-subagent`, `pr-workflow`, `floorplan-card`, `ha-dev-testing`. Démarre ton propre HA (`dev/ha.sh start`, puis `npm run build`) et teste dans le **navigateur intégré de Claude, dans ton propre onglet** (`tabs_create`) ; `dev/shot.py` seulement en repli. `dev/ha.sh stop` à la fin. Ouvre la PR, ne la fusionne jamais. Une question que tu ne peux pas trancher : arrête-toi et signale-la (Questions ouvertes), n'attends pas. Un autre sous-agent modifie en parallèle le shader de projection (`uMode == 5`) et la carte d'ombre : n'y touche pas.

## Objectif

Dans la vue 3D de la carte floorplan, on ne voit pas qu'un aquarium (`model: aquarium`, `light_entity`) est allumé : seule l'eau change à peine de teinte, et la bande lumineuse sous la rampe n'est visible que d'en haut. Exigences fixes (utilisateur, 2026-11-10, proposition « C » choisie sur croquis) :

- **Lampe suspendue** au-dessus du bac (remplace la rampe actuelle posée sur le bac) : un plafonnier d'aquarium plat et allongé (≈ 0,9 × la longueur du bac), pendu par deux fins câbles qui montent jusqu'au plafond (`o.ceiling`, comme le conduit du poêle ; si absent, des câbles courts).
- **Allumée** : la face du dessous de la lampe brille (`emissive`), un **halo** comme celui des lampes de plafond (même rendu : `MODE.glow`, `ghost = LAMP_GHOST`, visible à travers murs et toits) autour de la lampe, et des **rayons de lumière** qui descendent dans l'eau et **scintillent doucement** (petite animation : marque le mesh `animated`, comme les bulles ou `MODE.pulse` ; réutilise un mode existant si possible, sinon un nouveau mode minimal). Visible de jour comme de nuit (rien d'assombri par `uAmbient`).
- **Éteinte** : lampe sombre, pas de halo ni de rayons, eau plus terne qu'aujourd'hui pour que la différence se voie d'un coup d'œil.
- Sans `light_entity` (`o.light === null`) : pas de lampe, comme aujourd'hui pas de rampe.

## Conception (fixe)

- Fichier : `src/cards/floorplan/ha-plooum-floorplan-card.js`, `modelMeshes()` branche `aquarium` (~l. 1358–1440) : remplace le bloc `if (o.light !== null) { ... }` (rampe, bande, faisceau, ~l. 1395–1408) ; ajuste la couleur de l'eau éteinte (~l. 1392). Modèles à copier : la lampe de plafond et son halo dans `_buildScene` (~l. 4590–4610 : `tube(lamp, ...)`, `lamp.ghost`, `halo.ghost`), le halo du poêle (~l. 1541–1545, `MODE.glow`), `bubbles()` et `MODE.pulse` (~l. 1766–1768, shader ~l. 1881) pour l'animation. `_animate3d()` redessine déjà tant qu'un mesh `animated` est dans la scène.
- `o.ceiling` : vérifie qu'il est bien passé pour l'aquarium dans `_buildScene` (~l. 4620–4640, `ceiling: H`) ; sinon passe-le.
- Docs : `docs/floorplan.md` l. 48–56 (aquarium, `light_entity`) : décris la lampe suspendue, son halo et ses rayons. Pas de README. Pas de `CARD_VERSION`.

## Vérifications (strict minimum)

Vue `/plooum-test/floorplan` (cherche l'aquarium avec `light_entity: light.aquarium_light` dans `dev/ha-config/dashboards/plooum-test.yaml` ; s'il n'y en a pas sur la vue floorplan, ajoute `light_entity` à un aquarium existant de cette vue). `light.aquarium_light` est piloté par `input_number.aquarium_light_level` (0 = éteinte).

1. Capture `aquarium-lit.png` et `aquarium-off.png` : même point de vue (orbite fixée dans `card._orbit`), allumé puis niveau 0. La lampe, le halo et les rayons se voient nettement allumés, rien éteint.
2. Capture `aquarium-lit-night.png` : allumé, `lighting: night`.
3. `dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-models.json` passe (une fois, à la fin) ; ajoute-y au plus une assertion : l'aquarium allumé contient un mesh `animated` et un mesh avec `ghost`, éteint aucun des deux.
4. Console sans erreur.

## Livraison

PR « Carte floorplan : une lampe suspendue avec halo montre l'aquarium allumé » sur `feature/aquarium-lamp`. Joins les trois captures dans ton rapport (chemins absolus). Rapport au format de `pilot-subagent`. Les frictions comptent.
