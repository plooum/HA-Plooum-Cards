// Point d'entrée unique : importe toutes les cartes pour qu'elles s'enregistrent
// auprès de Home Assistant (customElements.define + window.customCards).
//
// Pour ajouter une nouvelle carte :
// 1. Crée un dossier src/cards/<nom-carte>/ avec le fichier source de la carte.
// 2. Ajoute une ligne d'import ci-dessous.
// C'est tout : le build (npm run build) regénère ha-plooum-cards.js avec la carte en plus.

import './cards/button-badge/ha-plooum-buttonbadge-card.js';
import './cards/cover/ha-plooum-cover-card.js';
import './cards/dpad/ha-plooum-dpad-card.js';
import './cards/gridicons/ha-plooum-gridicons-card.js';
import './cards/multistatus/ha-plooum-multi-status-card.js';
import './cards/tabbed/ha-plooum-tabbed-card.js';
import './cards/temp-humidity/ha-plooum-temp-humidity-card.js';
