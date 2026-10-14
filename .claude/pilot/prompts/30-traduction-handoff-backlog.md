# 30 — Traduire le handoff et le backlog du pilote en français

Dépôt : HA-Plooum-Cards, **checkout principal** (`/home/doudou/git/HA-Plooum-Cards`, sur `main`), **sans worktree, sans branche, sans commit** : le pilote commitera lui-même. Charge le skill `pilot-subagent` seulement pour le format du rapport. Si tu as besoin d'une réponse, mets la question dans tes Questions ouvertes et **arrête-toi**.

## Objectif (décision de l'utilisateur, fixe)

Les fichiers du pilote passent en français. Traduis **uniquement** ces deux fichiers, sur place :
- `.claude/pilot/HANDOFF.md`
- `.claude/pilot/BACKLOG.md`

## Règles

- Une traduction fidèle, sans résumer ni réorganiser : chaque ligne du tableau **State**, chaque décision datée reste, dans le même ordre.
- Garde à l'identique les liens, numéros de PR, noms de branches, chemins, commandes, blocs de code, noms de skills et noms de fichiers.
- Titres de sections : **Machines**, **État**, **Décisions (utilisateur)**, **Suite**, **Notes sur les sous-agents** (les mêmes que le modèle traduit de claude-pilot).
- Ne touche à **aucun autre fichier** (ni `ROADMAP.md`, déjà en français, ni `prompts/`).

## Vérification (seulement celle-ci)

`git diff --stat` ne montre que ces deux fichiers, et `grep -c "pull/" .claude/pilot/HANDOFF.md` donne le même nombre avant et après (note les deux valeurs).

## Rapport

Ce qui a été fait, les deux valeurs du grep, les écarts, les Questions ouvertes, les Frictions.
