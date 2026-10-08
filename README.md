# HA Plooum Cards

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Une collection de cartes Lovelace personnalisées pour Home Assistant, packagée comme **une seule extension HACS**. Une installation, une resource JavaScript, puis chaque carte est disponible indépendamment dans le sélecteur de cartes de l'éditeur Lovelace.

## Cartes incluses

| Carte | Type Lovelace | Doc |
| :--- | :--- | :--- |
| Ha Plooum Button Badge Card | `custom:ha-plooum-buttonbadge-card` | [docs/button-badge.md](docs/button-badge.md) |
| Ha Plooum Cover Card | `custom:ha-plooum-cover-card` | [docs/cover.md](docs/cover.md) |
| Ha Plooum D-Pad Card | `custom:ha-plooum-dpad-card` | [docs/dpad.md](docs/dpad.md) |
| HA Plooum GridIcons Card | `custom:ha-plooum-gridicons-card` | [docs/gridicons.md](docs/gridicons.md) |
| HA Plooum Multi Status Card | `custom:ha-plooum-multi-status-card` | [docs/multistatus.md](docs/multistatus.md) |
| Ha Plooum Tabs Card | `custom:ha-plooum-tabs-card` | [docs/tabbed.md](docs/tabbed.md) |
| Ha Plooum Room Temp & Humidity Card | `custom:ha-plooum-temp-humidity-card` | [docs/temp-humidity.md](docs/temp-humidity.md) |

---

### Ha Plooum Button Badge Card
Bouton combiné à un badge flottant, icône et texte personnalisables, actions tap/hold (toggle, navigate, script).

![Button Badge preview](docs/previews/button-badge.png)

### Ha Plooum Cover Card
Contrôle de plusieurs volets roulants côte à côte avec sliders verticaux, icônes d'action et verrouillage de sécurité.

![Cover preview](docs/previews/cover.png)

### Ha Plooum D-Pad Card
Pavé directionnel façon télécommande, idéal pour le contrôle PTZ de caméras.

![D-Pad preview](docs/previews/dpad.png)

### HA Plooum GridIcons Card
Rangée compacte d'icônes d'entités dans un pill container, avec couleurs d'état et actions tap/hold.

![GridIcons preview](docs/previews/gridicons.png)

### HA Plooum Multi Status Card
Carte compacte pour suivre plusieurs entités booléennes (lumière, pompe, CO2...) autour d'une valeur principale (ex. température).

![Multi Status preview](docs/previews/multistatus.png)

### Ha Plooum Tabs Card
Organise d'autres cartes en onglets, en gardant leur état en mémoire (idéal pour les flux caméra).

*(pas d'aperçu disponible pour cette carte)*

### Ha Plooum Room Temp & Humidity Card
Carte compacte température/humidité avec icône principale et actions granulaires par capteur.

![Temp & Humidity preview](docs/previews/temp-humidity.png)

---

## Installation

### Méthode 1 : HACS (recommandé)
1. Ouvre **HACS** dans Home Assistant.
2. Va dans **Frontend**.
3. Clique sur les trois points en haut à droite > **Dépôts personnalisés (Custom repositories)**.
4. Ajoute l'URL de ce dépôt (`https://github.com/plooum/HA-Plooum-Cards`) et choisis la catégorie **Plugin**.
5. Clique sur **Ajouter**, recherche `HA Plooum Cards`, puis clique sur **Télécharger**.
6. Recharge ton navigateur.

### Méthode 2 : Installation manuelle
1. Télécharge le fichier `ha-plooum-cards.js` depuis la dernière release.
2. Copie-le dans ton répertoire `www` (ex. `/config/www/ha-plooum-cards.js`).
3. Ajoute la resource dans **Paramètres > Tableaux de bord > Ressources** :
   ```yaml
   resources:
     - url: /local/ha-plooum-cards.js
       type: module
   ```

Une fois la resource chargée, chaque carte apparaît séparément dans le sélecteur de cartes de l'éditeur Lovelace (bouton **Ajouter une carte**) — tu choisis la carte voulue une par une, comme avec n'importe quelle carte custom.

---

## Développement

Toutes les cartes sont compilées ensemble en un seul fichier (`ha-plooum-cards.js`) via [Rollup](https://rollupjs.org/), à partir d'un point d'entrée unique ([src/index.js](src/index.js)) qui importe chaque carte. Chaque carte reste indépendante : son propre fichier source, son propre custom element, son propre enregistrement dans `window.customCards`.

```
src/
├── index.js                  # point d'entrée : importe toutes les cartes
└── cards/
    ├── button-badge/
    ├── cover/
    ├── dpad/
    ├── gridicons/
    ├── multistatus/
    ├── tabbed/
    └── temp-humidity/
```

### Builder localement

```bash
npm install
npm run build
```

Cela régénère `ha-plooum-cards.js` (et sa sourcemap) à la racine du dépôt.

### Tester localement

Le dossier [dev/](dev/) contient un Home Assistant de développement (sans Docker), avec des entités de test et un dashboard qui affiche toutes les cartes :

```bash
dev/ha.sh start   # puis ouvrir http://127.0.0.1:8123/plooum-test/all
```

Après un `npm run build`, il suffit de recharger la page. Le détail (entités, dashboards, commandes) est dans [CLAUDE.md](CLAUDE.md#testing).

### Ajouter une nouvelle carte

1. Crée un dossier `src/cards/<nom-carte>/` contenant le fichier source de la carte (avec son propre `customElements.define(...)` et son `window.customCards.push(...)`, en gardant les gardes d'existence `if (!customElements.get(...))` pour éviter les doublons).
2. Ajoute une ligne d'import dans [src/index.js](src/index.js) :
   ```js
   import './cards/<nom-carte>/<fichier>.js';
   ```
3. Lance `npm run build`.
4. Ajoute une entrée dans le tableau ci-dessus et un fichier `docs/<nom-carte>.md`.

Aucune autre configuration (pas de nouveau `rollup.config.mjs`, pas de nouvelle resource HACS) n'est nécessaire : tout reste dans le même bundle.

---

## Licence

[GPL-3.0](LICENSE)
