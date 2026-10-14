# 29 — claude-pilot : traduire les skills et les modèles en français

Dépôt : `~/git/claude-pilot` (plooum/claude-pilot). Travaille dans ce clone, **sans worktree**. Charge le skill `pilot-subagent`. Branche : `feature/francais` à partir d'un `origin/main` à jour. Ouvre la PR, **ne la fusionne jamais**. Si tu as besoin d'une réponse, mets la question dans tes Questions ouvertes et **arrête-toi**. **Voie rapide** : une traduction, pas de tests.

## Objectif (décision de l'utilisateur, fixe)

L'utilisateur veut **tout en français sauf le code et la documentation utilisateur**. Dans ce dépôt :
- **À traduire** : `skills/pilot/SKILL.md`, `skills/pilot-subagent/SKILL.md`, `AGENTS.md`, et tous les fichiers de `templates/` (`HANDOFF.md`, `BACKLOG.md`, `prompt.md`, `pilot-project-skill.md`, `CLAUDE-pilot-section.md`).
- **À garder tels quels** : `README.md` (documentation utilisateur), `LICENSE`, `install.sh` et `skills/pilot/agent_timing.py` (code), `.gitignore`.

## Règles de traduction

- Garde à l'identique les commandes, chemins, noms de fichiers, blocs de code, liens, noms de sections que les autres fichiers référencent (par ex. le handoff a des sections **Machines**, **State**, **Decisions**, **Next**, **Sub-agent notes** que le skill `pilot` cite : traduis-les **de façon cohérente** dans le skill et le modèle, par ex. **Machines**, **État**, **Décisions**, **Suite**, **Notes sur les sous-agents**).
- Frontmatter des skills : traduis la `description` (elle déclenche le skill : garde les mêmes déclencheurs, et **garde aussi les phrases anglaises de déclenchement** « you are the pilot », à côté de « tu es le pilote »). Ne change pas le `name`.
- Le skill `pilot` dit de parler à l'utilisateur dans sa langue et que sous-agents / code / commits / PR restent dans la langue du projet : garde ce principe (il est générique), formulé en français.
- Pas de contenu ajouté ni supprimé.

## Vérification (seulement celle-ci)

`grep -rn -i "english\|anglais" skills templates AGENTS.md` : colle la sortie et explique chaque occurrence restante en une ligne.

## PR

Titre, description et commit en français, description terminée par la ligne d'attribution habituelle.

## Rapport

Comme dans `pilot-subagent` : URL de la PR, ce qui a été fait, la sortie du grep, les écarts, les Questions ouvertes, les Frictions.
