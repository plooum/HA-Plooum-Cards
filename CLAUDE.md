# CLAUDE.md

Ce fichier donne à Claude Code (claude.ai/code) les consignes pour travailler dans ce dépôt.

## Commandes

```bash
npm install     # install dependencies
npm run build   # rollup -c — regenerates ha-plooum-cards.js and its sourcemap at the repo root
```

`compil.sh` enchaîne les deux. Il n'y a ni lint ni tests unitaires : les cartes se testent dans un Home Assistant local, voir **Testing** plus bas.

Le bundle compilé (`ha-plooum-cards.js` / `.js.map`) n'est **pas** versionné (gitignored). En local, lance `npm run build` après toute modification sous `src/` pour que le HA de dev le serve. Sur GitHub, [build.yml](.github/workflows/build.yml) le construit à chaque push et chaque PR (artefact téléchargeable) et l'attache à chaque release publiée : HACS le télécharge depuis les assets de la release. [validate.yml](.github/workflows/validate.yml) lance les vérifications HACS.

## Architecture

C'est un unique plugin Lovelace HACS (Home Assistant Community Store) qui regroupe plusieurs cartes personnalisées indépendantes dans un seul fichier JS.

- **Point d'entrée unique** : [src/index.js](src/index.js) importe chaque module de carte pour qu'il s'enregistre. Rollup ([rollup.config.mjs](rollup.config.mjs)) l'assemble en un seul fichier IIFE, `ha-plooum-cards.js`, l'unique ressource que HACS / Home Assistant charge (déclarée dans [hacs.json](hacs.json), livrée comme asset de release).
- **Chaque carte est entièrement autonome** dans `src/cards/<card-name>/`, en un seul fichier `.js` écrit avec `lit` (`LitElement`, `html`, `css`). Un fichier de carte définit, dans l'ordre :
  1. La classe de la carte (`static getConfigElement()`, `static getStubConfig()`, `setConfig()`, `render()`, `static get styles()`).
  2. Une classe d'éditeur associée (`<Card>Editor`) qui implémente l'interface visuelle de configuration (`setConfig()`, `_valueChanged()` qui émet des événements `config-changed`, `render()`).
  3. Un bloc d'enregistrement en bas de fichier : `customElements.define('ha-plooum-<name>-card', ...)` et `customElements.define('ha-plooum-<name>-card-editor', ...)`, chacun protégé par `if (!customElements.get(...))` pour éviter le double enregistrement, puis l'ajout d'une entrée (`type`, `name`, `description`, `preview`) dans `window.customCards`.
- Les cartes ne partagent ni code ni état : il n'y a pas de couche de composants ou d'utilitaires commune. Toute ressemblance entre cartes (sélecteurs de couleur, sélecteurs d'entité dans les éditeurs…) est dupliquée dans chaque carte plutôt que factorisée.
- Une nouvelle carte garde le nom de dossier et le slug de l'élément personnalisé `ha-plooum-<name>-card` identiques (ex. `src/cards/dpad/` → `ha-plooum-dpad-card`). Certaines cartes existantes ne le font pas : `multistatus/` → `ha-plooum-multi-status-card`, `tabbed/` → `ha-plooum-tabs-card`, `button-badge/` → `ha-plooum-buttonbadge-card`. Ne renomme jamais un élément existant : les tableaux de bord des utilisateurs le référencent. Seule exception : une demande explicite du propriétaire, livrée comme changement cassant annoncé dans les notes de release (la carte `habitat` est devenue `ha-plooum-vivarium-card`, son option `habitat` `vivarium_type`, sans alias).

### Conventions

- **Tout est en français dans ce dépôt, sauf le code et la documentation utilisateur** (décision du 2026-10-14).
  - Restent en anglais : le code (identifiants, commentaires, textes affichés par les cartes et leurs éditeurs : libellés, infobulles, messages), [README.md](README.md) et `docs/*.md`. [README.fr.md](README.fr.md) reste en français.
  - Passent en français : ce fichier, les skills du projet, les fichiers du pilote, les prompts, les titres et descriptions de PR, les messages de commit, les notes de release.
- **Le README existe en deux langues** : [README.md](README.md) en anglais (affiché par GitHub et HACS) et [README.fr.md](README.fr.md) en français, chacun renvoyant vers l'autre en haut. Toute modification de l'un doit être faite dans l'autre, dans la même PR.
- Les problèmes hors périmètre repérés en travaillant vont dans [TODO.md](TODO.md), pas dans des tâches de fond ni des worktrees lancés à part.

### Ajouter une nouvelle carte

1. Crée `src/cards/<card-name>/` avec le fichier source de la carte, selon le schéma classe / éditeur / enregistrement ci-dessus (garde-fous `customElements.get` compris).
2. Ajoute une ligne d'import dans [src/index.js](src/index.js) : `import './cards/<card-name>/<file>.js';`.
3. Lance `npm run build`.
4. Ajoute une ligne (et une courte description avec un aperçu) dans [README.md](README.md) et [README.fr.md](README.fr.md), et un fichier `docs/<card-name>.md` qui documente ses paramètres de configuration.
5. Ajoute-lui une vue dans [dev/ha-config/dashboards/plooum-test.yaml](dev/ha-config/dashboards/plooum-test.yaml) (et une carte dans la vue `all`), branchée sur les entités de test.

Aucune autre configuration (ni nouvelle config Rollup, ni nouvelle ressource HACS) n'est nécessaire : toutes les cartes sont livrées dans le même bundle.

## Workflow Git

Toute modification passe par une pull request : code, docs, READMEs, ce fichier, [TODO.md](TODO.md), les skills de `.claude/skills/`, workflows, changements de `CARD_VERSION`. Rien n'est commité directement sur `main`, à une exception : le passage de relais et les prompts du pilote dans `.claude/pilot/` (voir **Mode pilote**) sont commités et poussés directement sur `main`. C'est un gitflow léger, sans branches `develop` ni `release`.

1. Crée une branche `feature/<name>` depuis un `main` à jour (`git fetch`, `git pull --ff-only`). Le nom de la branche ne doit pas contenir `tags/` (ex. `feature/semver-tags`) : HACS retire `tags/` des URL qu'il télécharge, sa validation échoue donc sur une telle branche.
2. Commite dessus et pousse la branche. Une fonctionnalité ou un correctif par PR : plusieurs éléments du TODO donnent plusieurs PR.
3. Ouvre une PR vers `main` avec `gh pr create` et vérifie que sa CI (Build, Validate) passe. Titre et description de la PR, ainsi que messages de commit, en français.
4. Attends l'approbation explicite du propriétaire. Ne fusionne jamais une PR avant.
5. Une fois approuvée : si `main` a bougé (hors commits qui ne touchent que `.claude/pilot/`, qui ne changent rien à ce que la CI vérifie), rebase la branche sur `origin/main` et repousse-la (le force-push est permis sur la branche de fonctionnalité uniquement) pour que la CI tourne sur le résultat réel. Puis **squash-merge** : `gh pr merge <N> --squash --delete-branch`, sujet `<titre de la PR> (#<N>)`. Chaque PR devient un seul commit sur `main`.
6. En local : `git checkout main`, `git pull --ff-only`, `git branch -D feature/<name>` (`-D` : une branche squashée n'est pas un ancêtre de `main`). Vérifie les runs Build et Validate sur `main`.

### Releases

Les tags s'appellent `V<major>.<minor>.<patch>` (légers) et suivent le versionnement sémantique depuis `V1.0.0` (les tags `V0.0.NN` sont antérieurs) : incrémente la version majeure pour un changement cassant des tableaux de bord utilisateurs (carte, élément ou option renommé, option supprimée), la mineure pour une nouvelle fonctionnalité, le patch pour de simples correctifs. Ils se posent sur `main` une fois les PR fusionnées ; lance d'abord `git fetch --tags`. La release GitHub porte le nom du tag et ses notes sont en français, comme [README.fr.md](README.fr.md). Un changement de `CARD_VERSION` passe par sa propre PR comme tout changement ; une nouvelle carte sort avec son `CARD_VERSION` initial.

La publication de la release déclenche [build.yml](.github/workflows/build.yml), qui construit le bundle et y attache `ha-plooum-cards.js` et son `.map` : vérifie que le run a réussi et que les deux assets sont sur la release.

## Mode pilote

Quand l'utilisateur dit à un agent qu'il est **le pilote** (« tu es le pilote »), celui-ci prend ce rôle pour la session sans autre consigne : il charge le skill global `pilot` (de [plooum/claude-pilot](https://github.com/plooum/claude-pilot) ; sur une nouvelle machine : `git clone https://github.com/plooum/claude-pilot ~/.local/opt/claude-pilot && ~/.local/opt/claude-pilot/install.sh`) **et** le skill du projet [pilot-ha-plooum](.claude/skills/pilot-ha-plooum/SKILL.md), puis lit le passage de relais [.claude/pilot/HANDOFF.md](.claude/pilot/HANDOFF.md) et fait tourner la boucle : il écrit les prompts, lance des sous-agents (surtout Sonnet), relit et fait itérer leurs PR, transforme leurs frictions en skills et tient le passage de relais à jour. Il ne demande à l'utilisateur que les décisions qui lui reviennent et les approbations de fusion.

Les skills du projet vivent dans `.claude/skills/` (`pilot-ha-plooum`, `pr-workflow`, `ha-dev-testing`, `floorplan-card`, …). Les sous-agents les chargent quand leur description correspond ; ils chargent `pr-workflow` avec le skill global `pilot-subagent`.

## Testing

Les cartes se testent dans un vrai Home Assistant Core local (sans Docker : l'utilisateur n'est pas dans le groupe `docker`) qui vit dans [dev/](dev/). Sa configuration, ses entités de test et ses tableaux de bord sont versionnés ; son état d'exécution (`.storage`, base de données, venv, token, logs) est gitignored.

### Le démarrer

```bash
dev/ha.sh start     # first run: installs HA (uv venv, Python 3.14), onboards, creates the token and the /plooum-edit dashboard (~10 s afterwards)
dev/ha.sh status | stop | restart | logs [n]
dev/ha.sh reset     # wipes runtime state only (git clean -X on dev/ha-config); next start re-onboards
```

HA écoute sur 127.0.0.1 uniquement. Vérifie s'il tourne déjà (`dev/ha.sh status`) avant de le démarrer.

**Une instance par checkout.** Le HA du checkout principal est sur **8123**. Un worktree git a le sien : `dev/ha.sh start` lancé dans le worktree prend le premier port libre à partir de 8124 (gardé dans `dev/.ha-port`, gitignored ; `HA_PORT=<n>` en force un), s'initialise en ~7 s et sert le bundle **de ce worktree** (`npm run build` dedans). Le venv et `node_modules` sont ceux du checkout principal, liés par `dev/ha.sh start` / `dev/ha.sh setup` (le checkout principal a donc besoin d'un `npm install` et d'un premier `dev/ha.sh start`/`install`). `dev/shot.py`, `dev/ui_test.py`, `dev/api.sh` et `dev/bootstrap.py` suivent le checkout où ils se trouvent (son `dev/.ha-port` et son `dev/.ha-token` ; `--url` / `HA_URL` forcent autre chose). `dev/ha.sh list` montre toutes les instances qui tournent (port, pid, checkout) ; `dev/ha.sh stop` n'arrête que celle de ce checkout. Arrête-la avant de supprimer le worktree. Chaque instance prend ~270 Mo. La langue de l'utilisateur de dev est réglée sur l'anglais par `dev/bootstrap.py` (quelle que soit la langue du navigateur), ses identifiants de test s'y trouvent ; un token longue durée est écrit dans `dev/.ha-token`.

### Boucle modifier → tester

1. Modifie `src/…`, lance `npm run build`.
2. Recharge la page. Pas de redémarrage de HA : l'intégration personnalisée `plooum_dev` ([dev/ha-config/custom_components/plooum_dev](dev/ha-config/custom_components/plooum_dev/__init__.py)) sert le `ha-plooum-cards.js` du dépôt (et son `.map`) sur `/plooum_dev/` avec `Cache-Control: no-store`, déclaré comme ressource Lovelace exactement comme une installation HACS.
3. Ne redémarre HA (`dev/ha.sh restart`) qu'après une modification de `configuration.yaml`. Les tableaux de bord YAML sont relus au rechargement de la page.

### Tableaux de bord

- `/plooum-test/<view>` : tableau de bord YAML ([plooum-test.yaml](dev/ha-config/dashboards/plooum-test.yaml)) avec une vue `all` qui montre toutes les cartes, et une vue par carte pour les cas ciblés (`/plooum-test/vivarium` est une vue en sections qui couvre chaque sévérité, chaque style de bandeau et chaque cas de repli, y compris les cellules de grille étroites et basses ; `/plooum-test/multistatus` couvre les éléments allumés, éteints, indisponibles, à entité manquante et SVG ; `/plooum-test/floorplan` est une vue panneau pleine largeur avec un plan à deux étages écrit à la main, avec caméras et terrasse, le même plan en 3D, en 3D avec écrans flottants (`screen_mode: billboard`), et un plan généré à partir des zones ; les caméras du jardin et du salon projettent leur image). Mets les cas de régression d'une carte dans sa vue.
- `/plooum-edit/<view>?edit=1` : copie du même tableau de bord en mode stockage, le seul où l'on peut ouvrir les **éditeurs de carte** (clic sur « Modifier » sur une carte). Il est initialisé depuis le fichier YAML seulement s'il n'existe pas ; pour le réinitialiser, `dev/ha.sh reset`.

### Navigateur : utiliser le panneau navigateur intégré

L'utilisateur veut regarder, donc pilote le navigateur intégré de Claude Code (`mcp__Claude_Browser__*`) : `preview_start` avec `url: http://127.0.0.1:8123/plooum-test/all` (le port de l'instance du checkout, `dev/ha.sh status` ; avec plusieurs instances, un onglet par instance : `tabs_create`, puis `navigate` avec son `tabId`, et n'agis jamais que sur ton propre onglet). La connexion est automatique (fournisseur `trusted_networks` avec contournement pour 127.0.0.1). Utilise `read_console_messages` (onlyErrors) pour repérer les erreurs de carte, et `javascript_tool` pour inspecter le shadow DOM ou simuler une saisie. Le tampon de console du panneau n'est pas vidé entre deux chargements de page : il garde d'anciens messages, comme les échecs de websocket pendant un redémarrage de HA. Pour une vérification propre des erreurs, lance `dev/shot.py`.

[dev/shot.py](dev/shot.py) est la solution de repli sans interface (Chrome système via Playwright), quand le panneau n'est pas disponible ou pour des vérifications scriptées. Il fait une capture d'écran, peut recadrer sur un élément, évalue du JS, et sort avec le code 1 si la page a journalisé des erreurs :

```bash
dev/.venv/bin/python dev/shot.py /plooum-test/multistatus -e ha-plooum-multi-status-card -o dev/shots/ms.png --js "1+1"
```

### Suites de tests d'interface

[dev/ui_test.py](dev/ui_test.py) lance toute la liste de tests d'une fonctionnalité en une commande, dans un seul Chrome sans interface, avec des assertions : `dev/.venv/bin/python dev/ui_test.py dev/tests/<suite>.json [--only <name>]` affiche PASS / FAIL par test, l'étape en échec et les erreurs de console, et sort avec le code 1 au moindre échec. Les suites vivent dans [dev/tests/](dev/tests/) (JSON : des tests faits d'étapes `js` / `assert` / `shot`) ; leurs helpers (ouvrir la boîte de dialogue d'un éditeur, glisser, attendre une condition, spécificités du floorplan) sont dans [dev/ui_helpers.js](dev/ui_helpers.js). Le skill `ha-dev-testing` documente le format.

**En direct dans le panneau navigateur.** Les étapes sont exécutées par [dev/ui_runner.js](dev/ui_runner.js), que `ui_test.py` charge sans interface et que le panneau peut aussi ouvrir : `http://127.0.0.1:<port>/plooum_dev/runner.html?suite=<name>[&only=<substring>][&pause=<ms>]` (servi par `plooum_dev`, suites prises dans `dev/tests/`). Il exécute chaque test dans une iframe de même origine à la taille d'écran du test (réduite pour tenir dans le panneau), affiche PASS / FAIL en direct, et finit par `window.uiResult` (`{ passed, failed, errors, summary, tests }`, aussi dans le titre de la page). Quand l'utilisateur regarde, lance les suites là (`pause=300` pour suivre) ; les étapes `shot` y sont ignorées.

**Suite de fumée, à lancer après toute modification de carte** (environ 5 s, les neuf cartes : chacune s'affiche, réagit une fois et son éditeur s'affiche) : `dev/.venv/bin/python dev/ui_test.py dev/tests/cards-smoke.json`. Un test par carte, sur sa propre `/plooum-test/<view>` ; elle restaure les états qu'elle change.

### Entités de test (toutes dans [configuration.yaml](dev/ha-config/configuration.yaml))

| Entité | Usage | Piloté par |
| :--- | :--- | :--- |
| `light.living_room_light` | cible de bascule | `input_boolean.living_room_light` |
| `switch.tv_plug` | cible de bascule, **devient `unavailable`** | `input_boolean.tv_plug`, disponibilité : `input_boolean.tv_plug_available` |
| `sensor.living_room_temperature` / `sensor.living_room_humidity` | valeurs numériques (°C, %) | `input_number.living_room_temperature` / `input_number.living_room_humidity` |
| `cover.living_room_cover` / `cover.bedroom_cover` | volets à position (open/close/stop/set_position) | `input_number.*_cover_position` |
| `cover.kitchen_cover` / `cover.hallway_cover` | volets à position sur les murs extérieurs que voit la caméra du jardin (mur est de la cuisine, mur sud du couloir) ; dessinés dans sa fausse image (`WINDOWS` dans `camera.py`) | `input_number.kitchen_cover_position` / `input_number.hallway_cover_position` |
| `button.ptz_up/down/left/right` | `press` du D-Pad | chaque appui incrémente `counter.ptz_presses` |
| `script.test_script` | actions de script | chaque exécution incrémente `counter.script_runs` |
| `input_boolean.aquarium_pump/co2/uv`, `input_boolean.mower` | booléens simples | eux-mêmes |
| `light.kitchen_light` / `light.bedroom_light` | cibles de bascule | `input_boolean.kitchen_light` / `input_boolean.bedroom_light` |
| `sensor.kitchen_temperature` / `sensor.bedroom_temperature` | valeurs numériques (°C) | `input_number.kitchen_temperature` / `input_number.bedroom_temperature` |
| `binary_sensor.front_door` (door) / `binary_sensor.hallway_motion` (motion) | capteurs binaires avec une classe d'appareil | `input_boolean.front_door_open` / `input_boolean.hallway_motion` |
| `camera.garden_camera`, `camera.driveway_camera` (scènes extérieures), `camera.living_room_camera`, `camera.kitchen_camera`, `camera.garage_camera` (scènes intérieures) | fausses caméras ([camera.py](dev/ha-config/custom_components/plooum_dev/camera.py)) : nom et horloge dessinés sur chaque image ; `camera.living_room_camera` filme le salon de l'intérieur et `camera.garden_camera` la maison depuis le jardin à travers un grand-angle (`distortion: -0.25`), pour de vrai (sol ou terrain en damier, murs rayés, depuis leur pose sur la vue floorplan) : projetées en 3D, leurs images doivent tomber exactement sur la pièce / les façades et le terrain, et les coins de leurs carreaux sont des points connus pour la mise en correspondance de points de l'éditeur ; `camera.garage_camera` **devient `unavailable`** | disponibilité : `input_boolean.garage_camera_available` |
| `sensor.aquarium_temperature` (150L), `sensor.aquarium_60l_temperature` (60L) | mesures de la carte vivarium (°C) | `input_number.aquarium_temperature` / `input_number.aquarium_60_temperature` |
| `sensor.aquarium_ph` | mesure de la carte vivarium, **non numérique** (`calibrating`) quand `input_boolean.aquarium_ph_calibrating` est activé | `input_number.aquarium_ph` |
| `input_number.aquarium_nitrate` | mesure personnalisée de la carte vivarium (mg/L) | lui-même |
| `light.aquarium_light` | lumière variable, son niveau (%) est un `input_number`, 0 = éteinte | `input_number.aquarium_light_level` |
| `input_boolean.aquarium_60_air` | un actionneur critique, éteint au départ | lui-même |
| `sensor.terrarium_temperature` / `sensor.terrarium_humidity` | mesures de la carte vivarium (°C, %) | `input_number.terrarium_*` |
| `switch.terrarium_heat_lamp` / `switch.terrarium_mister` / `switch.terrarium_uvb` | actionneurs de la carte vivarium ; `switch.terrarium_uvb` **devient `unavailable`** | `input_boolean.terrarium_*`, disponibilité : `input_boolean.terrarium_uvb_available` |
| `sensor.pond_temperature` / `switch.pond_uv` | mesure et actionneur du bassin | `input_number.pond_temperature` / `input_boolean.pond_uv` |

`switch.does_not_exist` et `camera.does_not_exist` sont référencées exprès mais n'existent pas (cas de l'entité manquante).

`dev/bootstrap.py` range aussi ces entités dans des étages et des zones (Ground Floor : Living Room, Kitchen, Hallway ; Upstairs : Bedroom, Bathroom — vide exprès), pour les cartes qui lisent le registre des zones (le plan généré de la carte floorplan). Modifie `AREAS` dedans et lance `dev/.venv/bin/python dev/bootstrap.py` pour les changer ; il ne fait qu'ajouter et réaffecter, donc supprime des zones par l'interface ou avec `dev/ha.sh reset`.

`image_upload:` est activé pour le bouton **Capture** de l'éditeur floorplan (l'image de référence d'une caméra, servie sur `/api/image/serve/<id>/original`) ; les images envoyées vivent dans l'état d'exécution, donc `dev/ha.sh reset` les supprime et le tableau de bord YAML ne peut pas en référencer une.

Change des états et vérifie que les actions se sont déclenchées avec [dev/api.sh](dev/api.sh) :

```bash
dev/api.sh POST services/input_boolean/turn_off '{"entity_id":"input_boolean.tv_plug_available"}'   # switch.tv_plug → unavailable
dev/api.sh POST services/input_number/set_value '{"entity_id":"input_number.living_room_temperature","value":-3.5}'
dev/api.sh GET states/counter.ptz_presses        # did the D-Pad click call button.press?
dev/api.sh POST states/sensor.fake '{"state":"unknown"}'   # arbitrary state, not persisted, no services
```

Les cartes se mettent à jour en direct par le websocket ; aucun rechargement n'est nécessaire après un changement d'état.

### Quoi vérifier pour une modification de carte

- Le rendu dans chaque état pertinent : allumé / éteint / `unavailable` / `unknown` / entité manquante, et valeurs non numériques pour les capteurs.
- Les actions : clique dans le panneau, puis vérifie l'entité ou le compteur sous-jacent avec `dev/api.sh`.
- L'éditeur dans `/plooum-edit` : ouvre-le, change un champ et confirme la charge utile de `config-changed`. Le `<input type="color">` natif ouvre une boîte de dialogue du système que le panneau ne peut pas piloter : fixe plutôt `.value` et déclenche un événement `input` via `javascript_tool`.
- Aucune erreur dans la console.

### Pièges (HA 2026.10)

- Sur un tableau de bord, une carte dont `setConfig` échoue ou qui n'est pas définie devient une `hui-error-card` **invisible hors du mode édition**. Un emplacement vide signale une carte cassée : vérifie avec `?edit=1` ou cherche `hui-error-card` dans le DOM.
- Le frontend utilise un polyfill de registre d'éléments personnalisés à portée limitée. Charger le bundle par `frontend: extra_module_url` l'exécute avant le polyfill et les cartes ne sont jamais trouvées : garde-le comme ressource Lovelace.
- `http:` en YAML est déprécié : il devient une configuration « en attente » à confirmer dans l'interface, avec retour arrière automatique. `dev/ha.sh` initialise `.storage/http` à la place.
- Sans `recorder:`, chaque chargement de page journalise un rejet `unknown_command` (`recorder/info`). Il reste activé pour garder la console propre.
- `/lovelace` redirige vers la nouvelle page `/home/overview`, qui n'est pas un tableau de bord Lovelace modifiable ; utilise `/plooum-edit`.
- `ha-form` ignore une clé `label` dans les entrées du schéma ; les libellés passent par `.computeLabel`.
