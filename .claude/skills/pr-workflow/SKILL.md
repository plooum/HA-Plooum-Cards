---
name: pr-workflow
description: Spécificités de HA-Plooum-Cards pour un sous-agent qui livre un travail. À charger avec le skill global `pilot-subagent` pour toute tâche donnée par le pilote.
---

# Livrer un changement ici (sous-agent)

La branche, la PR, le format du rapport et les pièges du bac à sable sont dans le skill global `pilot-subagent`. Seules les spécificités de ce dépôt sont ici.

## Branche

- Dans un worktree, `dev/ha.sh start` te donne ton propre HA (port 8124+) qui sert ton bundle ; `dev/ha.sh stop` à la fin ; `dev/ha.sh setup` lie le venv et `node_modules` du checkout principal sans démarrer HA (voir `ha-dev-testing`).
- Une PR qui ajoute une dépendance npm : `npm install <paquet>` dans le worktree **avant** `dev/ha.sh start` / `setup` ; le worktree a alors son propre `node_modules` et celui du checkout principal n'est pas touché.
- Jamais `tags/` dans un nom de branche : HACS le retire et sa validation échoue.
- Le bundle (`ha-plooum-cards.js`, `.map`) est gitignored : `npm run build` pour tester, ne le commite jamais.
- Ne change pas `CARD_VERSION` : PR séparée.
- `node`, `npm`, `gh`, `uv` introuvables : ils sont dans `~/.local/bin` sur le portable (chemin complet).

## Conventions de code (CLAUDE.md)

- Le code reste en anglais : textes de l'interface, commentaires, identifiants. Tout le reste est en français : PR (titre et description), messages de commit, rapport, prompts.
- README.md et README.fr.md changent ensemble ; le comportement ou les options d'une carte vont dans `docs/<card>.md`.
- Problèmes hors périmètre : signale-les dans ton rapport ; TODO.md est laissé au pilote.

## Tests

- **Jamais le panneau navigateur intégré** : suites avec `dev/ui_test.py`, vérifications à la main avec `dev/shot.py --js ...`, les deux sans interface. Ils diffusent vers le tableau des agents (http://127.0.0.1:8120).
- Fichiers temporaires, scripts jetables et captures dans `dev/shots/` (gitignored), **pas dans le dossier scratchpad** : son chemin contient `-git-` (le dépôt est sous `~/git`), et le bac à sable refuse comme « trop complexe » une commande où un chemin ou une URL contient `git`.
- Une carte qui dépend de l'heure (ciel, horloge) : les tests tournent à l'heure réelle, souvent en plein jour ; une assertion sur ce qui est dessiné doit tenir à toute heure (prompt 32 : étoiles à opacité 0 le jour, mais présentes dans le DOM).
- **Ne lance que les tests de ce que tu changes** : le test de ta carte dans la suite de fumée (`--only <carte>:`) et la suite de ta fonctionnalité. Jamais toute la suite de fumée ni les suites des autres cartes, sauf si le prompt le demande.
- La suite est commitée avec la PR sous `dev/tests/<feature>.json` ; la section **Tested** du rapport est sa sortie collée en entier, avec ce chemin.
- CI = Build + Validate.
