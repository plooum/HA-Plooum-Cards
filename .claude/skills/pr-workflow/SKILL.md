---
name: pr-workflow
description: Spécificités de HA-Plooum-Cards pour un sous-agent qui livre un travail. À charger avec le skill global `pilot-subagent` pour toute tâche donnée par le pilote.
---

# Livrer un changement ici (sous-agent)

La branche, la PR, le format du rapport et les pièges du bac à sable sont dans le skill global `pilot-subagent`. Seules les spécificités de ce dépôt sont ici.

## Branche

- Dans un worktree, `dev/ha.sh start` te donne ton propre HA (port 8124+) qui sert ton bundle ; `dev/ha.sh stop` à la fin ; `dev/ha.sh setup` lie le venv et `node_modules` du checkout principal sans démarrer HA (voir `ha-dev-testing`).
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
- Fichiers temporaires et captures dans `dev/shots/` (gitignored).
- La suite est commitée avec la PR sous `dev/tests/<feature>.json` ; la section **Tested** du rapport est sa sortie collée en entier, avec ce chemin.
- CI = Build + Validate.
