# 33 — Carte ciel : de jour, fond bleu ciel et ciel toujours visible (voie rapide)

Dépôt : HA-Plooum-Cards, ton propre worktree. Charge les skills `pilot-subagent` (voie rapide), `pr-workflow` et `ha-dev-testing`. Branche : `feature/sky-day-visible`. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans les Questions ouvertes de ton rapport et **arrête-toi**. PR et commits en français ; code et docs en anglais.

## Objectif (décision de l'utilisateur, fixe)

De jour, le fond du dôme est **bleu ciel**, et l'on **voit quand même** les étoiles, les lignes et les noms des constellations (aujourd'hui ils s'effacent à opacité 0).

## Conception (choix du pilote, ne les rouvre pas)

Fichier `src/cards/sky/ha-plooum-sky-card.js` seulement (+ une phrase dans `docs/sky.md`, « How to read the dome », qui dit aujourd'hui qu'ils s'estompent).

- `SKY_COLORS` (~ligne 26) : la clé de jour (`6`) devient un bleu ciel franc : zénith `[78, 160, 230]`, horizon `[176, 222, 250]` ; la clé `0` reste une transition.
- `render()` (~ligne 269) : `dark` ne pilote plus l'opacité jusqu'à 0. Les groupes `.constellations`, `.names`, `.stars` (~lignes 289–298) gardent une opacité minimale de jour (étoiles 0.85, lignes 0.5, noms 0.7) ; ce qui change avec `dark` est leur **couleur** : la nuit comme aujourd'hui (étoiles blanches, lignes `#9fb4ff`, noms `#cfd8ff`), de jour un bleu marine (`#0d2a5c` pour les étoiles, `#1d3f7a` pour les lignes et noms), interpolés selon `dark` (calcule les couleurs en JS et passe-les en `fill` / `stroke` sur les groupes ; retire les couleurs fixes du CSS ~lignes 356–363).
- Planètes et Lune : leurs libellés `.label` (blanc à contour sombre) restent lisibles sur le bleu ; ne touche à rien d'autre.

## Tests (seulement ceux-là)

1. Dans le test sky de `dev/tests/cards-smoke.json`, ajoute un assert : à midi (`S.C.skyAt(new Date('2026-06-21T12:00:00Z'), 48.86, 2.35)`), rien à vérifier côté calcul ; à la place, vérifie le **rendu** : impose à la première carte `_now = new Date('2026-06-21T12:00:00Z')`, `await updateComplete`, puis l'opacité du groupe `.stars` est `>= 0.8`. Remets `_now = new Date()` ensuite.
2. Suite smoke complète : tout PASS, colle la sortie.

**Capture (1)**, headless : `sky-day.png`, la vue `/plooum-test/sky` à midi à Paris (`_now` remplacé dans `--js` sur les deux cartes, ou seulement la première). Mets aussi à jour `docs/previews/sky.png` ? **Non** : l'aperçu reste de nuit.

À la fin, garde ta HA lancée.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, sortie des tests, chemin de la capture, écarts, Questions ouvertes, Frictions, chemin du worktree.
