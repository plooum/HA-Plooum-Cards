# 28 — Traduire CLAUDE.md et les skills du projet en français

Dépôt : HA-Plooum-Cards, ton propre worktree. Charge les skills `pilot-subagent` et `pr-workflow`. Branche : `feature/francais-claude-md-skills`. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans la section Questions ouvertes de ton rapport et **arrête-toi** (n'attends pas, ne relance pas). **Voie rapide** : pas de HA, pas de suite de tests.

## Objectif (décision de l'utilisateur, fixe)

Depuis le 2026-10-14, **tout est en français dans ce dépôt, sauf le code et la documentation utilisateur**.
- Restent en anglais : le code (identifiants, commentaires, textes affichés par les cartes et leurs éditeurs), `README.md` et `docs/*.md`. `README.fr.md` reste en français.
- Passent en français : CLAUDE.md, les skills du projet, les fichiers du pilote, les prompts, les titres et descriptions de PR, les messages de commit.

## À faire

1. **CLAUDE.md** : traduis-le entièrement en français. Garde à l'identique les commandes, chemins, noms de fichiers, noms d'éléments, blocs de code, liens et le tableau des entités de test (traduis seulement la colonne « Use » et les en-têtes). Remplace la convention **English everywhere in cards and code** (section Conventions) par la nouvelle règle ci-dessus, et ajoute que les PR et les commits sont en français. Les notes de release étaient déjà en français : garde-le.
2. **Skills du projet** : `.claude/skills/pilot-ha-plooum/SKILL.md`, `pr-workflow/SKILL.md`, `ha-dev-testing/SKILL.md`, `floorplan-card/SKILL.md`. Traduis le corps et la `description` du frontmatter (elle sert à déclencher le skill : garde les mêmes mots-clés, en français). Ne change **pas** le `name`. Corrige toute consigne qui exige l'anglais pour les PR / commits / prompts (cherche `English` dans ces fichiers). « UI strings in English » reste vrai (c'est du code).
3. Ne change rien d'autre : pas de contenu ajouté ou supprimé, c'est une traduction. Aucun fichier sous `src/`, `docs/`, `dev/`, ni `README*.md`.

## Vérification (seulement celle-ci)

`grep -n -i "english" CLAUDE.md .claude/skills/*/SKILL.md` : chaque occurrence restante doit concerner le code ou la doc utilisateur ; colle la sortie dans ton rapport.

## PR

Titre et description en français, description terminée par la ligne d'attribution habituelle. Commit en français.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, la sortie du grep, les écarts, les Questions ouvertes, les Frictions.
