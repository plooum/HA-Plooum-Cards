---
name: floorplan-card
description: Travailler sur la carte floorplan (src/cards/floorplan/ha-plooum-floorplan-card.js, ~7 200 lignes) - plan du fichier, conventions de plan / 3D / caméra, alignement de la caméra dans l'éditeur, orbite de la vue 3D et pièges. À charger avant de modifier la carte floorplan ou son éditeur.
---

# Carte floorplan

Un seul fichier, [src/cards/floorplan/ha-plooum-floorplan-card.js](../../../src/cards/floorplan/ha-plooum-floorplan-card.js). Sa doc utilisateur : [docs/floorplan.md](../../../docs/floorplan.md). Ne lis pas le fichier de haut en bas : cherche la section avec grep, puis lis autour. Les numéros de ligne ci-dessous sont approximatifs (ils dérivent).

## Plan

| Lignes | Quoi |
| :--- | :--- |
| 1–130 | constantes : `CARD_VERSION`, `CARD_DEFAULTS`, plages, `U3` (px par unité de plan en 3D), `ORBIT_DEFAULT`, `TILT_MIN/MAX` |
| ~130–620 | helpers du plan : pièces, `roomAt`, `resolveFloor(hass, floor)` (éléments avec état, réglages de caméra, `plan.indoor`, `plan.rooms`, `plan.bounds`) |
| `// --- Cameras` ~627 | normalisation de la configuration des caméras (direction, tilt, fov, hauteur, distorsion, épingles…) |
| `// --- 3D geometry` ~740 | `wallSegments`, murs, toits |
| `// --- Camera model` ~978 | `cameraHeight`, `cameraPose(cam, C, z0)`, `toPicture(pose, P, aspect)`, modèle d'objectif |
| `// --- WebGL renderer` ~1181 | `Mesh`, `GlScene`, `viewMatrix` |
| ~1800–2040 | résolution de caméra et géométrie de l'éditeur : `solveCamera`, `planCorners`, `facadeCorners`, `planOccluders`, `segmentToPicture` |
| `class HaPlooumFloorplanCard` ~2188 | la carte. `// --- 3D view` ~3068 (`_homeView`, `_renderScene3d`, `_shownOrbit`, `_buildScene`), interactions ~3986–4115 (`_down3d`, `_move3d`, `_up3d`, `_wheel3d`, `_zoom3d`, `_resetView`, `_screenTap`) |
| `class HaPlooumFloorplanCardEditor` ~5178 | l'éditeur. `_editFloor`, `_applyDrag`, le panneau de sélection et le panneau caméra « Advanced: 3D and projection » (~5650), `_renderCameraView` (~5747), `_cvDown/_cvMove/_cvUp`, `_pinnedSettings`, `_selectionChanged`, `_cameraDefaults` |
| ~7225 | enregistrement |

## Conventions

- Coordonnées du plan : x vers la droite, y **vers le bas**, en unités de plan (≈ mètres). L'étage k se tient à `z0 = k * (wallHeight + SLAB)`.
- `direction` de la caméra : degrés dans le plan, `tilt` : vers le bas depuis l'horizontale, `fov` : horizontal.
- **Orbite 3D** (`this._orbit`, null = cadrée par `_homeView`) : `{ az, tilt, dist, target: [x, y, z] }`. L'œil est à `target + d·(sin t·sin a, sin t·cos a, cos t)` avec `d = dist / U3` : `tilt` 0 = droit vers le bas, 90 = horizontal ; la direction horizontale de l'œil depuis la cible est `(sin az, cos az)`, donc `az = atan2(nx, ny)` place l'œil le long du vecteur de plan `(nx, ny)`. `_shownOrbit` s'anime vers une nouvelle `_orbit`. `_screenTap` est un exemple travaillé d'orbite calculée (derrière une caméra, cadrant son écran). `dist` est en px (`U3` = 100 px par unité de plan) alors que `target` est en unités de plan (z aussi) : `dist: 1000` fait 10 unités de la cible. Dans un test ou un script de rendu, fixe `card._orbit` (et `card.setConfig({...card.config, ...})`) dans la page : pas de rechargement nécessaire.
- Pour un rendu qui montre de la géométrie (toits, murs), désactive d'abord `projection` dans la configuration de la carte : les images projetées la cachent. Avant une série de captures, prends-en une et vérifie de quel côté de la maison tu es.
- **Les images des caméras se rafraîchissent sur `card._tick`** (le paramètre `t=` de chaque URL d'instantané). Après avoir changé ce que filme une caméra de dev (la position d'un volet), incrémente `card._tick++` et attends la nouvelle image ; une caméra sans `reference_picture` projette son dernier instantané.
- État de la vue 3D : `_view` ('2d' / '3d'), `_level3d` (étages affichés, null = tous + toit), `_focus`. `_scene3dState` contient `vp` (`{ w, h, p }` : zone d'affichage et distance de perspective), `home`, `screens`, `cameras`.
- `facadeCorners(plan.indoor, wallHeight, pose, aspect, hidden)` renvoie les 4 coins de la façade qu'une caméra extérieure voit le mieux : celle que l'éditeur propose d'épingler. Une caméra intérieure utilise sa propre pièce : `plan.indoor[roomAt(plan.indoor, x, y)]`.

- Inspecter la scène 3D depuis un test : `card._plans3d(card._floors(), 99)` donne les étages empilés `s` (`s.all`, `s.shown`, `s.H`) ; appuie-toi sur de telles méthodes plutôt que sur des fonctions de niveau module, que les tests ne peuvent pas appeler.

## Pièges de l'éditeur

- Annulation dans l'éditeur : les entrées de `_history` sont `{ floors, roofs }` (`_remember`, `_undo`). La couche des toits (`_roofLayer`) modifie `roofs` par `_editRoofs` / `_setRoofs` ; les pièces et les zones de toit partagent le code de pointeur du canvas (le `target` du glissement : `'room' | 'roof'`). Pour les tests : `_autoRoofZones()` / `_roofZones()`.

- Pendant un glissement de coin ou d'image, les nouveaux réglages de caméra ne vivent que dans `this._camDrag.settings` (appliqués à l'étage affiché par `_applyDrag`). **`config-changed` n'est émis qu'au relâchement du pointeur** (`_cvUp`) : la carte d'aperçu de HA se met à jour au dépôt, pas pendant le glissement.
- HA peut donner à la carte d'aperçu une nouvelle configuration par `setConfig` ou la recréer (les piles reconstruisent leurs cartes) : un état qui doit survivre à une mise à jour ne peut pas vivre seulement sur l'instance de la carte.
- La carte n'a pas de lien direct avec son éditeur : ce sont des éléments séparés, tous deux quelque part sous le shadow root de `hui-dialog-edit-card`. Les deux sont définis dans ce fichier, donc l'état de niveau module est partagé entre eux.
- En mode édition, `card.preview` vaut vrai aussi pour les cartes du tableau de bord, pas seulement pour l'aperçu de la boîte de dialogue (voir `ha-dev-testing`).

## Vue de réglage (éditeur ↔ aperçu)

Tant qu'une caméra à projection est alignée (panneau Advanced ouvert), la carte d'aperçu de la boîte de dialogue, ou la carte intégrée de l'éditeur dans une boîte étroite, montre la projection depuis un point de vue de contrôle. Conception, à réutiliser pour tout ce que l'éditeur doit montrer dans l'aperçu :

- `setupView(hass, floors, req, vp, wallHeight)` : l'unique fonction qui calcule le point de vue (extérieur : face à la façade de `facadeCorners` ; intérieur : au-dessus de la caméra, son étage seulement ; sinon derrière la caméra).
- `setupDialogs` : une `Map` de niveau module indexée par l'élément `hui-dialog-edit-card` (trouvé avec `dialogOf()`, en remontant `parentNode || host`) : l'éditeur, sa configuration, la requête `{ camera, floor, aspect, seq }`, les cartes enregistrées, l'état de la vue libre, la vue à restaurer (`before`). Les cartes s'enregistrent dans `connectedCallback` et la lisent aussitôt, c'est ainsi qu'une carte reconstruite par HA garde le réglage. Lisible dans les tests par `customElements.get('ha-plooum-floorplan-card').setupDialogs`.
- `setupTarget(state)` : la carte de l'aperçu, retrouvée par sa configuration (`configKey()` met en cache les chaînes JSON par objet de configuration : il tourne à chaque mise à jour de carte).
- Éditeur : `_setupBump()` après chaque changement d'alignement (`seq++`), `_checkLayout()` (regroupé par rAF, jamais pendant un glissement) décide large ou étroit, `_embeddedCard()` est une vraie carte avec `_embedded = true` (sans en-tête).
- Carte : `_syncSetup()` (depuis connect, `setConfig`, `updated`), `_userMoved()` dans chaque geste 3D → vue libre, `_renderSetupBadge()`.

## Plan de test

`/plooum-test/floorplan` et `/plooum-edit/floorplan?edit=1` (carte 1 de la pile « Home » en 2D, carte 3 « Home in 3D », carte 4 « floating screens »). Caméras : `camera.garden_camera` (extérieure, grand-angle, `distortion: -0.25`, projetée), `camera.living_room_camera` (intérieure, projetée), `camera.garage_camera` (peut devenir indisponible), `camera.does_not_exist` (manquante). Leurs images sont rendues depuis leur vraie pose, donc un bon réglage fait tomber la projection exactement sur les murs et le sol.
