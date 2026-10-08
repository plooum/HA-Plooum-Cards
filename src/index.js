// Single entry point: imports every card so that they register themselves
// with Home Assistant (customElements.define + window.customCards).
//
// To add a new card:
// 1. Create a src/cards/<card-name>/ folder with the card's source file.
// 2. Add an import line below.
// That's it: the build (npm run build) regenerates ha-plooum-cards.js including the new card.

import './cards/button-badge/ha-plooum-buttonbadge-card.js';
import './cards/cover/ha-plooum-cover-card.js';
import './cards/dpad/ha-plooum-dpad-card.js';
import './cards/gridicons/ha-plooum-gridicons-card.js';
import './cards/multistatus/ha-plooum-multi-status-card.js';
import './cards/tabbed/ha-plooum-tabbed-card.js';
import './cards/temp-humidity/ha-plooum-temp-humidity-card.js';
